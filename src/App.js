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
      autocomplete: [],
      autocompleteIndex: null,
      autocompleteKey: null,
      cancelToken: axios.CancelToken.source(),
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
      issues: [],
      login: {
        md5: '',
        password: '',
        username:  ''
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

  addContributor = () => {
    let issue = this.state.issue;

    issue.contributors.push({
      creator: '',
      creator_type: '',
      id: null
    });

    this.setState({issue});
  };

  addIssue = event => {
    event.preventDefault();

    const data   = {
      params: {
        username: this.state.user.name,
        md5:      this.state.user.md5,
        issue:    this.state.issue
      }
    };

    axios.get('https://www.rootbeercomics.com/api/longbox/add.php', data).then(response => {
      if (response) {
        this.setState({
          issue: null,
          showAddIssueForm: false,
          showEditIssueForm: false
        });
      }
    });
  };

  autocomplete = async (key, value, index = '') => {
    let autocomplete = [];
    const data = {
      params: {
        name: value,
        order_by: 'name'
      }
    };
    const rectangle = document.querySelector(`[id="${key + index}"]`).getBoundingClientRect();
    let url = '';

    document.querySelector('#autocomplete').style.left  = rectangle.left + 'px';
    document.querySelector('#autocomplete').style.top   = (rectangle.top + rectangle.height - 1) + 'px';
    document.querySelector('#autocomplete').style.width = (rectangle.width - 2) + 'px';

    switch (key) {
      case 'creator':
        url = 'https://www.rootbeercomics.com/api/longbox/creators.php';
        break;
      case 'creator_type':
        url = 'https://www.rootbeercomics.com/api/longbox/creator-types.php';
        break;
      case 'format':
        url = 'https://www.rootbeercomics.com/api/longbox/formats.php';
        break;
      case 'publisher':
        url = 'https://www.rootbeercomics.com/api/longbox/publishers.php';
        break;
      case 'title':
        url = 'https://www.rootbeercomics.com/api/longbox/titles.php';
        break;
      default:
        break;
    }

    if (url) {
      if (this.state.cancelToken) {
        data.cancelToken = this.state.cancelToken.token;
      }

      autocomplete = await axios.get(url, data).then(response => {
        let results = [];

        if (response) {
          results = response.data.results.map(result => result.name);
        }

        return results;
      });
    }

    return autocomplete.slice(0, 5);
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

    axios.get('https://www.rootbeercomics.com/api/longbox/issues.php', data).then(response => {
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

  handleContributorTextChange = (event, index, contributorId, key) => {
    let   autocomplete = [];
    const issue        = this.state.issue;
    const value        = event.target.value;

    if (contributorId) {
      issue.contributors.forEach(contributor => {
        if (contributor.id === contributorId) {
          contributor[key] = value;
        }
      });
    } else {
      if (!issue.contributors[index]) {
        issue.contributors[index] = {};
      }

      issue.contributors[index][key] = value;
    }

    if (this.state.cancelToken) {
      this.state.cancelToken.cancel();
    }

    this.setState({
      cancelToken: axios.CancelToken.source(),
      issue
    }, async () => {
      autocomplete = await this.autocomplete(key, value, index);

      this.setState({
        autocomplete,
        autocompleteKey: key,
        autocompleteIndex: index,
        cancelToken: null
      });
    });
  };

  handleIssueCheckboxChange = event => {
    const key   = event.target.id;
    const issue = this.state.issue;

    issue[key] = !issue[key];

    this.setState({issue});
  };

  handleIssueTextBlur = () => {
    setTimeout(() => {
      this.setState({
        autocomplete: [],
        autocompleteIndex: null,
        autocompleteKey: null
      });
    }, 250);
  }

  handleIssueTextChange = async event => {
    let   autocomplete = [];
    const issue        = this.state.issue;
    const key          = event.target.id;
    const value        = event.target.value;

    issue[key] = value;

    if (key === 'title') {
      issue.sort_title = value;
    }

    if (this.state.cancelToken) {
      this.state.cancelToken.cancel();
    }

    this.setState({
      cancelToken: axios.CancelToken.source(),
      issue
    }, async () => {
      autocomplete = await this.autocomplete(key, value);

      this.setState({
        autocomplete,
        autocompleteIndex: null,
        autocompleteKey: key,
        cancelToken: null
      });
    });
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

  handleSuggestionClick = event => {
    const issue = this.state.issue;

    if (this.state.autocompleteIndex !== null) {
      issue.contributors[this.state.autocompleteIndex][this.state.autocompleteKey] = event.target.innerHTML;
    } else {
      issue[this.state.autocompleteKey] = event.target.innerHTML;
    }

    if (this.state.autocompleteKey === 'title') {
      issue.sort_title = event.target.innerHTML;
    }

    this.setState({
      autocomplete: [],
      autocompleteIndex: null,
      autocompleteKey: null,
      issue
    });
  };

  setIssue = issueId => {
    let data         = null;
    let contributors = [];

    if (issueId) {
      this.state.issues.forEach(issue => {
        if (issue.id === issueId) {
          data = issue;

          if (data.contributors) {
            data.contributors.forEach((contributor, index) => {
              if (contributor.creator_type_id !== '' && contributor.creator !== '') {
                contributors.push(contributor);
              }
            });
          }

          data.contributors = contributors;

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

    if (this.state.login.username !== '' && this.state.login.password !== '') {
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

    this.setState({
      issue: JSON.parse(JSON.stringify(this.state.issueDefault)),
      showAddIssueForm,
      showEditIssueForm: false
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

    axios.get('https://www.rootbeercomics.com/api/longbox/update.php', data).then(response => {
      if (response) {
        this.setState({
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
          handleLoginChange={this.handleLoginChange}
          password={this.state.login.password}
          signIn={this.signIn}
          username={this.state.login.username}
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
          addContributor={this.addContributor}
          handleClose={this.handleAddIssueFormClose}
          handleContributorTextChange={this.handleContributorTextChange}
          handleIssueCheckboxChange={this.handleIssueCheckboxChange}
          handleIssueTextBlur={this.handleIssueTextBlur}
          handleIssueTextChange={this.handleIssueTextChange}
          issue={this.state.issue}
          addIssue={this.addIssue}
          user={this.state.user}
          />
        )}
        {this.state.showEditIssueForm && (
          <EditIssueForm
          addContributor={this.addContributor}
          handleClose={this.setIssue}
          handleContributorTextChange={this.handleContributorTextChange}
          handleIssueCheckboxChange={this.handleIssueCheckboxChange}
          handleIssueTextBlur={this.handleIssueTextBlur}
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
        <div
        className={`absolute bdrBlack bgWhite overflow-hidden ${this.state.autocomplete.length > 0 ? '' : 'hidden'}`}
        id="autocomplete"
        >
          {this.state.autocomplete.map((suggestion, index) => {
            return (
              <div
              className="suggestion p5"
              key={index}
              onClick={this.handleSuggestionClick}
              >
                {suggestion}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
}

export default App;
