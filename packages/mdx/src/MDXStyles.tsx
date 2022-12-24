import { TextStyle } from "@expo/html-elements/build/primitives/Text";
import { ViewStyle } from "@expo/html-elements/build/primitives/View";
import * as React from "react";

import { getBaseElements } from "./getBaseElements";

// React.ComponentProps<RenderMdx>

type Styles = Partial<
  Record<keyof ReturnType<typeof getBaseElements>, TextStyle | ViewStyle>
>;

export const MDXStylesContext = React.createContext<Styles>({});

export function useMDXStyles() {
  return React.useContext(MDXStylesContext);
}

export function MDXStyles({ children, ...props }: { children?: any } & Styles) {
  const parent = useMDXStyles();
  const value = React.useMemo(
    () => ({
      ...Object.keys({ ...props, ...parent }).reduce((acc, key) => {
        const parentValue = parent[key];
        const childValue = props[key];
        if (typeof parentValue === "object" && typeof childValue === "object") {
          acc[key] = {
            ...parentValue,
            ...childValue,
          };
        } else {
          if (key in props) {
            acc[key] = childValue;
          } else if (key in parent) {
            acc[key] = parentValue;
          }
        }
        return acc;
      }, {} as Styles),
    }),
    [parent, props]
  );
  return (
    <MDXStylesContext.Provider value={value}>
      {children}
    </MDXStylesContext.Provider>
  );
}
