import type { Element } from "hast";
import visit from "unist-util-visit";

/**
 * Rewrite the HTML tag names with a specific prefix to avoid using React DOM inside React Native contexts.
 */
export function rehypePrefixTagNames({
  prefix = "html.",
}: { prefix?: string } = {}) {
  return (tree) => {
    visit<Element>(tree, "element", (node) => {
      if (!node.tagName.startsWith(prefix)) {
        node.tagName = `${prefix}${node.tagName}`;
      }
    });
  };
}
