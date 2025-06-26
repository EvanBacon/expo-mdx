import { TextStyle } from "@expo/html-elements/build/primitives/Text";
import { ViewStyle } from "@expo/html-elements/build/primitives/View";
import * as React from "react";

import { getUniversalComponents } from "./getUniversalComponents";

// React.ComponentProps<RenderMdx>

type Styles = Partial<
  Record<keyof ReturnType<typeof getUniversalComponents>, TextStyle | ViewStyle>
>;

export const MDXStylesContext = React.createContext<Styles>({});

export function useMDXStyles() {
  return React.use(MDXStylesContext);
}

export function MDXStyles({ children, ...props }: { children?: any } & Styles) {
  const parent = useMDXStyles();
  const value = React.useMemo(
    () => ({
      ...Object.keys({ ...props, ...parent }).reduce((acc, key) => {
        // @ts-expect-error
        const parentValue = parent[key];
        // @ts-expect-error
        const childValue = props[key];
        if (typeof parentValue === "object" && typeof childValue === "object") {
          // @ts-expect-error
          acc[key] = {
            ...parentValue,
            ...childValue,
          };
        } else {
          if (key in props) {
            // @ts-expect-error
            acc[key] = childValue;
          } else if (key in parent) {
            // @ts-expect-error
            acc[key] = parentValue;
          }
        }
        return acc;
      }, {} as Styles),
    }),
    [parent, props]
  );
  return <MDXStylesContext value={value}>{children}</MDXStylesContext>;
}
