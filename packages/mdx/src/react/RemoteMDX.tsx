import * as React from "react";

import { useMDXComponents } from "./useMDXComponents";
import { CustomComponentsProp } from "./MDXComponents";

/**
 * Represents a node in the serializable MDX AST.
 * This type matches the server's MDXNode type.
 */
export interface MDXNode {
  type: "element" | "text";
  name?: string;
  props?: Record<string, unknown>;
  children?: MDXNode[];
  value?: string;
}

/**
 * Compiled MDX content in serializable format.
 * This type matches the server's CompiledMDX type.
 */
export interface CompiledMDX {
  tree: MDXNode;
  frontmatter?: Record<string, unknown>;
}

/**
 * Props for the RemoteMDX component.
 */
export interface RemoteMDXProps {
  /** Pre-compiled MDX content */
  source: CompiledMDX;
  /** Override or provide custom components */
  components?: CustomComponentsProp;
}

/**
 * Renders a pre-compiled MDX AST node.
 */
function RenderMDXNode({
  node,
  components,
  index,
  isFirst,
  isLast,
}: {
  node: MDXNode;
  components: Record<string, React.ComponentType<any>>;
  index: number;
  isFirst: boolean;
  isLast: boolean;
}): React.ReactElement | null {
  // Text node
  if (node.type === "text") {
    return <>{node.value}</>;
  }

  // Element node
  if (node.type === "element" && node.name) {
    const { name, props = {}, children = [] } = node;

    // Resolve component
    let Component: React.ComponentType<any> | string;

    if (name === "Fragment") {
      // Handle React Fragment
      return (
        <>
          {children.map((child, i) => (
            <RenderMDXNode
              key={i}
              node={child}
              components={components}
              index={i}
              isFirst={i === 0}
              isLast={i === children.length - 1}
            />
          ))}
        </>
      );
    }

    // Check if it's an html.* prefixed element
    if (name.startsWith("html.")) {
      const htmlName = name.slice(5); // Remove 'html.' prefix
      Component = components[htmlName];
      if (!Component) {
        // Fallback to using the name as a string (for web DOM elements)
        Component = htmlName;
      }
    } else {
      // Custom component
      Component = components[name];
      if (!Component) {
        console.warn(
          `RemoteMDX: No component found for "${name}". ` +
            `Provide it via the components prop or MDXComponents context.`
        );
        // Render children without wrapper
        return (
          <>
            {children.map((child, i) => (
              <RenderMDXNode
                key={i}
                node={child}
                components={components}
                index={i}
                isFirst={i === 0}
                isLast={i === children.length - 1}
              />
            ))}
          </>
        );
      }
    }

    // Render children
    const renderedChildren = children.map((child, i) => (
      <RenderMDXNode
        key={i}
        node={child}
        components={components}
        index={i}
        isFirst={i === 0}
        isLast={i === children.length - 1}
      />
    ));

    // Add metadata props for headers (matching the local MDX behavior)
    const elementProps: Record<string, unknown> = {
      ...props,
      index,
      firstChild: isFirst,
      lastChild: isLast,
      // Pass the components object for nested resolution
      components,
    };

    return React.createElement(
      Component,
      elementProps,
      renderedChildren.length > 0 ? renderedChildren : undefined
    );
  }

  return null;
}

/**
 * Renders pre-compiled remote MDX content.
 *
 * Use this component to render MDX that was compiled on a server using `compileMDX`.
 * The compiled MDX is a JSON-serializable format that can be safely fetched and rendered.
 *
 * @example
 * ```tsx
 * import { RemoteMDX, useMDXFetch } from '@bacons/mdx';
 *
 * function BlogPost({ url }: { url: string }) {
 *   const { content, loading, error } = useMDXFetch(url);
 *
 *   if (loading) return <Text>Loading...</Text>;
 *   if (error) return <Text>Error: {error.message}</Text>;
 *   if (!content) return null;
 *
 *   return (
 *     <RemoteMDX
 *       source={content}
 *       components={{ CustomButton: MyButton }}
 *     />
 *   );
 * }
 * ```
 */
export function RemoteMDX({
  source,
  components: componentOverrides,
}: RemoteMDXProps): React.ReactElement {
  // Get components from context + overrides
  const contextComponents = useMDXComponents();
  const components = React.useMemo(
    () => ({
      ...contextComponents,
      ...componentOverrides,
    }),
    [contextComponents, componentOverrides]
  );

  const { tree } = source;

  return (
    <RenderMDXNode
      node={tree}
      components={components}
      index={0}
      isFirst={true}
      isLast={true}
    />
  );
}

/**
 * State returned by useMDXFetch hook.
 */
export interface UseMDXFetchResult {
  /** The compiled MDX content, or null if loading/error */
  content: CompiledMDX | null;
  /** True while fetching */
  loading: boolean;
  /** Error if fetch failed */
  error: Error | null;
  /** Refetch the content */
  refetch: () => void;
}

/**
 * Fetches and parses compiled MDX from a URL.
 *
 * The URL should return JSON in the CompiledMDX format (as produced by `compileMDX`).
 *
 * @example
 * ```tsx
 * function BlogPost({ slug }: { slug: string }) {
 *   const { content, loading, error } = useMDXFetch(
 *     `https://api.example.com/posts/${slug}.json`
 *   );
 *
 *   if (loading) return <ActivityIndicator />;
 *   if (error) return <Text>Failed to load post</Text>;
 *   if (!content) return null;
 *
 *   return <RemoteMDX source={content} />;
 * }
 * ```
 */
export function useMDXFetch(url: string): UseMDXFetchResult {
  const [content, setContent] = React.useState<CompiledMDX | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchContent = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch MDX: ${response.status}`);
      }

      const data = await response.json();

      // Validate the response has the expected structure
      if (!data || typeof data !== "object" || !data.tree) {
        throw new Error("Invalid MDX response format");
      }

      setContent(data as CompiledMDX);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setContent(null);
    } finally {
      setLoading(false);
    }
  }, [url]);

  React.useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return { content, loading, error, refetch: fetchContent };
}
