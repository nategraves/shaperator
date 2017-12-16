import React, { Component } from 'react';

import './Names.css';

class Names extends Component {
  constructor(props) {
    super(props);
    this.id = this.props.id;
    const name = localStorage.getItem(`named${this.id}`) || '';
    const names = this.props.names;

    this.state = {
      name,
      names,
      named: name !== '',
      loading: false
    };
  }

  updateName(name) {
    this.setState({ name });
  }

  updateNames() {
    this.loading = true;
    let names = null;
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
        path_id: this.id
      })
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
    if (this.state.names.length > 0) {
      names = this.state.names.map((name, index) => {
        const isMyName = name === this.state.name;
        return (
          <div className={name + isMyName ? ' active' : ''} key={index}>{name}</div>
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
            { this.state.named &&
              <h1>{ this.state.name }</h1>
            }
            { names }
          </div>
        </div>
      </div>
    );
  }
}

export default Names;