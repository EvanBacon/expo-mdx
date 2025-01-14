import { Text, View, ViewProps, TextProps } from "@bacons/react-views";
import React, { ComponentType, forwardRef, PropsWithChildren } from "react";
import { Platform } from "react-native";

function createView(nativeProps: ViewProps = {}): ComponentType<ViewProps> {
  return forwardRef((props: ViewProps, ref) => {
    return <View {...nativeProps} {...props} ref={ref} />;
  }) as ComponentType<ViewProps>;
}

export const UL = createView(
  Platform.select({
    web: {
      role: "list",
    },
  })
);

type LIProps = TextProps | ViewProps;

export const LI = forwardRef((props: PropsWithChildren<LIProps>, ref: any) => {
  const accessibilityRole = Platform.select({
    web: "listitem",
    default: props.accessibilityRole ?? props.role,
  });
  // @ts-expect-error
  return <Text {...props} role={accessibilityRole} ref={ref} />;
}) as ComponentType<LIProps>;
