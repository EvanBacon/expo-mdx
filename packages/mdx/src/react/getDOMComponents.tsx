// @ts-expect-error: untyped bundler global
import registry from "@react-native/assets-registry/registry";
import React, { Children } from "react";
import { resolveAssetUrl } from "./resolveAssetUrl";

export const OrderContext = React.createContext<{
  index: number;
  firstChild: boolean;
  lastChild: boolean;
  firstOfType: boolean;
  prevSibling: string;
} | null>(null);

function MDImage({ src, ...props }: React.ComponentProps<"img">) {
  const resolvedSrc = React.useMemo(() => resolveAssetUrl(src), [src]);
  return (
    <img
      width={resolvedSrc.width}
      height={resolvedSrc.height}
      {...props}
      src={resolvedSrc.uri}
    />
  );
}

const HTML_KEYS = [
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
] as const;

export type ComponentKeys =
  | "Wrapper"
  | "inlineCode"
  | (typeof HTML_KEYS)[number];

/**
 * Get base elements that work natively to the browser. If the native app has any of these views built-in, then they can be used there too.
 */
export function getDOMComponents(): Record<
  ComponentKeys,
  React.ComponentType<any>
> {
  const passthroughElements = HTML_KEYS.map((elementName) => [
    elementName,
    stripExtras(elementName),
  ]);

  return {
    // Defaults to ensure web always works since this is a web-first feature.
    // Native can be extended as needed.
    ...Object.fromEntries(passthroughElements),

    Wrapper: RootWrapper,
    inlineCode: stripExtras("code"),
    img: stripExtras(MDImage, "img"),
  };
}

export function RootWrapper({ children }: { children?: React.ReactNode }) {
  const prevChildTypes = ["root"];
  const childrenCount = Children.count(children);
  return Children.map(children, (child, index) => {
    if (!React.isValidElement(child) || typeof child === "string") {
      return child;
    }
    const prevSibling = prevChildTypes[prevChildTypes.length - 1];
    // @ts-expect-error
    const mdxType = child?.props.mdxType || "element";
    const isFirstOfType = prevChildTypes[prevChildTypes.length - 1] !== mdxType;
    prevChildTypes.push(mdxType);

    return (
      <OrderContext
        value={{
          index,
          firstChild: index === 0,
          lastChild: index === childrenCount - 1,
          firstOfType: isFirstOfType,
          prevSibling,
        }}
      >
        {child}
      </OrderContext>
    );
  });
}

export function useOrder() {
  return React.use(OrderContext);
}

export function stripExtras(Element: any, displayName?: string) {
  function E({
    firstChild,
    lastChild,
    firstOfType,
    index,
    prevSibling,
    parentName,
    ...props
  }: any) {
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
