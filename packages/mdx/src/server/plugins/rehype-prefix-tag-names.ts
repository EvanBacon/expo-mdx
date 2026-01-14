import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";

/**
 * Rewrite the HTML tag names with a specific prefix to avoid using React DOM inside React Native contexts.
 */
export function rehypePrefixTagNames({
  prefix = "html.",
}: { prefix?: string } = {}) {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (!node.tagName.startsWith(prefix)) {
        node.tagName = `${prefix}${node.tagName}`;
      }
    });
  };
}
