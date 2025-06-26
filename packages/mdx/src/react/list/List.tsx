import { Text, View, ViewProps, TextProps } from "@bacons/react-views";
import React, { ComponentType, PropsWithChildren } from "react";
import { Platform } from "react-native";

function createView(nativeProps: ViewProps = {}): ComponentType<ViewProps> {
  return function IView(props: ViewProps) {
    return <View {...nativeProps} {...props} />;
  };
}

export const UL = createView(
  Platform.select({
    web: {
      role: "list",
    },
  })
);

type LIProps = TextProps | ViewProps;

export function LI(props: PropsWithChildren<LIProps>) {
  const accessibilityRole = Platform.select({
    web: "listitem",
    default: props.accessibilityRole ?? props.role,
  });
  // @ts-expect-error
  return <Text {...props} role={accessibilityRole} />;
}
