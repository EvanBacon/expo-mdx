import { Text, View } from "@bacons/react-views";
import * as htmlElements from "@expo/html-elements";
import React from "react";
import { StyleSheet, Platform } from "react-native";
import { Children } from "react";
import { AutoImage } from "./AutoImage";

export function getBaseElements() {
  return {
    Wrapper: ({ children }) => {
      let prevChildTypes = ["root"];
      const childrenCount = Children.count(children);
      return Children.map(children, (child, index) => {
        if (typeof child === "string") {
          return child;
        }
        const prevSibling = prevChildTypes[prevChildTypes.length - 1];
        const mdxType = child.props.mdxType || "element";
        const isFirstOfType =
          prevChildTypes[prevChildTypes.length - 1] !== mdxType;
        prevChildTypes.push(mdxType);
        return React.cloneElement(
          child,
          {
            ...child.props,
            index,
            firstChild: index === 0,
            lastChild: index === childrenCount - 1,
            firstOfType: isFirstOfType,
            prevSibling: prevSibling,
          },
          child.props.children
        );
      });
    },

    h1: wrapHeader(htmlElements.H1),
    h2: wrapHeader(htmlElements.H2),
    h3: wrapHeader(htmlElements.H3),
    h4: wrapHeader(htmlElements.H4),
    h5: htmlElements.H5,
    h6: htmlElements.H6,
    a: htmlElements.A,

    ul: htmlElements.UL,
    // TODO
    li: htmlElements.LI,
    // TODO
    ol: htmlElements.UL,

    nav: htmlElements.Nav,
    footer: htmlElements.Footer,
    aside: htmlElements.Aside,
    header: htmlElements.Header,
    main: htmlElements.Main,
    article: htmlElements.Article,
    section: htmlElements.Section,

    p: wrapHeader(htmlElements.P),
    b: htmlElements.B,
    s: htmlElements.S,
    i: htmlElements.I,
    q: htmlElements.Q,
    blockquote: htmlElements.BlockQuote,
    br: htmlElements.BR,
    mark: htmlElements.Mark,
    code: htmlElements.Code,
    // TODO
    inlineCode: htmlElements.Code,

    pre: htmlElements.Pre,
    time: htmlElements.Time,
    strong: htmlElements.Strong,
    del: htmlElements.Del,
    em: htmlElements.EM,

    hr: htmlElements.HR,

    table: htmlElements.Table,
    thead: htmlElements.THead,
    tbody: htmlElements.TBody,
    tfoot: htmlElements.TFoot,
    th: htmlElements.TH,
    tr: htmlElements.TR,
    td: htmlElements.TD,
    caption: htmlElements.Caption,
    div: Div,
    span: Text,

    img: Img,
  };
}

function Div(props) {
  return <View {...props} style={[{ flex: 1 }, props.style]} />;
}

function Img({ src, style }) {
  if (Platform.OS === "web") {
    return (
      <img src={src} style={StyleSheet.flatten([{ width: "100%" }, style])} />
    );
  }

  return <AutoImage style={style} source={{ uri: src }} />;
}

function wrapHeader(Element) {
  return function Header(props) {
    const isFirst = props.index === 0;

    return (
      <Element
        {...props}
        style={[props.style, isFirst ? { marginTop: 0 } : {}]}
      />
    );
  };
}
