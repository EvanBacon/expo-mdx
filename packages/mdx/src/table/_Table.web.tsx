import React, { ComponentType, forwardRef } from "react";

import { View, ViewProps } from "@bacons/react-views";

function createView(
  nativeProps: ViewProps & { __element: string }
): ComponentType<ViewProps> {
  return forwardRef((props: ViewProps, ref) => {
    return <View {...nativeProps} {...props} ref={ref} />;
  }) as ComponentType<ViewProps>;
}

export const Table = createView({ __element: "table" });
Table.displayName = "Table";

export const THead = createView({ __element: "thead" });
THead.displayName = "THead";

export const TBody = createView({ __element: "tbody" });
TBody.displayName = "TBody";

export const TFoot = createView({ __element: "tfoot" });
TFoot.displayName = "TFoot";

export const TH = createView({ __element: "th" });
TH.displayName = "TH";

export const TR = createView({ __element: "tr" });
TR.displayName = "TR";

export const TD = createView({ __element: "td" });
TD.displayName = "TD";

export const Caption = createView({ __element: "caption" });
Caption.displayName = "Caption";
