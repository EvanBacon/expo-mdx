import * as React from "react";

import { getUniversalComponents } from "./getUniversalComponents";
import { ComponentKeys } from "./getDOMComponents";

type Elements = Record<
  keyof ReturnType<typeof getUniversalComponents>,
  React.ComponentType<any>
>;

export type CustomComponentsProp = Partial<
  Record<
    | ComponentKeys
    // Allow any arbitrary component to be passed in for use in MDX but don't allow it to show in the autocorrect.
    | (string & {}),
    React.ComponentType<any>
  >
>;

export const MDXComponentsContext = React.createContext<Elements>(
  getUniversalComponents()
);

export function useInternalMDXComponents() {
  const context = React.use(MDXComponentsContext);
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
  components?: CustomComponentsProp;
} & Partial<Elements>) {
  const allProps = { ...props, ...components };
  const parent = useInternalMDXComponents();
  const value = React.useMemo(
    () => ({
      ...Object.keys({ ...allProps, ...parent }).reduce((acc, key) => {
        // @ts-expect-error
        acc[key] = allProps[key] ?? parent[key];
        return acc;
      }, {} as Elements),
    }),
    [parent, allProps]
  );
  return <MDXComponentsContext value={value}>{children}</MDXComponentsContext>;
}
