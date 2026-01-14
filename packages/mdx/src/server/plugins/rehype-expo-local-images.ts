import type { Element, Properties, Root } from "hast";
import { visit } from "unist-util-visit";

export interface RehypeExpoLocalImagesOptions {
  /**
   * @returns true if the src reference should be converted to a local `require`.
   * @default Function that matches strings starting with `.` or `@`.
   */
  matchLocalAsset?: (props: { src: string }) => boolean;
}

/**
 * Replace local image sources with inline require statements.
 * This allows MDX to source the React Native system of loading local images.
 */
export function rehypeExpoLocalImages({
  matchLocalAsset = (props) => !!props.src.match(/^[.@]/),
}: RehypeExpoLocalImagesOptions = {}) {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (
        node.tagName === "img" &&
        imageHasStringSource(node.properties) &&
        matchLocalAsset(node.properties) &&
        !node.properties.src.startsWith("require(")
      ) {
        node.properties.src = `require("${node.properties.src}")`;
      }
    });
  };
}

function imageHasStringSource(
  properties: Properties
): properties is { src: string } {
  return "src" in properties && typeof properties.src === "string";
}
