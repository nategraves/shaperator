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
    this.state = {
      fgColor: '#ffffff',
      bgColor: '#000000',
      rotation: 0,
      name: ''
    };
    this.svg = null;
  }

  save() {
    console.log(`Saving...${this.state.name}.svg`);
  }

  componentWillUnmount() {
    this.svg.remove();
  }

  componentDidMount() {
    const maxScale = 0.667;
    const size = window.innerHeight * 0.5;
    let bb;
    const _draw = SVG('svgs').size(size, size);
    const color = tinycolor.random().toHexString();
    const white = '#ffffff';
    const noBg = math.randomInt(1);

    _draw.rect(size, size).fill(white).move(0, 0);
    //_draw.click(function() { customClick(this); });
    //_draw.mousemove(function(e) { updateColor(this, e); });

    const _drawnPath = _draw.path(this.data);
    _drawnPath.fill(color);
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
            <button className="btn btn-secondary" type="button" onClick={() => this.save()}>Save As SVG</button>
          </div>
          <div className="input-group">
            <button className="btn btn-secondary" type="button" onClick={() => this.save()}>Save As PNG</button>
          </div>
        </div>
      </div>
    );
  }
};

export default Path;