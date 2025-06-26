import visit from "unist-util-visit";

/**
 * This simple plugin appends the code block meta to the node value.
 */
export default function remarkLinkRewrite() {
  return (tree: any, file: any) => {
    if (!file.cwd || !file.history || !file.history.length) {
      return;
    }

    visit(tree, "code", (node: any) => {
      if (node.meta) {
        node.value = "@@@" + node.meta + "@@@" + node.value;
      }
    });
  };
}

// @ts-ignore
module.exports = remarkLinkRewrite;
