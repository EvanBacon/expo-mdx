import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";

/**
 * HTML table elements (table, thead, tbody, tfoot, tr) cannot have whitespace
 * text nodes as direct children. This plugin removes whitespace-only text nodes
 * from these elements to prevent React hydration errors.
 */
const TABLE_ELEMENTS = new Set([
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "colgroup",
]);

export function rehypeStripTableWhitespace() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      // Check if this is a table-related element that cannot have whitespace children
      const tagName = node.tagName.replace(/^html\./, "");
      if (TABLE_ELEMENTS.has(tagName)) {
        // Filter out whitespace-only text nodes
        node.children = node.children.filter((child) => {
          if (child.type === "text") {
            // Remove if the text is only whitespace
            return !/^\s*$/.test(child.value);
          }
          return true;
        });
      }
    });
  };
}
