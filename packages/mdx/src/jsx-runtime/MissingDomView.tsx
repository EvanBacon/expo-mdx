import React, { type ComponentType } from "react";
import type { ViewProps } from "react-native";

const NativeView = (props) => React.createElement("RCTView", props);
const Text = (props) => React.createElement("RCTText", props);

export function createMissingView(name: string) {
  const stackItem = (src) => {
    if (typeof src === "object" && src && "fileName" in src) {
      let trace = src.fileName;
      if ("lineNumber" in src) {
        trace += ":" + src.lineNumber;
      }
      if ("columnNumber" in src) {
        trace += ":" + src.columnNumber;
      }
      return trace;
    }
    return "";
  };

  // Add better errors and warnings in development builds.
  const View = function View(
    props: ViewProps & {
      // These are injected by the React babel plugin/preset. They may go away in React 19.
      $$source?: {
        lineNumber: number;
        columnNumber: number;
        fileName: string;
      };
    }
  ) {
    React.useEffect(() => {
      const { $$source } = props;
      console.error(
        `Unsupported DOM <${name} /> at: ${stackItem(
          $$source
        )}\nThis will break in production.`
      );
    }, []);
    const children = React.useMemo(() => {
      const children: any[] = [];
      React.Children.forEach(props.children, (child, index) => {
        if (child == null) {
          return;
        }
        if (typeof child === "string") {
          console.log("child.string", child);
          // Wrap children with Text to prevent cryptic React errors when we already have a useful warning about the missing DOM element.
          children.push(
            React.createElement(Text, { key: String(index) }, [child])
          );
        } else {
          console.log("child.other", child);
          children.push(child);
        }
      });
      return children;
    }, [props.children]);
    return React.createElement(NativeView, props, children);
  };

  // Make the component stack show the name of the missing dom element.
  View.displayName = `MISSING(${name})`;

  return View;
}
