import logo from './react.svg';
import math from 'mathjs';
import React, { Component } from 'react';
import SVG from 'svg.js';
import tinycolor from 'tinycolor2';
import _ from 'underscore';

import FaArrowCircleODown from 'react-icons/lib/fa/arrow-circle-o-down';
import TiArrowRightThick from 'react-icons/lib/ti/arrow-right-thick';

import './Home.css';

const PRELOAD_COUNT = 20;

class Home extends Component {
  constructor(props) {
    super(props);
    const fgColor = this.props.fgColor || '#ffffff';
    const bgColor = this.props.bgColor || tinycolor.random().toHexString();

    this.state = {
      bgColor,
      currentPath: null,
      currentNames: null,
      fgColor,
      name: '',
      named: false,
      pageToFetch: 1,
      pathId: null,
      pathPool: []
    };
    this.loading = true;
    this.svg = null;
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

  nextPath() {
    const pathPool = this.state.pathPool;
    const pathObj = pathPool.pop();
    const currentNames = pathObj.names;
    const currentPath = pathObj.d; 
    this.setState({
      pathPool,
      currentPath,
      currentNames
    });
    if (this.state.pathPool.length === 0) {
      this.updatePool();
    }
    this.drawSVG();
  }

  updateName(name) {
    this.setState({ name });
  }

  updatePool() {
    const url = `https://699de3fa.ngrok.io/api/paths?page=${this.state.pageToFetch}`;
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    fetch(url, {
      method: 'GET',
      headers: { Accept: "application/json" }
    }).then((resp) => { 
      return resp.json(); 
    }).then((resp) => {
      this.loading = false;
      const pathPool = resp.objects;
      const pathObj = pathPool.pop();
      const pathId = pathObj.id;
      const currentNames = pathObj.names;
      const currentPath = pathObj.d;
      const pageToFetch = this.state.pageToFetch + 1;
      const name = localStorage.getItem(`name${pathId}`) || ''; 
      const named = name !== '';
      this.setState({ pathPool, currentNames, currentPath, pathId, name, named, pageToFetch });
      this.drawSVG();
    });
  }

  renderNames() {
    let names = (
      <div>No one has named me</div>
    );

    if (this.state.currentNames) {
      names = _.map(this.state.currentNames, (name) => {
        return (
          <div data-key={name.path_id} key={name.id}>{name.name}</div>
        );
      });
    }
  }

  generatePath() {
    this.loading = true;
    fetch('https://699de3fa.ngrok.io/generate/3')
      .then((d) => {
        const resp = d.json(); 
        if (typeof resp.path !== 'undefined') {
          this.loading = false;
          const paths = this.state.paths.unshift(resp.path);
          this.setState({ paths });
        }
      });
  }

  updateColor(svg, event) {
    console.log(event);
  }

  submitName() {
    if (this.state.name.length < 2) return;
    this.setState({ named: true });
    this.loading = true;
    const name = this.state.name;
    const url = `https://699de3fa.ngrok.io/api/names`;
    fetch(url, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        name: this.state.name,
        path_id: this.state.pathId
      })
    }).then((resp) => {
      return resp.json();
    }).then((resp) => {
      this.loading = false;
      this.setState({
        currentNames: this.state.currentNames.push(resp)
      });
    });
  }


  drawSVG() {
    if (this.svg) this.svg.remove();
    const maxScale = 0.667;
    const size = window.innerHeight * 0.5;
    let bb;
    const _draw = SVG('svg').size(size, size);
    const noBg = math.randomInt(1);
    const newColor = tinycolor.random().toHexString(); 
    let _drawnPath;

    if (this.state.bgColor !== '#ffffff') {
      _draw.rect(size, size).fill(newColor).move(0, 0);
      _drawnPath = _draw.path(this.state.currentPath).fill('#ffffff');
    } else {
      _draw.rect(size, size).fill('#ffffff').move(0, 0);
      _drawnPath = _draw.path(this.state.currentPath).fill(newColor);
    }

    bb = _drawnPath.bbox();
    const widthScale = maxScale / (bb.w / size);
    const heightScale = maxScale / (bb.h / size);
    _drawnPath.scale(widthScale, heightScale);
    bb = _drawnPath.bbox();

    const xMove = _drawnPath.transform().x + ((size - bb.w) / 2) - bb.x;
    const yMove =  _drawnPath.transform().y + ((size - bb.h) / 2) - bb.y;
    _drawnPath.translate(xMove, yMove);

    // Bind some methods
    _draw.click(() => this.swapColors(_draw.node));
    _draw.mousemove((e) => this.updateColor(this, e));
    this.svg = _draw;
  }

  componentDidMount() {
    this.updatePool();
  }

  render() {
    return (
      <div className="Container">
        <div className="Home">
          <h1>Shaperator</h1>
          <p className="Home-intro">Shapes drawn by AI</p>
        </div>
        <div className="Main">
          <div id="svg">
            {!this.loading && this.state.currentPath &&
              <div className="left-gutter">
                <div className="download-buttons">
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => this.saveSVG()}>
                    <FaArrowCircleODown/>SVG
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    type="button" 
                    onClick={() => this.savePNG()}>
                    <FaArrowCircleODown/>PNG
                  </button>
                </div>
              </div>
            }
            {!this.loading && this.state.currentPath &&
              <div className="right-gutter">
                <button className="next" onClick={() => this.nextPath()}>
                  <TiArrowRightThick />
                </button>
              </div>
            }
          </div>
          <div className="names">
            { !this.state.loading && !this.state.named &&
              <div className="name-form">
                <input
                  type="text"
                  placeholder="What should we call me?"
                  className="name-input"
                  value={this.state.name}
                  onChange={(e) => this.updateName(e.currentTarget.value)}
                />
                <span className="input-group-btn">
                  <button 
                    className="name-submit"
                    disabled={ this.state.name.length < 2 }
                    type="button"
                    onClick={() => this.submitName()}
                  >Submit</button>
                </span>
              </div>
            }
            { !this.state.loading && this.state.named &&
              <div className="names-list">
                { this.renderNames() }
              </div>
            }
          </div>
          {/*
          <div id="controls">
            { this.state.currentPath && this.state.currentPath.names && !this.loading && this.renderNames() }
            { this.loading && <span className="loader"><span className="loader-inner"></span></span> }
          </div>
          <div className="names-container">
            <div className="names-list-container">
            </div>
          </div>
          */}
        </div>
      </div>
    );
  }
}

export default Home;
