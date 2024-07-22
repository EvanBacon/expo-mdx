import registry from "@react-native/assets-registry/registry";
import React, { Children } from "react";
import { PixelRatio } from "react-native";

export const OrderContext = React.createContext<{
  index: number;
  firstChild: boolean;
  lastChild: boolean;
  firstOfType: boolean;
  prevSibling: string;
} | null>(null);

function MDImage({ src, ...props }) {
  const resolvedSrc = React.useMemo(() => resolveAssetUri(src), [src]);

  return <img {...props} src={resolvedSrc ?? undefined} />;
}

const svgDataUriPattern = /^(data:image\/svg\+xml;utf8,)(.*)/;

function resolveAssetUri(source) {
  let uri: string | null = null;
  if (typeof source === "number") {
    // get the URI from the packager
    let asset = registry.getAssetByID(source);
    if (asset == null) {
      throw new Error(
        'Image: asset with ID "' +
          source +
          '" could not be found. Please check the image source or packager.'
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
  } else if (typeof source === "string") {
    uri = source;
  } else if (source && typeof source.uri === "string") {
    uri = source.uri;
  }
  if (uri) {
    const match = uri.match(svgDataUriPattern);
    // inline SVG markup may contain characters (e.g., #, ") that need to be escaped
    if (match) {
      const prefix = match[1];
      const svg = match[2];
      const encodedSvg = encodeURIComponent(svg);
      return "" + prefix + encodedSvg;
    }
  }
  return uri;
}

/**
 * Get base elements that work natively to the browser. If the native app has any of these views built-in, then they can be used there too.
 */
export function getDOMComponents() {
  const passthroughElements = [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "a",
    "nav",
    "footer",
    "aside",
    "header",
    "main",
    "article",
    "section",
    "p",
    "b",
    "s",
    "i",
    "q",
    "blockquote",
    "br",
    "mark",
    "code",

    "pre",
    "time",
    "strong",
    "del",
    "em",
    "hr",
    "div",
    "span",
    "img",

    "table",
    "thead",
    "tbody",
    "tfoot",
    "th",
    "tr",
    "td",
    "caption",

    // Task lists
    "sup",
    "ul",
    "li",
    "ol",
    "input",
  ].map((elementName) => [elementName, stripExtras(elementName)]);

  return {
    // Defaults to ensure web always works since this is a web-first feature.
    // Native can be extended as needed.
    ...Object.fromEntries(passthroughElements),

    Wrapper: RootWrapper,
    inlineCode: stripExtras("code"),
    img: stripExtras(MDImage, "img"),
  };
}

export function RootWrapper({ children }) {
  const prevChildTypes = ["root"];
  const childrenCount = Children.count(children);
  return Children.map(children, (child, index) => {
    if (typeof child === "string") {
      return child;
    }
    const prevSibling = prevChildTypes[prevChildTypes.length - 1];
    const mdxType = child.props.mdxType || "element";
    const isFirstOfType = prevChildTypes[prevChildTypes.length - 1] !== mdxType;
    prevChildTypes.push(mdxType);

    return (
      <OrderContext.Provider
        value={{
          index,
          firstChild: index === 0,
          lastChild: index === childrenCount - 1,
          firstOfType: isFirstOfType,
          prevSibling,
        }}
      >
        {child}
      </OrderContext.Provider>
    );
  });
}

export function useOrder() {
  return React.useContext(OrderContext);
}

export function stripExtras(Element, displayName?: string) {
  function E({
    firstChild,
    lastChild,
    firstOfType,
    index,
    prevSibling,
    parentName,
    ...props
  }) {
    return <Element {...props} />;
  }

  if (displayName != null) {
    E.displayName = displayName;
  } else if (typeof Element === "string") {
    E.displayName = Element;
  } else if ("displayName" in Element) {
    E.displayName = Element.displayName;
  }
  return E;
}
