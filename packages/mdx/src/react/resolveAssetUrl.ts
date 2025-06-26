// @ts-expect-error
import registry from "@react-native/assets-registry/registry";
import { PixelRatio } from "react-native";

const svgDataUriPattern = /^(data:image\/svg\+xml;utf8,)(.*)/;

/**
 * Given a Metro asset, return the server URL, e.g. `resolveAssetUrl(require('./image.png'))` -> `/assets/image.png`
 *
 * @param source The asset ID, or a string or object with a `uri` property.
 */
export function resolveAssetUrl(source: any): {
  uri: string;
  width?: number;
  height?: number;
} {
  let uri: string | null = null;
  let width: number | undefined;
  let height: number | undefined;
  if (typeof source === "number") {
    // get the URI from the packager
    let asset = registry.getAssetByID(source) as null | {
      name: string;
      type: string;
      scales: number[];
      width?: number;
      height?: number;
      httpServerLocation: string;
    };
    if (asset == null) {
      throw new Error(
        'Image: asset with ID "' +
          source +
          '" could not be found. Please check the image source.'
      );
    }
    let scale = asset.scales[0];
    if (asset.scales.length > 1) {
      const preferredScale = PixelRatio.get();
      // Get the scale which is closest to the preferred scale
      scale = asset.scales.reduce((prev, curr) =>
        Math.abs(curr - preferredScale) < Math.abs(prev - preferredScale)
          ? curr
          : prev
      );
    }
    const scaleSuffix = scale !== 1 ? "@" + scale + "x" : "";
    uri = asset
      ? asset.httpServerLocation +
        "/" +
        asset.name +
        scaleSuffix +
        "." +
        asset.type
      : "";

    width = asset.width;
    height = asset.height;
  } else if (typeof source === "string") {
    uri = source;
  } else if (source && typeof source.uri === "string") {
    // Expo SDK 52 and higher will return assets in ImageSource format.
    return source;
  }
  if (uri) {
    const match = uri.match(svgDataUriPattern);
    // inline SVG markup may contain characters (e.g., #, ") that need to be escaped
    if (match) {
      const prefix = match[1];
      const svg = match[2];
      const encodedSvg = encodeURIComponent(svg);
      return { uri: "" + prefix + encodedSvg };
    }
  } else {
    throw new Error('Unknown image source "' + source + '" used in MDX.');
  }
  return { uri, width, height };
}
