import type { Root } from "hast";

import { hastToCompiledMDX, type CompiledMDX } from "./compile-to-ast";
import { rehypePrefixTagNames } from "./plugins/rehype-prefix-tag-names";
import { rehypeStripTableWhitespace } from "./plugins/rehype-strip-table-whitespace";

export type { CompiledMDX, MDXNode } from "./compile-to-ast";

/**
 * Options for compiling MDX to a serializable format.
 */
export interface CompileMDXOptions {
  /** Remark plugins to apply (markdown AST transformations) */
  remarkPlugins?: any[];
  /** Additional rehype plugins to apply (HTML AST transformations) */
  rehypePlugins?: any[];
}

/**
 * Internal rehype plugin that captures the HAST tree before it's converted to JS.
 * This is the key to getting a serializable output instead of executable code.
 */
function rehypeCaptureTree(captured: { tree: Root | null }) {
  return (tree: Root) => {
    captured.tree = tree;
  };
}

/**
 * Compiles MDX source code to a serializable AST format.
 *
 * This function is designed for server-side use. It processes MDX through
 * remark and rehype plugins, then converts the resulting HAST to a JSON-
 * serializable format that can be rendered on the client.
 *
 * @example
 * ```ts
 * // In an API route or server function
 * import { compileMDX } from '@bacons/mdx/server';
 *
 * const mdxSource = `
 * # Hello World
 *
 * This is **bold** text.
 * `;
 *
 * const compiled = await compileMDX(mdxSource);
 * // Returns JSON that can be cached and served via CDN
 * ```
 *
 * @param source - MDX source code to compile
 * @param options - Compilation options
 * @returns Compiled MDX in serializable format
 */
export async function compileMDX(
  source: string,
  options: CompileMDXOptions = {}
): Promise<CompiledMDX> {
  const { remarkPlugins = [], rehypePlugins = [] } = options;

  // Import MDX compiler dynamically (ESM)
  const { createProcessor } = await import("@mdx-js/mdx");

  // Capture the HAST tree before JS conversion
  const captured: { tree: Root | null } = { tree: null };

  // Create a processor that stops at HAST level
  // We use the same plugins as the Metro transformer (except recma)
  // but add a capture plugin to get the tree before JS generation
  const processor = createProcessor({
    remarkPlugins,
    rehypePlugins: [
      // Strip table whitespace first (same as Metro transformer)
      rehypeStripTableWhitespace,
      // Prefix HTML tags with html. (same as Metro transformer)
      [rehypePrefixTagNames, { prefix: "html." }],
      // User-provided rehype plugins
      ...rehypePlugins,
      // Capture the final HAST tree
      rehypeCaptureTree.bind(null, captured),
    ],
    // Note: We don't include recmaPlugins because we're not generating JS
    // The recma plugin is only needed for the Metro transformer
  });

  let vfile: any;

  try {
    vfile = await processor.process(source);
  } catch (error: any) {
    const errMsg = `Failed to compile remote MDX: ${error?.message || error}`;
    const newError = new Error(errMsg);
    (newError as any).cause = error;
    throw newError;
  }

  if (!captured.tree) {
    throw new Error("Failed to capture HAST tree during MDX compilation");
  }

  // Extract frontmatter from vfile data if available
  const frontmatter = vfile.data?.frontmatter as
    | Record<string, unknown>
    | undefined;

  // Convert HAST to our serializable format
  return hastToCompiledMDX(captured.tree, frontmatter);
}
