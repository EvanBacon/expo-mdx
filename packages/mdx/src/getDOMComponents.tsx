import React, { Children } from "react";

export const OrderContext = React.createContext<{
  index: number;
  firstChild: boolean;
  lastChild: boolean;
  firstOfType: boolean;
  prevSibling: string;
} | null>(null);

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
    "inlineCode",
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
