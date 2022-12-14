import * as React from "react";

import { getBaseElements } from "./getBaseElements";

type Elements = Record<keyof ReturnType<typeof getBaseElements>, JSX.Element>;

export const MDXComponentsContext = React.createContext<Elements>(
  // @ts-expect-error
  getBaseElements()
);

export function useMDXComponents() {
  const context = React.useContext(MDXComponentsContext);
  if (!context) {
    return getBaseElements();
  }
  return context;
}

export function MDXComponents({
  children,
  ...props
}: { children?: any } & Partial<Elements>) {
  const parent = useMDXComponents();
  const value = React.useMemo(
    () => ({
      ...Object.keys({ ...props, ...parent }).reduce((acc, key) => {
        acc[key] = props[key] ?? parent[key];
        return acc;
      }, {} as Elements),
    }),
    [parent, props]
  );
  return (
    <MDXComponentsContext.Provider value={value}>
      {children}
    </MDXComponentsContext.Provider>
  );
}
