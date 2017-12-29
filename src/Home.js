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
const API_ID = '9a4d57c5';
const API_URL = `https://${API_ID}.ngrok.io/`;

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

    this.loading = false;
    this.svg = null;
  }

  componentDidMount() {
    this.updatePool();
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
    const path = pathPool.pop();
    const pathAttr = path.attributes;
    const pathId = path.id;
    const nameIds = path.relationships.names.data;
    const currentPath = pathAttr.d; 
    const name = localStorage.getItem(`named${pathId}`) || ''; 
    const named = name !== '';

    this.setState({
      pathPool,
      pathId,
      currentPath,
      name,
      named
    });

    if (this.state.pathPool.length === 0) {
      this.updatePool();
    } else {
      this.fetchNames(nameIds);
    }
  }

  updateName(name) {
    this.setState({ name: name.toUpperCase() });
  }

  updatePool() {
    this.loading = true;
    const url = `${API_URL}api/paths?page=${this.state.pageToFetch}`;
    const headers = new Headers();
    headers.append('Content-Type', 'application/vnd.api+json');
    fetch(url, {
      method: 'GET',
      headers: { "Accept": "application/vnd.api+json" }
    }).then((resp) => { 
      return resp.json(); 
    }).then((resp) => {
      const pathPool = resp.data;
      const path = pathPool.pop();
      const pathAttr = pathPool.pop().attributes;
      const pathId = path.id;
      const nameIds = path.relationships.names.data;
      const currentPath = pathAttr.d;
      const pageToFetch = this.state.pageToFetch + 1;
      const name = localStorage.getItem(`named${pathId}`) || ''; 
      const named = name !== '';
      this.setState({ pathPool, currentPath, pathId, name, named, pageToFetch });

      this.fetchNames(nameIds);
    });
  }

  fetchNames(nameIds) {
    if (!nameIds || nameIds.length === 0) return;

    const url = `${API_URL}api/paths?page=${this.state.pageToFetch}`;
    const names = [];
    for (let i = 0; i < nameIds.length; i++) {
      const nameId = nameIds[i].id;
      const url = `${API_URL}api/names/${nameId}`;
      fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/vnd.api+json' }
      }).then((resp) => {
        return resp.json();
      }).then((resp) => {
        const { name, created } = resp.data.attributes;
        const voteCount = resp.data.relationships.votes.data.length;
        names.push({
          name,
          created,
          voteCount
        });

        if (i === nameIds.length - 1) {
          this.setState({ currentNames: names });
          this.drawSVG();
        }
      });
    }
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
    this.loading = false;
  }

  renderNames() {
    let names = (
      <div>No one has named me</div>
    );

    if (this.state.currentNames) {
      const uniqueNames = _.uniq(this.state.currentNames);

      names = _.map(uniqueNames, (name) => {
        return (
          <div data-key={name.path_id} key={name.id} className={this.state.name === name.name ? 'name same' : 'name'}>
            <div>{name.name}</div>
            <div className="name-count">{name.voteCount}</div>
          </div>
        );
      });

      return names;
    }
  }

  submitName() {
    if (this.state.name.length < 2) return;

    this.loading = true;
    const newName = this.state.name.toUpperCase();
    const pathId = this.state.pathId;
    const data = {
      "type": "names",
      "attributes": {
        "name": newName,
        "path_id": pathId
      }
    };

    const headers = {
      "Content-Type": "application/vnd.api+json",
      "Accept": "application/vnd.api+json"
    }

    const url = `${API_URL}api/names`;

    fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ "data": data })
    }).then((resp) => {
      return resp.json();
    }).then((resp) => {
      const name = {
        name: newName,
        created: resp.data.attributes.created,
        voteCount: 0
      }

      this.setState({
        currentNames: this.state.currentNames.push(name),
        named: true 
      });

      localStorage.setItem(`named${resp.pathId}`, newName);
      this.loading = false;
    });
  }

  updateColor(svg, event) {
    console.log(event);
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
              <form onSubmit={() => this.submitName()} className="name-form">
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
              </form>
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
