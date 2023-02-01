import PropTypes from "prop-types";
import React, { Component } from "react";
import { View } from "react-native";

import style from "./style";

export default class Row extends Component {
  static propTypes = {
    children: PropTypes.arrayOf(PropTypes.element).isRequired,
    id: PropTypes.number.isRequired,
  };

  static contextTypes = {
    rntgAddRowToGrid: PropTypes.func,
  };

  static childContextTypes = {
    rntgrowId: PropTypes.number,
  };

  getChildContext() {
    return {
      rntgrowId: this.props.id,
    };
  }

  componentWillMount() {
    this.context.rntgAddRowToGrid(this);
  }

  render() {
    return <View style={style.row}>{this.props.children}</View>;
  }
}
