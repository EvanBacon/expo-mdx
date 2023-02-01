import { Image, Text, View } from "@bacons/react-views";
import * as htmlElements from "@expo/html-elements";
import React, { Children } from "react";
import { Platform } from "react-native";

import { AutoImage } from "./AutoImage";
import * as List from "./list/List";
import { Caption, Table, TBody, TD, TFoot, TH, THead, TR } from "./table/Table";

export function getBaseElements() {
  return {
    Wrapper: ({ children }) => {
      const prevChildTypes = ["root"];
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
            prevSibling,
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

    ul: List.UL,
    // TODO
    li: List.LI,
    // TODO
    ol: List.UL,

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

    table: Table,
    thead: THead,
    tbody: TBody,
    tfoot: TFoot,
    th: TH,
    tr: TR,
    td: TD,
    caption: Caption,

    div: Div,
    span: Text,

    img: Img,
  };
}

function Div(props) {
  return <View {...props} style={[{ flex: 1 }, props.style]} />;
}

function Img({ src, style }) {
  const source = typeof src === "string" ? { uri: src } : src;
  if (Platform.OS === "web") {
    return <Image source={source} style={style} />;
  }

  return <AutoImage style={style} source={source} />;
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
