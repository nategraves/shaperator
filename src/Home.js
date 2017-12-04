import React, { Component } from 'react';
import logo from './react.svg';
import './Home.css';
import Path from './Path';
import TiArrowRightThick from 'react-icons/lib/ti/arrow-right-thick';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pathPool: [],
      currentPath: null,
      pageToFetch: 0,
      pathIndex: 0
    };
    this.loading = true;
  }

  nextPath() {
    this.loading = true;
    const pathPool = this.state.pathPool;
    console.log(`Before: ${pathPool.length}`);
    const currentPath = pathPool.pop(); 
    console.log(`Current Path: ${currentPath}`);
    const pathIndex = this.state.pathIndex + 1;
    this.setState({
      pathPool,
      currentPath,
      pathIndex
    });
    if (pathPool.length === 1) {
      this.updatePool();
    }
    this.loading = false;
  }

  updatePool() {
    fetch(`https://699de3fa.ngrok.io/${this.state.pageToFetch}`)
      .then(d => d.json())
      .then(d => {
        this.loading = false;
        const pathPool = d.paths;
        const currentPath = pathPool.pop();
        const pageToFetch = this.state.pageToFetch + 1;
        this.setState({ pathPool, currentPath, pageToFetch });
      });
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

  componentDidMount() {
    this.updatePool()
  }

  render() {
    const key = `${this.state.pageToFetch - 1}-${this.state.pathPool.length}`;
    const path = (
      <Path data={this.state.currentPath} key={key} id={this.state.pathIndex} />
    );
    return (
      <div className="Container">
        <div className="Home">
          <h1>Shaperator</h1>
          <p className="Home-intro">Computer-drawn vectors.</p>
          {!this.loading && 
            <button className="next" onClick={() => this.nextPath()}>
              <TiArrowRightThick />
            </button>
          }
        </div>
        <div className="Main">
          <div id="svgs"></div>
          <div id="controls">
            { this.state.currentPath && !this.loading && path }
            {
              this.loading &&
              <span className="loader"><span className="loader-inner"></span></span>
            }
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
