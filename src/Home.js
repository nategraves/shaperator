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
    const name = ''; //localStorage.getItem(`name${pathIndex}`) || ''; 

    this.state = {
      bgColor,
      currentPath: null,
      currentNames: null,
      fgColor,
      name,
      named: name !== '',
      pageToFetch: 1,
      pathIndex: null,
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
      this.setState({ pathPool, currentNames, currentPath, pathId, pageToFetch });
      this.drawSVG();
    });
  }

  renderNames() {
    if (!this.state.currentPath || !this.state.currentPath.names) return;
    let names = (
      <p>You can be the first to give me a name</p>
    );
    if (this.state.currentPath.names.length > 0) {
      names = _.map(this.state.currentPath.names, name => <div>{ name }</div>);
    } 
  }

  renderPath() {
    return (
      <div className="PathControl">
        <div className="PathControlInner">
          <div className="input-group">
            { this.renderNames() }
          </div>
        </div>
        <div className="PathControlInner">
          <div className="input-group">
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => this.saveSVG()}
            >
              <FaArrowCircleODown/><br/>SVG
            </button>
            <button 
              className="btn btn-secondary" 
              type="button" 
              onClick={() => this.savePNG()}
            >
              <FaArrowCircleODown/><br/>PNG
            </button>
          </div>
        </div>
      </div>
    );
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
    const _draw = SVG('svgs').size(size, size);
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
    let names = (
      <div>No one has named me</div>
    );

    if (this.state.currentNames) {
      names = _.map(this.state.currentNames, (name) => {
        return (
          <div>{ name.name }</div>
        );
      });
    }

    return (
      <div className="Container">
        <div className="Home">
          <h1>Shaperator</h1>
          <p className="Home-intro">Computer-drawn vectors.</p>
          {!this.loading && this.state.currentPath &&
            <button className="next" onClick={() => this.nextPath()}>
              <TiArrowRightThick />
            </button>
          }
        </div>
        <div className="Main">
          <div id="svgs"></div>
          <div id="controls">
            { this.state.currentPath && !this.loading && this.renderPath() }
            { this.state.currentPath && this.state.currentPath.names && !this.loading && this.renderNames() }
            { this.loading && <span className="loader"><span className="loader-inner"></span></span> }
          </div>
          <div className="names-container">
            { !this.state.loading && !this.state.named &&
              <div className="name-form form-group">
                <input
                  type="text"
                  placeholder="What should we call me?"
                  className="form-control"
                  value={this.state.name}
                  onChange={(e) => this.updateName(e.currentTarget.value)}
                />
                <span className="input-group-btn">
                  <button 
                    className="btn btn-secondary"
                    disabled={ this.state.name.length < 2 }
                    type="button"
                    onClick={() => this.submitName()}
                  >Submit</button>
                </span>
              </div>
            }
            <div className="names-list-container">
              <div className="names-list">
                { names }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
