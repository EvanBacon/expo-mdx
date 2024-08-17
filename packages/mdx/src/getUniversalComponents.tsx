import { Image, Text, View } from "@bacons/react-views";
import * as htmlElements from "@expo/html-elements";
import React from "react";
import { Platform } from "react-native";

import { AutoImage } from "./AutoImage";
import * as headings from "./headings";
import * as List from "./list/List";

import {
  ComponentKeys,
  getDOMComponents,
  stripExtras,
} from "./getDOMComponents";

/**
 * Get base elements that are generally optimized for cross-platform usage.
 * These are less standard on the web as they use `react-native-web` wrappers,
 * but they will run on platforms that support React Native.
 */
export function getUniversalComponents(): Record<
  ComponentKeys,
  React.ComponentType<any>
> {
  return {
    // Defaults to ensure web always works since this is a web-first feature.
    // Native can be extended as needed.
    ...getDOMComponents(),

    ...Platform.select({
      native: {
        ul: List.UL,
        // TODO
        li: List.LI,
        // TODO
        ol: List.UL,
      },
    }),

    h1: wrapHeader(headings.H1),
    h2: wrapHeader(headings.H2),
    h3: wrapHeader(headings.H3),
    h4: wrapHeader(headings.H4),
    h5: stripExtras(headings.H5),
    h6: stripExtras(headings.H6),
    a: stripExtras(htmlElements.A),
    nav: stripExtras(htmlElements.Nav),
    footer: stripExtras(htmlElements.Footer),
    aside: stripExtras(htmlElements.Aside),
    header: stripExtras(htmlElements.Header),
    main: stripExtras(htmlElements.Main),
    article: stripExtras(htmlElements.Article),
    section: stripExtras(htmlElements.Section),

    p: Paragraph,
    b: stripExtras(htmlElements.B),
    s: stripExtras(htmlElements.S),
    i: stripExtras(htmlElements.I),
    q: stripExtras(htmlElements.Q),
    blockquote: stripExtras(htmlElements.BlockQuote),
    br: stripExtras(htmlElements.BR),
    mark: stripExtras(htmlElements.Mark),
    code: stripExtras(htmlElements.Code),
    // TODO
    inlineCode: stripExtras(htmlElements.Code),

    pre: stripExtras(htmlElements.Pre),
    time: stripExtras(htmlElements.Time),
    strong: stripExtras(htmlElements.Strong),
    del: stripExtras(htmlElements.Del),
    em: stripExtras(htmlElements.EM),

    hr: stripExtras(htmlElements.HR),
    div: Div,
    span: Text,
    img: Img,
  };
}

function Paragraph({ style, children }) {
  // NOTE(EvanBacon): Unclear why, but mdxjs is wrapping an image in a paragraph tag.
  // This can lead to nesting a div in a p on web, which is invalid.
  const image = React.Children.toArray(children).find((child) => {
    return typeof child === "object" && "props" in child && child.props.src;
  });
  if (image) {
    return <>{children}</>;
  }

  return <Text style={style} children={children} />;
}

function Div(props) {
  return <View {...props} style={[{ flex: 1 }, props.style]} />;
}

function Img({ src, style }) {
  const source = typeof src === "string" ? { uri: src } : src;
  if (Platform.OS === "web" || !source.uri) {
    return <Image source={source} style={style} />;
  }

  return <AutoImage style={style} source={source} />;
}

function wrapHeader(Element) {
  return function Header({
    firstChild,
    lastChild,
    firstOfType,
    index,
    prevSibling,
    ...props
  }) {
    const isFirst = index === 0;

    return (
      <Element
        {...props}
        style={[props.style, isFirst ? { marginTop: 0 } : {}]}
      />
    );
  };
}
