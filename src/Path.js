import React, { Component } from 'react';
import SVG from 'svg.js';
import tinycolor from 'tinycolor2';
import math from 'mathjs';
import FaArrowCircleODown from 'react-icons/lib/fa/arrow-circle-o-down';

import Names from './Names';
import './Path.css';

class Path extends Component {
  constructor(props) {
    super(props);
    this.data = this.props.data;
    this.id = this.props.id;
    this.names = this.props.names;

    const fgColor = this.props.fgColor || '#ffffff';
    const bgColor = this.props.bgColor || tinycolor.random().toHexString();
    this.state = {
      fgColor: fgColor,
      bgColor: bgColor,
      rotation: 0
    };
    this.svg = null;
  }

  saveSVG() {
    console.log(`Saving...${this.state.name}.svg`);
  }

  savePNG() {
    console.log(`Saving...${this.state.name}.png`);
  }

  swapColors(svg) {
    const elements = svg.childNodes;
    this.setState({
      fgColor: this.state.bgColor,
      bgColor: this.state.fgColor
    });
  
    elements.forEach((node) => {
      if (node.constructor.name === "SVGRectElement") {
        node.setAttribute("fill", this.state.bgColor);
      }
  
      if (node.constructor.name === "SVGPathElement") {
        node.setAttribute("fill", this.state.fgColor);
      }
    });
  }

  componentWillUnmount() {
    this.svg.remove();
  }

  componentDidMount() {
  }

  render() {
    return (
      <div className="PathControl">
        <div className="PathControlInner">
          <div className="input-group">
            <Names id={this.id} names={this.names} />
          </div>
        </div>
        <div className="PathControlInner">
          <div className="input-group">
            <button className="btn btn-secondary" type="button" onClick={() => this.saveSVG()}><FaArrowCircleODown/><br/>SVG</button>
            <button className="btn btn-secondary" type="button" onClick={() => this.savePNG()}><FaArrowCircleODown/><br/>PNG</button>
          </div>
        </div>
      </div>
    );
  }
};

export default Path;