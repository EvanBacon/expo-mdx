import React from "react";
import { useMDXComponents as useInternalMDXComponents } from "./MDXComponents";
import { useMDXStyles } from "./MDXStyles";

/** Get the composed MDX elements. */
export function useMDXComponents() {
  const styles = useMDXStyles();
  const components = useInternalMDXComponents();
  // Mix the context styles into the components
  return Object.keys(components).reduce((acc, key) => {
    acc[key] = (props) => {
      if (typeof components[key] === "function") {
        return components[key]({ ...props, style: styles[key] });
      }
      return React.createElement(components[key], {
        ...props,
        style: styles[key],
      });
    };
    return acc;
  }, {});
}
