import React, { type ComponentType } from "react";
import type { ViewProps } from "react-native";

const NativeView = (props) => React.createElement("RCTView", props);
const Text = (props) => React.createElement("RCTText", props);

export function createMissingView(name: string) {
  let View = NativeView as ComponentType<ViewProps>;

  if (__DEV__) {
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
    View = function View(props: ViewProps) {
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
            // Wrap children with Text to prevent cryptic React errors when we already have a useful warning about the missing DOM element.
            children.push(<Text key={String(index)}>{child}</Text>);
          } else {
            children.push(child);
          }
        });
        return children;
      }, [props.children]);
      return <NativeView {...props} children={children} />;
    };
  }

  // Make the component stack show the name of the missing dom element.
  View.displayName = `${name} (MISSING)`;

  return View;
}
