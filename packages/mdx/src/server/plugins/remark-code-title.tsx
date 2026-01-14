import type { Root, Code } from "mdast";
import { visit } from "unist-util-visit";

/**
 * This simple plugin appends the code block meta to the node value.
 */
export default function remarkLinkRewrite() {
  return (tree: Root, file: { cwd?: string; history?: string[] }) => {
    if (!file.cwd || !file.history || !file.history.length) {
      return;
    }

    visit(tree, "code", (node: Code) => {
      if (node.meta) {
        node.value = "@@@" + node.meta + "@@@" + node.value;
      }
    });
  };
}

// @ts-ignore
module.exports = remarkLinkRewrite;
