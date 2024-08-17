import * as React from "react";

import { getUniversalComponents } from "./getUniversalComponents";
import { ComponentKeys } from "./getDOMComponents";

type Elements = Record<
  keyof ReturnType<typeof getUniversalComponents>,
  React.ComponentType<any>
>;

export const MDXComponentsContext = React.createContext<Elements>(
  getUniversalComponents()
);

export function useInternalMDXComponents() {
  const context = React.useContext(MDXComponentsContext);
  if (!context) {
    return getUniversalComponents();
  }
  return context;
}

export function MDXComponents({
  children,
  components,
  ...props
}: {
  children?: any;
  components?: Partial<
    Record<
      | ComponentKeys
      // Allow any arbitrary component to be passed in for use in MDX but don't allow it to show in the autocorrect.
      | (string & {}),
      React.ComponentType<any>
    >
  >;
} & Partial<Elements>) {
  const allProps = { ...props, ...components };
  const parent = useInternalMDXComponents();
  const value = React.useMemo(
    () => ({
      ...Object.keys({ ...allProps, ...parent }).reduce((acc, key) => {
        acc[key] = allProps[key] ?? parent[key];
        return acc;
      }, {} as Elements),
    }),
    [parent, allProps]
  );
  return (
    <MDXComponentsContext.Provider value={value}>
      {children}
    </MDXComponentsContext.Provider>
  );
}
