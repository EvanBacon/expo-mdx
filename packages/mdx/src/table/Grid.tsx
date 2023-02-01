import PropTypes from "prop-types";
import React, { Component } from "react";
import { View } from "react-native";

import style from "./style";

export default class Grid extends Component {
  static childContextTypes = {
    rntgAddRowToGrid: PropTypes.func,
    rntgMeasureCell: PropTypes.func,
  };

  columns = [];
  rowHeights = {};

  getChildContext() {
    return {
      rntgAddRowToGrid: this.addRowToGrid.bind(this),
      rntgMeasureCell: this.measureCell.bind(this),
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState) {
      if (
        !this.state ||
        Object.keys(nextState).join(".") !== Object.keys(this.state).join(".")
      ) {
        return true;
      }
      if (nextState.rowHeights) {
        for (let rowId of Object.keys(nextState.rowHeights)) {
          if (nextState.rowHeights[rowId] !== this.state.rowHeights[rowId]) {
            return true;
          }
        }
      }
    }
    return false;
  }

  get lastChild() {
    return this.props.children[this.props.children.length - 1];
  }

  addRowToGrid(row) {
    this.mapRowIntoColumns(row);
    this.updateIfRowIsLast(row);
  }

  measureCell(rowId, cellId, x, y, w, h) {
    this.rowHeights[rowId] = Math.max(h, this.rowHeights[rowId] || 0);
    this.updateIfCellIsLast(rowId, cellId);
  }

  mapRowIntoColumns(row) {
    row.props.children.forEach((cell, index) => {
      if (!this.columns[index]) {
        this.columns[index] = [];
      }
      this.columns[index].push(cell);
    });
  }

  updateIfRowIsLast(row) {
    //if we have all rows, save the column structure into 'state' so
    //that we can render it
    if (row.props.id === this.lastChild.props.id) {
      this.setState({
        columns: this.columns,
      });
    }
  }

  updateIfCellIsLast(rowId, cellId) {
    if (rowId === this.lastChild.props.id) {
      const lastCell =
        this.lastChild.props.children[this.lastChild.props.children.length - 1];
      if (cellId === lastCell.props.id) {
        this.setState({
          rowHeights: { ...this.rowHeights },
        });
      }
    }
  }

  render() {
    if (!this.columns.length) {
      return <View style={style.grid}>{this.props.children}</View>;
    }
    return (
      <View style={[style.grid, style.gridColumn, this.props.style]}>
        {this.columns.map((col, i) => (
          <View key={i} style={[style.column]}>
            {col.map((cell, index) => (
              <View
                key={index}
                style={[
                  {
                    minHeight:
                      this.state.rowHeights && this.state.rowHeights[index + 1],
                  },
                ]}
              >
                {cell}
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  }
}
