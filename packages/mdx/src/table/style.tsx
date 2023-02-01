import { StyleSheet } from "react-native";

export default StyleSheet.create({
  grid: {
    flex: 1,
    flexDirection: "column",
    alignItems: "stretch",
    borderColor: "lightgrey",
    borderWidth: 1,
  },
  gridColumn: {
    flexDirection: "row",
  },
  row: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  column: {
    flexDirection: "column",
    flexGrow: 1,
    flexShrink: 1,
  },
  cell: {
    flexGrow: 1,
    padding: 4,
    borderColor: "lightgrey",
    borderBottomWidth: 1,
    borderRightWidth: 1,
  },
});
