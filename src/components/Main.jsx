import React from 'react';
import axios from 'axios';
import md5 from 'md5';

import AddIssueForm from './AddIssueForm';
import EditIssueForm from './EditIssueForm';
import SignInForm from './SignInForm';

import * as utils from '../utils';

class Main extends React.Component {
  constructor(props) {
    super(props);

    const params = new URLSearchParams(this.props.location.search);

    this.state = {
      autocomplete: [],
      autocompleteIndex: null,
      autocompleteKey: null,
      cancelToken: axios.CancelToken.source(),
      contributorIndex: null,
      contributorKey: null,
      isGroupedByTitle: params.has('group') ? params.get('group') === 'true' : false,
      issue: null,
      issueDefault: {
        contributors: [
          {
            creator: '',
            creator_type: 'writer',
            id: null
          },
          {
            creator: '',
            creator_type: 'penciller',
            id: null
          }
        ],
        format: 'comic',
        is_color: true,
        is_owned: true,
        is_read: false,
        notes: ``,
        numbers: null,
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
        any: params.has('any') ? params.get('any') : '',
        issue_id: params.has('id') ? params.get('id') : ''
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

    const issue = this.state.issue;

    issue.numbers = issue.numbers ? utils.expandNumbers(issue.numbers).join(',') : [];

    const data   = {
      params: {
        username: this.state.user.name,
        md5:      this.state.user.md5,
        issue
      }
    };

    axios.get('https://www.rootbeercomics.com/api/longbox/add.php', data).then(response => {
      if (response) {
        this.setState({
          issue: null,
          issues: [],
          showAddIssueForm: false,
          showEditIssueForm: false
        }, () => {
          this.getIssues();
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
    document.querySelector('#autocomplete').style.top   = (window.scrollY + rectangle.top + rectangle.height - 1) + 'px';
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
      }).catch(error => {});
    }

    return autocomplete ? autocomplete.slice(0, 5) : [];
  };

  clearSearch = () => {
    let search = this.state.search;

    search.any = '';

    if (this.state.cancelToken) {
      this.state.cancelToken.cancel();
    }

    this.setState({
      cancelToken: axios.CancelToken.source(),
      issues: [],
      search
    }, () => {
      this.setUrl();
      this.getIssues();
    });
  };

  getIssues = () => {
    const data = {
      params: {
        ...this.state.search,
        order_by: 'sort_title, number'
      }
    };

    axios.get('https://www.rootbeercomics.com/api/longbox/issues.php', data).then(response => {
      if (response) {
        response.data.issues.results.forEach(issue => {
          issue.is_color = utils.getNullableBoolean(issue.is_color);
          issue.is_owned = utils.getNullableBoolean(issue.is_owned);
          issue.is_read  = utils.getNullableBoolean(issue.is_read);
        });

        this.setUrl();

        if (this.state.cancelToken) {
          data.cancelToken = this.state.cancelToken.token;
        }

        this.setState({
          cancelToken: null,
          issues: response.data.issues.results
        }, () => {
          if (this.state.search.issue_id) {
            this.setIssue(this.state.search.issue_id);
          }
        });
      }
    }).catch(error => {});
  };

  handleAddIssueFormClose = () => {
    this.setState({
      showAddIssueForm: false
    });
  };

  handleContributorTextChange = event => {
    let   autocomplete     = [];
    const issue            = this.state.issue;
    const contributorId    = event.target.dataset.contributorId;
    const contributorIndex = parseInt(event.target.dataset.contributorIndex, 10);
    const contributorKey   = event.target.dataset.contributorKey;
    const value            = event.target.value;

    if (contributorId) {
      issue.contributors.forEach(contributor => {
        if (contributor.id === contributorId) {
          contributor[contributorKey] = value;
        }
      });
    } else {
      if (!issue.contributors[contributorIndex]) {
        issue.contributors[contributorIndex] = {};
      }

      issue.contributors[contributorIndex][contributorKey] = value;
    }

    if (this.state.cancelToken) {
      this.state.cancelToken.cancel();
    }

    this.setState({
      cancelToken: axios.CancelToken.source(),
      issue
    }, async () => {
      autocomplete = await this.autocomplete(contributorKey, value, contributorIndex);

      const isMatch = autocomplete.length === 1 && autocomplete[0] === value;

      this.setState({
        autocomplete: isMatch ? [] : autocomplete,
        autocompleteIndex: null,
        autocompleteKey: isMatch ? null : contributorKey,
        cancelToken: null,
        contributorIndex: isMatch ? null : contributorIndex,
        contributorKey: isMatch ? null : contributorKey
      });
    });
  };

  handleInputBlur = () => {
    const state = {
      autocomplete: [],
      autocompleteIndex: null,
      autocompleteKey: null
    };

    setTimeout(() => {
      this.setState(state);
    }, 250);
  };

  handleIssueCheckboxChange = event => {
    const key   = event.target.id;
    const issue = Object.assign({}, this.state.issue);

    issue[key] = !issue[key];

    this.setState({issue});
  };

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

      const isMatch = autocomplete.length === 1 && autocomplete[0] === value;

      this.setState({
        autocomplete: isMatch ? [] : autocomplete,
        autocompleteIndex: null,
        autocompleteKey: isMatch ? null : key,
        cancelToken: null
      });
    });
  };

  handleInputKeyDown = event => {
    let autocompleteIndex = this.state.autocompleteIndex;
    let autocompleteKey   = this.state.autocompleteKey;
    let contributorIndex  = this.state.contributorIndex;
    let contributorKey    = this.state.contributorKey;

    const keyCode = event.which || event.keyCode || window.event.keyCode;

    if (keyCode === 38) {
      if (typeof this.state.autocompleteIndex === 'number') {
        autocompleteIndex = autocompleteIndex === 0 ? this.state.autocomplete.length - 1 : autocompleteIndex - 1;
      } else {
        autocompleteIndex = this.state.autocomplete.length - 1;
        autocompleteKey   = contributorKey || event.target.id;
      }

      this.setState({
        autocompleteIndex,
        autocompleteKey
      });
    }

    if (keyCode === 40) {
      if (typeof autocompleteIndex === 'number') {
        autocompleteIndex = autocompleteIndex === this.state.autocomplete.length - 1 ? 0 : autocompleteIndex + 1;
      } else {
        autocompleteIndex = 0;
        autocompleteKey = contributorKey || event.target.id;
      }

      this.setState({
        autocompleteIndex,
        autocompleteKey
      });
    }

    if ((keyCode === 9 || keyCode === 13) && typeof autocompleteIndex === 'number') {
      const issue = this.state.issue;

      if (typeof contributorIndex === 'number') {
        issue.contributors[contributorIndex][contributorKey] = this.state.autocomplete[autocompleteIndex];
      } else {
        issue[autocompleteKey] = this.state.autocomplete[autocompleteIndex];
      }

      if (keyCode === 13) {
        event.preventDefault();
      }

      this.setState({
        autocomplete: [],
        autocompleteIndex: null,
        autocompleteKey: null,
        contributorIndex: null,
        contributorKey: null,
        issue
      });
    }
  };

  handleLoginChange = (event) => {
    let login = this.state.login;

    login[event.target.name] = event.target.value;

    this.setState({login});
  };

  handleSearchChange = event => {
    let search = this.state.search;

    search.any = event.target.value;

    if (this.state.cancelToken) {
      this.state.cancelToken.cancel();
    }

    this.setState({
      cancelToken: axios.CancelToken.source(),
      issues: [],
      search
    }, () => {
      this.getIssues();
    });
  };

  handleSuggestionClick = event => {
    const issue = this.state.issue;

    if (this.state.contributorIndex !== null) {
      issue.contributors[this.state.contributorIndex][this.state.autocompleteKey] = event.target.innerHTML;
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

  resetUrl = () => {
    this.props.history.push('/');
    window.location.reload();
  };

  setIssue = issueId => {
    let data         = null;
    let contributors = [];
    let search = this.state.search;

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
    } else {
      search.issue_id = '';
    }

    this.setState({
      issue: data,
      search,
      showEditIssueForm: data !== null
    }, () => {
      this.setUrl();
    });
  };

  setSearchAny = any => {
    this.setState({
      issues: [],
      search: {
        any
      },
      isGroupedByTitle: false
    }, () => {
      this.getIssues();
    });
  };

  setUrl =() => {
    const params = [];

    if (this.state.search.any) {
      params.push(`any=${this.state.search.any}`);
    }

    if (this.state.isGroupedByTitle) {
      params.push('group=true');
    }

    if (this.state.issue?.id) {
      params.push(`id=${this.state.issue?.id}`);
    }

    this.props.history.push(`${this.props.history.location.pathname}?${params.join('&')}`);
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
      }).catch();
    }
  };

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
  };

  toggleIsGroupedByTitle = () => {
    const isGroupedByTitle = !this.state.isGroupedByTitle;

    this.setState({
      isGroupedByTitle
    }, () => {
      this.setUrl();
    });
  };

  toggleShowSignInForm = () => {
    const showSignInForm = !this.state.showSignInForm;

    this.setState({
      showSignInForm
    });
  };

  toggleShowAddIssueForm = () => {
    const showAddIssueForm = !this.state.showAddIssueForm;

    this.setState({
      issue: JSON.parse(JSON.stringify(this.state.issueDefault)),
      showAddIssueForm,
      showEditIssueForm: false
    });
  };

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
    const showIssues      = !this.state.showAddIssueForm && !this.state.showEditIssueForm && !this.state.isGroupedByTitle;
    const showTitles      = !this.state.showAddIssueForm && !this.state.showEditIssueForm && this.state.isGroupedByTitle;
    const titles          = utils.condenseTitles(this.state.issues);
    const signInOutButton = (this.state.user.isSignedIn) ? (
      <i aria-hidden={true} className="fas fa-sign-out-alt pointer" onClick={this.signOut}></i>
    ) : (
      <i aria-hidden={true} className="fas fa-sign-in-alt pointer" onClick={this.toggleShowSignInForm}></i>
    );

    return (
      <div className="mAuto w600">
        <div className="flex spaceBetween alignCenter mb5">
          <div className="flex alignCenter mr10">
            <i aria-hidden={true} className={`mr5 fas fa-book-open pointer`} onClick={this.resetUrl}></i>
            <h1 className="fs14 bold pointer" onClick={this.resetUrl}>longbox</h1>
          </div>
          <div className="flex alignCenter">
            {this.state.user.isAdmin && (
              <i aria-hidden={true} className={`mr5 fas fa-edit ${this.state.showAddIssueForm ? '' : 'txtRed'} pointer`} onClick={this.toggleShowAddIssueForm}></i>
            )}
            <i aria-hidden={true} className={`mr5 fas fa-folder ${this.state.isGroupedByTitle ? '' : 'txtRed'} pointer`} onClick={this.toggleIsGroupedByTitle}></i>
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
          <section id="search" className="relative mb5">
            <input
            className="searchFieldAny mr10 bdrBox bdrBlack p5 wFull"
            name="any"
            onChange={this.handleSearchChange}
            placeholder="search by title, publisher, contributor, or notes"
            value={this.state.search.any}
            />
            <i aria-hidden={true} className="clearSearchButton fas fa-times absolute pointer fs14" onClick={this.clearSearch}></i>
          </section>
        )}
        {this.state.showAddIssueForm && (
          <AddIssueForm
          addContributor={this.addContributor}
          handleClose={this.handleAddIssueFormClose}
          handleInputBlur={this.handleInputBlur}
          handleContributorTextChange={this.handleContributorTextChange}
          handleIssueCheckboxChange={this.handleIssueCheckboxChange}
          handleIssueTextChange={this.handleIssueTextChange}
          handleInputKeyDown={this.handleInputKeyDown}
          issue={this.state.issue}
          addIssue={this.addIssue}
          user={this.state.user}
          />
        )}
        {this.state.showEditIssueForm && (
          <EditIssueForm
          addContributor={this.addContributor}
          handleClose={this.setIssue}
          handleInputBlur={this.handleInputBlur}
          handleContributorTextChange={this.handleContributorTextChange}
          handleIssueCheckboxChange={this.handleIssueCheckboxChange}
          handleIssueTextChange={this.handleIssueTextChange}
          handleInputKeyDown={this.handleInputKeyDown}
          issue={this.state.issue}
          updateIssue={this.updateIssue}
          user={this.state.user}
          />
        )}
        {showTitles && (
          <section id="titles" className="list grid bdrBox mb5 bdrBlack p5">
            {titles.length > 0 ? titles.map((title, index) => (
              <React.Fragment key={index}>
                <span className="mr5 txtR">{index + 1}.</span>
                <div>
                  <span
                  className="pointer underline-on-hover"
                  onClick={() => {this.setSearchAny(title.name)}}
                  >
                    {title.name}
                  </span>
                  <span>
                    {title.numbers ? ` #${title.numbers}` : ''}
                  </span>
                </div>
              </React.Fragment>
            )) : (<div>...</div>)}
          </section>
        )}
        {showIssues && (
          <section id="issues" className="list grid bdrBox mb5 bdrBlack p5">
            {this.state.issues.length > 0 ? this.state.issues.map((issue, index) => (
              <React.Fragment key={index}>
                <span className="mr5 txtR">{index + 1}.</span>
                <span
                onClick={() => {this.setIssue(issue.id)}}
                className="pointer underline-on-hover"
                >
                  {issue.title}{issue.number ? ` #${issue.number}` : ''}
                </span>
              </React.Fragment>
            )) : (<div>...</div>)}
          </section>
        )}
        <div
        className={`absolute bdrBlack bgWhite overflow-hidden ${this.state.autocomplete.length > 0 ? '' : 'hidden'}`}
        id="autocomplete"
        >
          {this.state.autocomplete.map((suggestion, index) => {
            return (
              <div
              className={`suggestion p5 ${index === this.state.autocompleteIndex ? 'active' : ''}`}
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

export default Main;
