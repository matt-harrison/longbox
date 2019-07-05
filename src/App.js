import React from 'react';
import axios from 'axios';
// import md5 from 'md5';

import('./css/library.css');

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cancelToken: null,
      issues: [],
      search: {
        any: ''
      },
      issue: null
    };
  };

  componentDidMount() {
    this.getIssues();
  };

  handleSearchChange = (event) => {
    let search = this.state.search;

    search.any = event.target.value;

    if (this.state.cancelToken) {
      this.state.cancelToken.cancel();
    }

    this.setState({
      cancelToken: axios.CancelToken.source(),
      search
    }, () => {
      this.getIssues();
    });
  };

  getIssues = () => {
    const data = {
      params: this.state.search
    };

    if (this.state.cancelToken) {
      data.cancelToken = this.state.cancelToken.token;
    }

    axios.get('https://www.rootbeercomics.com/api/longbox/get.php', data).then(response => {
      if (response) {
        response.data.issues.results.forEach(issue => {
          issue.isColor = this.getNullableBoolean(issue.is_color);
          issue.isOwned = this.getNullableBoolean(issue.is_owned);
          issue.isRead  = this.getNullableBoolean(issue.is_read);

          issue.isColorSet = issue.isColor !== null;
          issue.isOwnedSet = issue.isOwned !== null;
          issue.isReadSet  = issue.isRead  !== null;

          delete issue.is_color;
          delete issue.is_owned;
          delete issue.is_read;
        });

        this.setState({
          cancelToken: null,
          issues: response.data.issues.results
        });
      }
    });
  };

  getNullableBoolean = input => {
    let output = null;

    if (input === '1') {
      output = true;
    } else if (input === '0') {
      output = false;
    }

    return output;
  };

  setIssue = (issueId) => {
    this.state.issues.forEach(issue => {
      if (issue.id === issueId) {
        this.setState({issue});
      }
    });
  };

  render() {
    return (
      <div className="mAuto w600">
        <div className="flex spaceBetween alignCenter mb5">
          <div className="flex alignCenter mr5">
            <i aria-hidden={true} className={`mr10 fs14 fas fa-book-open csrPointer`}></i>
            <h1 className="fs14 bold">longbox</h1>
          </div>
        </div>
        <section id="search" className="mb5">
          <input
          className="bdrBox bdrBlack p5 wFull"
          name="any"
          onChange={this.handleSearchChange}
          placeholder="search by title, publisher, contributor, or notes"
          value={this.state.search.any}
          />
        </section>
        <section id="filters" className="mb5">
          {
            //toggle title
            //toggle number
            //toggle publisher
            //toggle writer
            //toggle interior
            //toggle cover
            //toggle notes
            //toggle year
            //toggle is_read
            //toggle is_owned
            //toggle is_color
            //toggle format
          }
        </section>
        {this.state.issue && (
          <section id="issue" className="bdrBox mb5 bdrBlack p10">
            <h2 className="mb10 bold">
              {this.state.issue.title}
              {this.state.issue.number && ` #${this.state.issue.number}`}
            </h2>
            <div className="mb10">
              <label htmlFor="title" className="mb5">title</label>
              <input id="title" name="title" value={this.state.issue.title} className="bdrBlack p5" />
            </div>
            <div className="mb10">
              <label htmlFor="number" className="mb5">number</label>
              <input id="number" name="number" value={this.state.issue.number} className="bdrBlack p5" />
            </div>
            <div className="mb10">
              <label htmlFor="publisher" className="mb5">publisher</label>
              <input id="publisher" name="publisher" value={this.state.issue.publisher} className="bdrBlack p5" />
            </div>
            <div className="mb10">
              <label htmlFor="year" className="mb5">year</label>
              <input id="year" name="year" value={this.state.issue.year} className="bdrBlack p5" />
            </div>
            <div className="mb10">
              <label htmlFor="format" className="mb5">format</label>
              <input id="format" name="format" value={this.state.issue.format} className="bdrBlack p5" />
            </div>
            <div className="mb10 flex">
              <input type="checkbox" id="isColor" name="isColor" checked={this.state.issue.isColorSet && this.state.issue.isColor} className="mr5 bdrBlack p5" />
              <label htmlFor="isColor" className={`${this.state.issue.isColorSet ? '' : 'txtRed'}`}>color</label>
            </div>
            <div className="mb10 flex">
              <input type="checkbox" id="isOwned" name="isOwned" checked={this.state.issue.isOwnedSet && this.state.issue.isOwned} className="mr5 bdrBlack p5" />
              <label htmlFor="isOwned" className={`${this.state.issue.isOwnedSet ? '' : 'txtRed'}`}>owned</label>
            </div>
            <div className="mb10 flex">
              <input type="checkbox" id="isRead" name="isRead" checked={this.state.issue.isReadSet && this.state.issue.isRead} className="mr5 bdrBlack p5" />
              <label htmlFor="isRead" className={`${this.state.issue.isReadSet ? '' : 'txtRed'}`}>read</label>
            </div>
          </section>
        )}
        <section id="list" className="bdrBox bdrBlack p5">
          {
            this.state.issues.length > 0 ? this.state.issues.map((issue, index) => {
              return (
                <div key={index}>
                  <span onClick={() => {this.setIssue(issue.id);}} className="csrPointer">{index + 1}. {issue.title}{issue.number ? ` #${issue.number}` : ''}</span>
                </div>
              );
            }) : (<div>...</div>)
          }
        </section>
      </div>
    );
  };
}

export default App;
