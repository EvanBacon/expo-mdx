import { Text, TextProps, View, ViewProps } from "@bacons/react-views";
import React, { ComponentType, forwardRef } from "react";
import { StyleSheet } from "react-native";

import { em } from "../units";

// Based on the grid columns, set the minimum width of the table cells
const GridContext = React.createContext<{
  updateGrid: (props: { width: number; column: number }) => void;
  grid: { width: number; column: number }[];
}>({ updateGrid: () => {}, grid: [] });

function GridProvider({ children }) {
  const [grid, setGrid] = React.useState<{ width: number; column: number }[]>(
    []
  );
  const updateGrid = React.useCallback(
    (props: { width: number; column: number }) => {
      console.log("updateGrid", props);
      setGrid((grid) => [...grid, props]);
    },
    []
  );
  return (
    <GridContext.Provider value={{ updateGrid, grid }}>
      {children}
    </GridContext.Provider>
  );
}

function MeasuredView(props) {
  if (props._column === undefined) {
    return <View {...props} />;
  }
  return <_MeasuredView {...props} />;
}

function _MeasuredView(props) {
  const { updateGrid, grid } = React.useContext(GridContext);
  const minWidth = grid.reduce((acc, { width, column }) => {
    if (column === props._column) {
      return Math.max(acc, width);
    }
    return acc;
  }, 0);
  const isLongest = grid.every(
    ({ width, column }) => column !== props._column || width <= minWidth
  );
  const [width, setWidth] = React.useState(0);
  const onLayout = React.useCallback(
    (event) => {
      const { width } = event.nativeEvent.layout;
      if (width < minWidth) {
        setWidth(minWidth);
        return;
      }

      setWidth(width);
      updateGrid({ width, column: props._column });
    },
    [updateGrid, minWidth, props._column]
  );

  return (
    <View
      onLayout={onLayout}
      style={[!isLongest && { minWidth: width }, props.style]}
    >
      {props.children}
    </View>
  );
}

function ViewOrText({ children, ...props }: ViewProps | TextProps) {
  const _children = React.Children.map(children, (child, index) => {
    console.log("child", child);
    if (typeof child === "string") {
      return (
        <Text key={index} {...props}>
          {child}
        </Text>
      );
    }
    return (
      <MeasuredView key={index} {...props}>
        {child}
      </MeasuredView>
    );
  });
  return <>{_children}</>;
}

type TableTextProps = TextProps & {
  /** @platform web */
  colSpan?: number | string;
  /** @platform web */
  rowSpan?: number | string;
};

export const Table = forwardRef((props: ViewProps, ref) => {
  return (
    <GridProvider>
      <ViewOrText testID="table" {...props} ref={ref} />
    </GridProvider>
  );
}) as ComponentType<ViewProps>;

export const THead = forwardRef((props: ViewProps, ref) => {
  // Remap children adding `_column` to each child
  const children = React.Children.map(props.children, (child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { _column: index });
    }
    return child;
  });
  return (
    <ViewOrText
      testID="thead"
      {...props}
      children={children}
      style={[styles.thead, props.style]}
      ref={ref}
    />
  );
}) as ComponentType<ViewProps>;

export const TBody = forwardRef((props: ViewProps, ref) => {
  // Remap children adding `_column` to each child
  const children = React.Children.map(props.children, (child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { _column: index });
    }
    return child;
  });
  return (
    <ViewOrText
      testID="tbody"
      {...props}
      children={children}
      style={[styles.tbody, props.style]}
      ref={ref}
    />
  );
}) as ComponentType<ViewProps>;

export const TFoot = forwardRef((props: ViewProps, ref) => {
  // Remap children adding `_column` to each child
  const children = React.Children.map(props.children, (child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { _column: index });
    }
    return child;
  });
  return (
    <ViewOrText
      testID="tfoot"
      {...props}
      children={children}
      style={[styles.tfoot, props.style]}
      ref={ref}
    />
  );
}) as ComponentType<ViewProps>;

export const TH = forwardRef((props: TableTextProps, ref: any) => {
  console.log("TH", props);
  return (
    <ViewOrText
      testID="th"
      {...props}
      style={[styles.th, props.style]}
      ref={ref}
    />
  );
}) as ComponentType<TableTextProps>;

export const TR = forwardRef((props: ViewProps, ref) => {
  console.log("TR ->", props);
  // Remap children adding `_column` to each child
  const children = React.Children.map(props.children, (child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { _column: index });
    }
    return child;
  });

  return (
    <MeasuredView column={props._column}>
      <ViewOrText
        testID="tr"
        {...props}
        children={children}
        style={[styles.tr, props.style]}
        ref={ref}
      />
    </MeasuredView>
  );
}) as ComponentType<ViewProps>;

export const TD = forwardRef((props: TableTextProps, ref: any) => {
  return (
    <ViewOrText
      testID="td"
      {...props}
      style={[styles.td, props.style]}
      ref={ref}
    />
  );
}) as ComponentType<TableTextProps>;

export const Caption = forwardRef((props: TextProps, ref: any) => {
  return (
    <ViewOrText
      testID="caption"
      {...props}
      style={[styles.caption, props.style]}
      ref={ref}
    />
  );
}) as ComponentType<TextProps>;

const styles = StyleSheet.create({
  caption: {
    textAlign: "center",
    fontSize: em(1) as number,
  },
  th: {
    textAlign: "center",
    fontWeight: "bold",
    // flex: 1,
    fontSize: em(1) as number,
  },
  thead: {
    flexDirection: "row",
  },
  tbody: {
    flexDirection: "row",
  },
  tfoot: {
    flexDirection: "row",
  },
  tr: {
    flexDirection: "row",
  },
  td: {
    // flex: 1,
    fontSize: em(1) as number,
  },
});
