import React, { Component } from 'react';
import SVG from 'svg.js';
import tinycolor from 'tinycolor2';
import math from 'mathjs';

import Names from './Names';
import './Path.css';

class Path extends Component {
  constructor(props) {
    super(props);
    this.id = this.props.id;
    this.data = this.props.data;
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
    const maxScale = 0.667;
    const size = window.innerHeight * 0.5;
    let bb;
    const _draw = SVG('svgs').size(size, size);
    const noBg = math.randomInt(1);

    _draw.rect(size, size).fill(this.state.bgColor).move(0, 0);
    _draw.click(() => this.swapColors(_draw.node));
    //_draw.mousemove(function(e) { updateColor(this, e); });

    const _drawnPath = _draw.path(this.data);
    _drawnPath.fill(this.state.fgColor);
    bb = _drawnPath.bbox();

    const widthScale = maxScale / (bb.w / size);
    const heightScale = maxScale / (bb.h / size);
    _drawnPath.scale(widthScale, heightScale);
    bb = _drawnPath.bbox();

    const xMove = _drawnPath.transform().x + ((size - bb.w) / 2) - bb.x;
    const yMove =  _drawnPath.transform().y + ((size - bb.h) / 2) - bb.y;
    _drawnPath.translate(xMove, yMove);
    this.svg = _draw;
  }

  render() {
    return (
      <div className="PathControl">
        <div className="PathControlInner">
          <div className="input-group">
            <Names id={this.id} />
          </div>
        </div>
        <div className="PathControlInner">
          <div className="input-group">
            <button className="btn btn-secondary" type="button" onClick={() => this.saveSVG()}>Save As SVG</button>
          </div>
          <div className="input-group">
            <button className="btn btn-secondary" type="button" onClick={() => this.savePNG()}>Save As PNG</button>
          </div>
        </div>
      </div>
    );
  }
};

export default Path;