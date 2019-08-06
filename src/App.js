import React from 'react';
import axios from 'axios';
import md5 from 'md5';

import AddIssueForm from './components/AddIssueForm';
import EditIssueForm from './components/EditIssueForm';
import SignInForm from './components/SignInForm';

import * as utils from './utils';

import('./css/library.css');

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cancelToken: null,
      issue: null,
      issueDefault: {
        contributors: [],
        format: '',
        is_color: false,
        is_owned: true,
        is_read: true,
        notes: '',
        number: null,
        publisher: '',
        sort_title: '',
        title: '',
        year: null
      },
      issueNew: null,
      issues: [],
      login: {
        md5: null,
        username:  null
      },
      search: {
        any: ''
      },
      showAddIssueForm: false,
      showEditIssueForm: false,
      showSignInForm: false,
      user: utils.getCookie()
    };
  };

  componentDidMount() {
    this.getIssues();
  };

  addIssue = event => {
    event.preventDefault();

    const data   = {
      params: {
        username: this.state.user.name,
        md5:      this.state.user.md5,
        issue:    this.state.issueNew
      }
    };

    if (this.state.cancelToken) {
      data.cancelToken = this.state.cancelToken.token;
    }

    axios.get('https://www.rootbeercomics.com/api/longbox/add.php', data).then(response => {
      if (response) {
        this.setState({
          cancelToken: null,
          issueNew: null,
          showEditIssueForm: false
        });
      }
    });
  };

  getIssues = () => {
    const data = {
      params: {
        ...this.state.search,
        order_by: 'sort_title, number'
      }
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

  handleAddIssueFormClose = () => {
    this.setState({
      showAddIssueForm: false
    });
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

  handleIssueCheckboxChange = event => {
    const key   = event.target.id;
    const issue = this.state.issue;

    issue[key] = !issue[key];

    this.setState({issue});
  };

  handleIssueNewCheckboxChange = event => {
    const key   = event.target.id;
    const issueNew = this.state.issueNew;

    issueNew[key] = !issueNew[key];

    this.setState({issueNew});
  };

  handleIssueNewTextChange = event => {
    const key   = event.target.id;
    const issueNew = this.state.issueNew;

    issueNew[key] = event.target.value;

    this.setState({issueNew});
  };

  handleIssueTextChange = event => {
    const key   = event.target.id;
    const issue = this.state.issue;

    issue[key] = event.target.value;

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
      issue: data,
      showEditIssueForm: data !== null
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
        issue: null,
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

  toggleShowAddIssueForm = () => {
    const showAddIssueForm = !this.state.showAddIssueForm;
    const data = {
      showAddIssueForm
    };

    if (this.state.issueNew === null) {
      data.issueNew = Object.assign({}, this.state.issueDefault);
    }

    this.setState(data);
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
          issue: null,
          issues,
          showEditIssueForm: false
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

    return (
      <div className="mAuto w600">
        <div className="flex spaceBetween alignCenter mb5 fs14">
          <div className="flex alignCenter mr10">
            <i aria-hidden={true} className={`mr10 fs14 fas fa-book-open csrPointer`} onClick={() => {window.location.reload()}}></i>
            <h1 className="fs14 bold csrPointer" onClick={() => {window.location.reload()}}>longbox</h1>
          </div>
          <div className="flex alignCenter">
            {this.state.user.isAdmin && (
              <i aria-hidden={true} className={`mr5 fas fa-edit ${this.state.showAddIssueForm ? '' : 'txtRed'} csrPointer`} onClick={this.toggleShowAddIssueForm}></i>
            )}
            {signInOutButton}
          </div>
        </div>
        {this.state.showSignInForm &&
          <SignInForm
          signIn={this.signIn}
          username={this.state.login.username}
          password={this.state.login.password}
          handleLoginChange={this.handleLoginChange}
          />
        }
        {!this.state.showAddIssueForm && !this.state.showEditIssueForm && (
          <section id="search" className="mb5">
            <input
            className="bdrBox bdrBlack p5 wFull"
            name="any"
            onChange={this.handleSearchChange}
            placeholder="search by title, publisher, contributor, or notes"
            value={this.state.search.any}
            />
          </section>
        )}
        {this.state.showAddIssueForm && (
          <AddIssueForm
          handleClose={this.handleAddIssueFormClose}
          handleIssueCheckboxChange={this.handleIssueNewCheckboxChange}
          handleIssueTextChange={this.handleIssueNewTextChange}
          issue={this.state.issueNew}
          addIssue={this.addIssue}
          user={this.state.user}
          />
        )}
        {this.state.showEditIssueForm && (
          <EditIssueForm
          handleClose={this.setIssue}
          handleIssueCheckboxChange={this.handleIssueCheckboxChange}
          handleIssueTextChange={this.handleIssueTextChange}
          issue={this.state.issue}
          updateIssue={this.updateIssue}
          user={this.state.user}
          />
        )}
        {!this.state.showAddIssueForm && !this.state.showEditIssueForm && (
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
