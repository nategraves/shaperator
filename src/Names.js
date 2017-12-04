import React, { Component } from 'react';
import axios from 'axios';

import './Names.css';

class Names extends Component {
  constructor(props) {
    super(props);
    this.id = this.props.id;
    const name = localStorage.getItem(`named${this.id}`) || '';

    this.state = {
      name,
      names: null,
      named: name !== '',
      loading: true
    };
  }

  updateName(name) {
    this.setState({ name });
  }

  updateNames() {
    this.loading = true;
    let names = null;
    axios.get(`https://699de3fa.ngrok.io/names/${this.id}`).then(resp => this.setState({ names: resp.data.names, loading: false }));
  }

  submitName() {
    this.setState({ named: true });
    this.loading = true;
    const name = this.state.name;
    fetch(`https://699de3fa.ngrok.io/names/${this.id}`, {
      method: 'POST',
      body: JSON.stringify({ name: this.state.name })
    }).then(() => {
      this.updateNames();
      localStorage.setItem(`named${this.id}`, name);
    });
  }

  componentDidMount() {
    this.updateNames();
  }

  render() {
    let names;
    if (this.state.names) {
      names = this.state.names.map((name, index) => {
        return (
          <div className="name" key={index}>{name}</div>
        );
      });
    }
    return (
      <div className="names-container">
        { !this.state.loading && !this.state.named &&
          <div className="name-form">
            <input
              type="text"
              placeholder="What should we call me?"
              className="form-control"
              value={this.state.name}
              onChange={(e) => this.updateName(e.currentTarget.value)}
            />
            <span className="input-group-btn">
              <button className="btn btn-secondary" type="button" onClick={() => this.submitName()}>Submit</button>
            </span>
          </div>
        }
        { this.state.named && !this.state.loading &&
          <h1>{ this.state.name }</h1>
        }
        <div className="names-list">
          { names }
        </div>
      </div>
    );
  }
}

export default Names;