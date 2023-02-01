import Cell from "./Cell";

import { Text } from "@bacons/react-views";
import Grid from "./Grid";
import Row from "./Row";

function renderTableCell(
  cell,
  row,
  column,
  rowCount,
  columnCount,
  output,
  state,
  styles
) {
  const cellStyle = [styles.tableCell];
  const contentStyle = [styles.tableCellContent];

  if (row % 2 == 0) {
    cellStyle.push(styles.tableCellEvenRow);
    contentStyle.push(styles.tableCellContentEvenRow);
  } else {
    cellStyle.push(styles.tableCellOddRow);
    contentStyle.push(styles.tableCellContentOddRow);
  }

  if (column % 2 == 0) {
    cellStyle.push(styles.tableCellEvenColumn);
    contentStyle.push(styles.tableCellContentEvenColumn);
  } else {
    cellStyle.push(styles.tableCellOddColumn);
    contentStyle.push(styles.tableCellContentOddColumn);
  }

  if (row == 1) {
    cellStyle.push(styles.tableHeaderCell);
    contentStyle.push(styles.tableHeaderCellContent);
  } else if (row == rowCount) {
    cellStyle.push(styles.tableCellLastRow);
    contentStyle.push(styles.tableCellContentLastRow);
  }

  if (column == columnCount) {
    cellStyle.push(styles.tableCellLastColumn);
    contentStyle.push(styles.tableCellContentLastColumn);
  }

  return (
    <Cell rowId={row} id={column} key={column} style={cellStyle}>
      <Text style={contentStyle}>{output(cell, state)}</Text>
    </Cell>
  );
}

export function Table() {
  return (
    <Grid key={state.key} style={styles.table}>
      {[
        <Row id={1} key={1}>
          {node.header.map((cell, column) =>
            renderTableCell(
              cell,
              1,
              column + 1,
              node.cells.length + 1,
              node.header.length,
              output,
              state,
              styles
            )
          )}
        </Row>,
      ].concat(
        node.cells.map((cells, row) => (
          <Row id={row + 2} key={row + 2}>
            {cells.map((cell, column) =>
              renderTableCell(
                cell,
                row + 2,
                column + 1,
                node.cells.length + 1,
                cells.length,
                output,
                state,
                styles
              )
            )}
          </Row>
        ))
      )}
    </Grid>
  );
}
