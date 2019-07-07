import React from 'react';
import axios from 'axios';
import md5 from 'md5';

import SignInForm from './components/SignInForm';

import * as utils from './utils';

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
      issue: null,
      login: {
        md5: null,
        username:  null
      },
      showSignInForm: false,
      user: utils.getCookie()
    };
  };

  componentDidMount() {
    this.getIssues();
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
          issue.is_color = utils.getNullableBoolean(issue.is_color);
          issue.is_owned = utils.getNullableBoolean(issue.is_owned);
          issue.is_read  = utils.getNullableBoolean(issue.is_read);
        });

        this.setState({
          cancelToken: null,
          issues: response.data.issues.results
        });
      }
    });
  };

  handleIssueCheckboxChange = event => {
    const key   = event.target.id;
    const issue = this.state.issue;

    issue[key] = !issue[key];

    this.setState({issue});
  };

  handleIssueTextChange = event => {
    const key   = event.target.id;
    const issue = this.state.issue;

    issue[key] = event.target.value;

    this.setState({issue});
  };

  handleContributorTextChange = (event, id, key) => {
    const issue = this.state.issue;

    issue['contributors'].forEach((contributor) => {
      if (contributor.id === id) {
        contributor[key] = event.target.value;
      }
    });

    this.setState({issue});
  };

  handleLoginChange = (event) => {
    let login = this.state.login;

    login[event.target.name] = event.target.value;

    this.setState({login});
  }

  handleSearchChange = event => {
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

  setIssue = issueId => {
    let data = null;

    if (issueId) {
      this.state.issues.forEach(issue => {
        if (issue.id === issueId) {
          data = issue;

          window.scrollTo(0, 0);
        }
      });
    }

    this.setState({
      issue: data
    });
  };

  signIn = (event) => {
    event.preventDefault();

    const hash = md5(this.state.login.username + this.state.login.password);
    const params = {
      username: this.state.login.username,
      md5: hash
    };

    axios.get('https://www.rootbeercomics.com/login/ajax/index.php', {params}).then(response => {
      if (response.data.success) {
        const user = {
          isAdmin: (params.username === 'matt!'),
          isSignedIn: true,
          md5: params.md5,
          name: params.username
        };

        this.setState({
          showSignInForm: false,
          user
        });

        utils.setCookie('user', JSON.stringify(this.state.user));
      } else {
        const input = {
          username: this.state.login.username,
          password: ''
        };

        this.setState({input});
      }
    });
  }

  signOut = () => {
    const user = {
      isAdmin: false,
      isSignedIn: false,
      md5: '',
      name: ''
    };

    axios.get('https://www.rootbeercomics.com/login/ajax/log-out.php').then(response => {
      this.setState({
        showAddItemForm: false,
        user
      });
      utils.setCookie('user', '');
    });
  }

  toggleShowSignInForm = () => {
    const showSignInForm = !this.state.showSignInForm;

    this.setState({
      showSignInForm
    });
  }

  updateIssue = event => {
    event.preventDefault();

    const issues = this.state.issues.slice();
    const data   = {
      params: {
        username: this.state.user.name,
        md5:      this.state.user.md5,
        issue:    this.state.issue
      }
    };

    issues.forEach(issue => {
      if (issue.id === this.state.issue.id) {
        issue = this.state.issue;
      }
    });

    if (this.state.cancelToken) {
      data.cancelToken = this.state.cancelToken.token;
    }

    axios.get('https://www.rootbeercomics.com/api/longbox/update.php', data).then(response => {
      if (response) {
        this.setState({
          cancelToken: null,
          issues
        });
      }
    });
  };

  render() {
    const signInOutButton = (this.state.user.isSignedIn) ? (
      <i aria-hidden={true} className="fas fa-sign-out-alt csrPointer" onClick={this.signOut}></i>
    ) : (
      <i aria-hidden={true} className="fas fa-sign-in-alt csrPointer" onClick={this.toggleShowSignInForm}></i>
    );

    const contributors = this.state.issue && this.state.issue.contributors ? this.state.issue.contributors.map(contributor => {
      return (
        <div key={contributor.id} className="flex mb5 ml10">
          <div className="mr10 w100">
            <label htmlFor={`creatorType${contributor.id}`}>type</label>
            <input
            className="bdrBox bdrBlack p5 wFull"
            id={`creatorType${contributor.id}`}
            name={`creatorType${contributor.id}`}
            value={contributor.creator_type}
            onChange={event => {this.handleContributorTextChange(event, contributor.id, 'creator_type')}}
            />
          </div>
          <div className="wFull">
            <label htmlFor={`creator${contributor.id}`}>name</label>
            <input
            className="bdrBox bdrBlack p5 wFull"
            id={`creator${contributor.id}`}
            name={`creator${contributor.id}`}
            value={contributor.creator}
            onChange={event => {this.handleContributorTextChange(event, contributor.id, 'creator')}}
            />
          </div>
        </div>
      );
    }) : '';

    return (
      <div className="mAuto w600">
        <div className="flex spaceBetween alignCenter mb5 fs14">
          <div className="flex alignCenter mr10">
            <i aria-hidden={true} className={`mr10 fs14 fas fa-book-open csrPointer`}></i>
            <h1 className="fs14 bold">longbox</h1>
          </div>
          {signInOutButton}
        </div>
        {this.state.showSignInForm &&
          <SignInForm
          signIn={this.signIn}
          username={this.state.login.username}
          password={this.state.login.password}
          handleLoginChange={this.handleLoginChange}
          />
        }
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
          <form
          className="bdrBox mb5 bdrBlack p10"
          id="issue"
          onSubmit={this.updateIssue}
          >
            <div className="flex spaceBetween">
              <h2 className="mb10 bold">
                {this.state.issue.title}
                {this.state.issue.number && ` #${this.state.issue.number}`}
              </h2>
              <span onClick={this.setIssue} className="bold csrPointer">X</span>
            </div>
            <div className="flex spaceBetween mb10">
              <div className="flex">
                <input
                checked={this.state.issue.is_read}
                className="mr5 bdrBlack p5"
                id="is_read"
                name="is_read"
                onChange={this.handleIssueCheckboxChange}
                type="checkbox"
                />
                <label htmlFor="is_read" className={`${this.state.issue.is_read === null ? 'txtRed' : ''}`}>read</label>
              </div>
              <div className="flex">
                <input
                checked={this.state.issue.is_owned}
                className="mr5 bdrBlack p5"
                id="is_owned"
                name="is_owned"
                onChange={this.handleIssueCheckboxChange}
                type="checkbox"
                />
                <label htmlFor="is_owned" className={`${this.state.issue.is_owned === null ? 'txtRed' : ''}`}>owned</label>
              </div>
              <div className="flex">
                <input
                checked={this.state.issue.is_color}
                className="mr5 bdrBlack p5"
                id="is_color"
                name="is_color"
                onChange={this.handleIssueCheckboxChange}
                type="checkbox"
                />
                <label htmlFor="is_color" className={`${this.state.issue.is_color === null ? 'txtRed' : ''}`}>color</label>
              </div>
            </div>
            <div className="flex mb10">
              <div className="mr10 wFull">
                <label htmlFor="title">title</label>
                <input
                className="bdrBox bdrBlack p5 wFull"
                id="title"
                name="title"
                onChange={this.handleIssueTextChange}
                value={this.state.issue.title}
                />
              </div>
              <div className="mb10 w100">
                <label htmlFor="number">number</label>
                <input
                className="bdrBox bdrBlack p5 wFull"
                id="number"
                name="number"
                onChange={this.handleIssueTextChange}
                value={this.state.issue.number || ''}
                />
              </div>
            </div>
            <div className="mb10">
              <label htmlFor="publisher">publisher</label>
              <input
              className="bdrBox bdrBlack p5 wFull"
              id="publisher"
              name="publisher"
              onChange={this.handleIssueTextChange}
              value={this.state.issue.publisher || ''}
              />
            </div>
            <div className="mb10">
              <label htmlFor="year">year</label>
              <input
              className="bdrBox bdrBlack p5 wFull"
              id="year"
              name="year"
              onChange={this.handleIssueTextChange}
              value={this.state.issue.year || ''}
              />
            </div>
            <div className="mb10">
              <label htmlFor="format">format</label>
              <input
              className="bdrBox bdrBlack p5 wFull"
              id="format"
              name="format"
              onChange={this.handleIssueTextChange}
              value={this.state.issue.format}
              />
            </div>
            <div className="mb10">
              <label htmlFor="notes">notes</label>
              <textarea
              className="bdrBox bdrBlack p5 wFull"
              id="notes"
              name="notes"
              onChange={this.handleIssueTextChange}
              value={this.state.issue.notes}
              />
            </div>
            {contributors && (
              <div>
                <label className="mb5">contributors</label>
                {contributors}
              </div>
            )}
            {this.state.user.isAdmin && (
              <div className="flex flexEnd mt10">
                <button
                className="bdrBlack p5 csrPointer"
                type="submit"
                >
                  update
                </button>
              </div>
            )}
          </form>
        )}
        {this.state.issue === null && (
          <section id="list" className="bdrBox mb5 bdrBlack p5">
            {
              this.state.issues.length > 0 ? this.state.issues.map((issue, index) => {
                return (
                  <div key={index}>
                    <span
                    onClick={() => {this.setIssue(issue.id)}}
                    className="csrPointer"
                    >
                      {index + 1}. {issue.title}{issue.number ? ` #${issue.number}` : ''}
                    </span>
                  </div>
                );
              }) : (<div>...</div>)
            }
          </section>
        )}
      </div>
    );
  };
}

export default App;
