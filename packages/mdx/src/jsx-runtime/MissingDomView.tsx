import React, { type ComponentType } from "react";
import type { ViewProps } from "react-native";

const NativeView = (props) => React.createElement("RCTView", props);
const Text = (props) => React.createElement("RCTText", props);

class Try extends React.Component<
  React.PropsWithChildren<{
    catch: ComponentType<{ error: Error }>;
  }>,
  { error?: Error }
> {
  state = { error: undefined };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    const { error } = this.state;
    const { catch: ErrorBoundary, children } = this.props;
    if (!error) {
      return children;
    }
    return React.createElement(ErrorBoundary, { error });
  }
}

function ErrorBoundary({ error }) {
  if (error.message) {
    // When a DOM component is rendered inside a node module that shipped without the jsx-runtime, we can only intercept the error from the renderer.
    const invalidComponentName = error.message.match(
      /View config getter callback for component `([^`]+)`/
    )?.[1];
    // Prevent wrapping the error for rendering an undefined component.
    if (String(invalidComponentName) !== "undefined") {
      return React.createElement(Text, { style: { color: "red" } }, [
        `Unsupported DOM <${invalidComponentName} />`,
      ]);
    }
  }

  return React.createElement(Text, { style: { color: "red" } }, [
    error.message,
  ]);
}

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
    return React.createElement(
      NativeView,
      props,
      React.createElement(Try, { catch: ErrorBoundary }, children)
    );
  };

  // Make the component stack show the name of the missing dom element.
  View.displayName = `MISSING(${name})`;

  return View;
}
