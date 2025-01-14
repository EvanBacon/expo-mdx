import registry from "@react-native/assets-registry/registry";
import { PixelRatio } from "react-native";

const svgDataUriPattern = /^(data:image\/svg\+xml;utf8,)(.*)/;

/**
 * Given a Metro asset, return the server URL, e.g. `resolveAssetUrl(require('./image.png'))` -> `/assets/image.png`
 *
 * @param source The asset ID, or a string or object with a `uri` property.
 */
export function resolveAssetUrl(source: any): string | null {
  let url: string | null = null;
  if (typeof source === "number") {
    url = resolveAssetUrlFromNumericMetroId(source);
  } else if (typeof source === "string") {
    url = source;
  } else if (source && typeof source.uri === "string") {
    url = source.uri;
  }

  if (!url) {
    return url;
  }

  const match = url.match(svgDataUriPattern);
  // inline SVG markup may contain characters (e.g., #, ") that need to be escaped
  if (match) {
    const [, prefix, svg] = match;
    const encodedSvg = encodeURIComponent(svg);
    return `${prefix}${encodedSvg}`;
  }

  return url;
}

function resolveAssetUrlFromNumericMetroId(source: number): string {
  // get the URI from the packager
  const asset = registry.getAssetByID(source);
  if (asset == null) {
    throw new Error(
      `Image: asset with ID "${source}" could not be found. Please check the image source or packager.`
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
  const scaleSuffix = scale !== 1 ? `@${scale}x` : "";
  return asset
    ? `${asset.httpServerLocation}/${asset.name}${scaleSuffix}.${asset.type}`
    : "";
}
