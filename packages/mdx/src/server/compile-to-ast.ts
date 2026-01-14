import type { Root, Element, Text as HastText, RootContent } from "hast";

/**
 * Represents a node in the serializable MDX AST.
 */
export interface MDXNode {
  /** Node type: 'element' for HTML/component elements, 'text' for text content */
  type: "element" | "text";
  /** Element name (e.g., 'html.h1', 'Bacon'). Only present for element nodes. */
  name?: string;
  /** Element props. Only present for element nodes. */
  props?: Record<string, unknown>;
  /** Child nodes. Only present for element nodes. */
  children?: MDXNode[];
  /** Text content. Only present for text nodes. */
  value?: string;
}

/**
 * Compiled MDX content in serializable format.
 */
export interface CompiledMDX {
  /** The root node tree */
  tree: MDXNode;
  /** Extracted frontmatter data, if any */
  frontmatter?: Record<string, unknown>;
}

/**
 * MDX JSX Element node (custom components in MDX)
 */
interface MdxJsxElement {
  type: "mdxJsxFlowElement" | "mdxJsxTextElement";
  name: string | null;
  attributes: MdxJsxAttribute[];
  children: RootContent[];
}

interface MdxJsxAttribute {
  type: "mdxJsxAttribute";
  name: string;
  value: string | MdxJsxAttributeExpression | null;
}

interface MdxJsxAttributeExpression {
  type: "mdxJsxAttributeValueExpression";
  value: string;
}

/**
 * Converts MDX JSX attributes to props object.
 */
function convertMdxJsxAttributes(
  attributes: MdxJsxAttribute[]
): Record<string, unknown> {
  const props: Record<string, unknown> = {};

  for (const attr of attributes) {
    if (attr.value === null) {
      // Boolean attribute: <Component disabled />
      props[attr.name] = true;
    } else if (typeof attr.value === "string") {
      props[attr.name] = attr.value;
    } else if (attr.value?.type === "mdxJsxAttributeValueExpression") {
      // Expression attribute: <Component count={42} />
      // Try to parse simple literals, otherwise store as string
      try {
        props[attr.name] = JSON.parse(attr.value.value);
      } catch {
        // For complex expressions, store as string (limited support)
        props[attr.name] = attr.value.value;
      }
    }
  }

  return props;
}

/**
 * Converts a HAST (HTML AST) tree to a serializable MDXNode tree.
 * This format can be JSON-serialized and sent over the network.
 */
export function hastToMDXNode(node: RootContent): MDXNode | null {
  if (node.type === "text") {
    const textNode = node as HastText;
    // Skip whitespace-only text nodes
    if (!textNode.value.trim()) {
      return null;
    }
    return {
      type: "text",
      value: textNode.value,
    };
  }

  // Handle MDX JSX elements (custom components)
  if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
    const jsxNode = node as unknown as MdxJsxElement;

    // Fragment: name is null
    if (!jsxNode.name) {
      const children: MDXNode[] = [];
      for (const child of jsxNode.children || []) {
        const converted = hastToMDXNode(child);
        if (converted) {
          children.push(converted);
        }
      }
      // Return children directly for fragments (wrap in fragment element)
      return {
        type: "element",
        name: "Fragment",
        children,
      };
    }

    const children: MDXNode[] = [];
    for (const child of jsxNode.children || []) {
      const converted = hastToMDXNode(child);
      if (converted) {
        children.push(converted);
      }
    }

    const props = convertMdxJsxAttributes(jsxNode.attributes || []);

    const result: MDXNode = {
      type: "element",
      name: jsxNode.name,
    };

    if (Object.keys(props).length > 0) {
      result.props = props;
    }

    if (children.length > 0) {
      result.children = children;
    }

    return result;
  }

  if (node.type === "element") {
    const element = node as Element;
    const children: MDXNode[] = [];

    if (element.children) {
      for (const child of element.children) {
        const converted = hastToMDXNode(child);
        if (converted) {
          children.push(converted);
        }
      }
    }

    // Convert HAST properties to props
    const props: Record<string, unknown> = {};
    if (element.properties) {
      for (const [key, value] of Object.entries(element.properties)) {
        // Convert className to className (HAST uses className as an array)
        if (key === "className" && Array.isArray(value)) {
          props[key] = value.join(" ");
        } else {
          props[key] = value;
        }
      }
    }

    const result: MDXNode = {
      type: "element",
      name: element.tagName,
    };

    if (Object.keys(props).length > 0) {
      result.props = props;
    }

    if (children.length > 0) {
      result.children = children;
    }

    return result;
  }

  // Skip comments, doctype, etc.
  return null;
}

/**
 * Converts a HAST Root to a CompiledMDX structure.
 */
export function hastToCompiledMDX(
  tree: Root,
  frontmatter?: Record<string, unknown>
): CompiledMDX {
  const children: MDXNode[] = [];

  for (const child of tree.children) {
    const converted = hastToMDXNode(child);
    if (converted) {
      children.push(converted);
    }
  }

  // Wrap in a root div element
  const rootNode: MDXNode = {
    type: "element",
    name: "html.div",
    children,
  };

  const result: CompiledMDX = { tree: rootNode };

  if (frontmatter && Object.keys(frontmatter).length > 0) {
    result.frontmatter = frontmatter;
  }

  return result;
}
