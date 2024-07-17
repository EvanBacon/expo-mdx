import * as React from "react";

import { getUniversalComponents } from "./getUniversalComponents";

type Elements = Record<
  keyof ReturnType<typeof getUniversalComponents>,
  (props: any) => JSX.Element
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
  components?: Record<string, React.ReactNode>;
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
