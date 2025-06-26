import React from "react";

import { useInternalMDXComponents } from "./MDXComponents";
import { useMDXStyles } from "./MDXStyles";

/** Get the composed MDX elements. */
export function useMDXComponents() {
  const styles = useMDXStyles();
  const components = useInternalMDXComponents();
  // Mix the context styles into the components
  const obj = Object.keys(components).reduce((acc, key) => {
    // @ts-expect-error
    acc[key] = (props: any) => {
      // @ts-expect-error
      if (typeof components[key] === "function") {
        // @ts-expect-error
        return components[key]({ ...props, style: styles[key] });
      }
      // @ts-expect-error
      return React.createElement(components[key], {
        ...props,
        // @ts-expect-error
        style: styles[key],
      });
    };
    return acc;
  }, {});

  // Wrap with a proxy to add better error messages when a component is missing.
  return withProxyErrors(obj);
}

function withProxyErrors(components: Record<string, any>) {
  return new Proxy(components, {
    get(target, prop) {
      if (typeof prop !== "string") {
        return;
      }
      if (prop in target && target[prop]) {
        return target[prop];
      }
      // If the prop starts with a lowercase letter, it's not a missing built-in component (internal bug).
      if (prop[0].match(/[a-z]/)) {
        throw new Error(
          `No MDX component found for key: "${prop}". Define it using the React provider: <MDXComponents components={{ "${prop}": () => <Text ... /> }}>`
        );
      }
      // For components, depend on the transform to add the error message.
    },
  });
}
