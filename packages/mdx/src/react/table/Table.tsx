import { Text, View, ViewProps, TextProps } from "@bacons/react-views";
import React, { PropsWithChildren, createContext, useContext } from "react";
import { Platform, StyleSheet } from "react-native";

// Context to track header cells for proper rendering
const TableHeaderContext = createContext(false);

type TableProps = ViewProps & { components?: any };
type CellProps = TextProps & { components?: any };

// Table - container for the table
export function Table({
  children,
  components,
  ...props
}: PropsWithChildren<TableProps>) {
  return (
    <View {...props} style={[styles.table, props.style]}>
      {children}
    </View>
  );
}

// THead - table header group
export function THead({
  children,
  components,
  ...props
}: PropsWithChildren<TableProps>) {
  return (
    <TableHeaderContext.Provider value={true}>
      <View {...props} style={[styles.thead, props.style]}>
        {children}
      </View>
    </TableHeaderContext.Provider>
  );
}

// TBody - table body group
export function TBody({
  children,
  components,
  ...props
}: PropsWithChildren<TableProps>) {
  return (
    <View {...props} style={props.style}>
      {children}
    </View>
  );
}

// TFoot - table footer group
export function TFoot({
  children,
  components,
  ...props
}: PropsWithChildren<TableProps>) {
  return (
    <View {...props} style={[styles.tfoot, props.style]}>
      {children}
    </View>
  );
}

// TR - table row
export function TR({
  children,
  components,
  ...props
}: PropsWithChildren<TableProps>) {
  return (
    <View {...props} style={[styles.tr, props.style]}>
      {children}
    </View>
  );
}

// TH - table header cell
export function TH({
  children,
  components,
  style,
  ...props
}: PropsWithChildren<CellProps>) {
  const nativeProps: any = Platform.select({
    default: { accessibilityRole: "header" },
  });

  return (
    <View style={[styles.cell, styles.th, style]}>
      <Text {...nativeProps} {...props} style={styles.thText}>
        {children}
      </Text>
    </View>
  );
}

// TD - table data cell
export function TD({
  children,
  components,
  style,
  ...props
}: PropsWithChildren<CellProps>) {
  const isHeader = useContext(TableHeaderContext);

  const nativeProps: any = Platform.select({
    default: isHeader ? { accessibilityRole: "header" } : {},
  });

  // If in header context, render with header styling
  if (isHeader) {
    return (
      <View style={[styles.cell, styles.th, style]}>
        <Text {...nativeProps} {...props} style={styles.thText}>
          {children}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.cell, styles.td, style]}>
      <Text {...props} style={styles.tdText}>
        {children}
      </Text>
    </View>
  );
}

// Caption - table caption
export function Caption({
  children,
  components,
  ...props
}: PropsWithChildren<CellProps>) {
  return (
    <Text {...props} style={[styles.caption, props.style]}>
      {children}
    </Text>
  );
}

if (__DEV__) {
  Table.displayName = "Table";
  THead.displayName = "THead";
  TBody.displayName = "TBody";
  TFoot.displayName = "TFoot";
  TR.displayName = "TR";
  TH.displayName = "TH";
  TD.displayName = "TD";
  Caption.displayName = "Caption";
}

const styles = StyleSheet.create({
  table: {
    marginVertical: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 4,
    overflow: "hidden",
  },
  thead: {
    backgroundColor: "#f3f4f6",
  },
  tfoot: {
    backgroundColor: "#f9fafb",
  },
  tr: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  cell: {
    flex: 1,
    minWidth: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  th: {
    backgroundColor: "#f3f4f6",
  },
  thText: {
    fontWeight: "600",
    color: "#374151",
  },
  td: {},
  tdText: {
    color: "#4b5563",
  },
  caption: {
    paddingVertical: 8,
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
});
