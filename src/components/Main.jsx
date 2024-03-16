import React from 'react';
import axios from 'axios';
import md5 from 'md5';

import IssueForm from './IssueForm';
import SignInForm from './SignInForm';

import * as utils from '../utils';

const KEYS = {
  DOWN: 40,
  ENTER: 13,
  ESCAPE: 27,
  TAB: 9,
  UP: 38
};

const STATUS = {
  NONE: '',
  PENDING: '...',
  NO_RESULTS: 'No issues found.',
};

class Main extends React.Component {
  constructor(props) {
    super(props);

    const params = new URLSearchParams(this.props.location.search);
    const user = utils.getCookie();

    this.state = {
      autocomplete: [],
      autocompleteIndex: null,
      autocompleteKey: null,
      cancelToken: axios.CancelToken.source(),
      contributorIndex: null,
      contributorKey: null,
      errors: [],
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
        any: params.has('any') ? params.get('any') : undefined,
        issue_id: params.has('id') ? params.get('id') : undefined,
        limit: params.has('limit') & params.get('limit') !== '' ? params.get('limit') : undefined,
      },
      showAddIssueForm: false,
      showEditIssueForm: false,
      showQuickToggle: params.has('toggle') ? params.get('toggle') === 'true' : false,
      showSignInForm: false,
      status: STATUS.NONE,
      user
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
    search.issue_id = '';

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

      document.querySelector('.searchFieldAny').focus();
    });
  };

  duplicateIssue = () => {
    let issue = JSON.parse(JSON.stringify(this.state.issue));
    let search = this.state.search;

    search.issue_id = '';

    issue.id = null;
    issue.number = null;

    this.setState({
      errors: [],
      issue,
      search,
      showAddIssueForm: true,
      showEditIssueForm: false
    }, () => {
      this.setUrl();
    });
  };

  getIssues = () => {
    const data = {
      params: {
        ...this.state.search,
        order_by: 'sort_title, number',
      }
    };

    if (this.state.cancelToken) {
      data.cancelToken = this.state.cancelToken.token;
    }

    this.setState({
      status: STATUS.PENDING,
    });

    axios.get('https://www.rootbeercomics.com/api/longbox/issues.php', data).then(response => {
      if (response) {
        response.data.issues.results.forEach(issue => {
          issue.is_color = utils.getNullableBoolean(issue.is_color);
          issue.is_owned = utils.getNullableBoolean(issue.is_owned);
          issue.is_read  = utils.getNullableBoolean(issue.is_read);
        });

        this.setUrl();

        this.setState({
          cancelToken: null,
          issues: response.data.issues.results,
          status: response.data.issues.results.length > 0 ? STATUS.NONE : STATUS.NO_RESULTS,
        }, () => {
          if (this.state.search.issue_id) {
            this.setIssue(this.state.search.issue_id);
          }
        });
      }
    }).catch(error => {});
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

  handleIssueFormClose = () => {
    let search = this.state.search;

    search.issue_id = '';

    this.setState({
      errors: [],
      search,
      showAddIssueForm: false,
      showEditIssueForm: false
    }, () => {
      this.setIssue();
    });
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

    if (keyCode === KEYS.ESCAPE) {
      this.handleInputBlur();
    }

    if (keyCode === KEYS.UP) {
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

    if (keyCode === KEYS.DOWN) {
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

    if ((keyCode === KEYS.TAB || keyCode === KEYS.ENTER) && typeof autocompleteIndex === 'number') {
      const issue = this.state.issue;

      if (typeof contributorIndex === 'number') {
        issue.contributors[contributorIndex][contributorKey] = this.state.autocomplete[autocompleteIndex];
      } else {
        issue[autocompleteKey] = this.state.autocomplete[autocompleteIndex];

        if (autocompleteKey === 'title') {
          issue['sort_title'] = this.state.autocomplete[autocompleteIndex];
        }
      }

      if (keyCode === KEYS.ENTER) {
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

    if (this.state.isGroupedByTitle) {
      params.push('group=true');
    }

    if (this.state.issue?.id) {
      params.push(`id=${this.state.issue?.id}`);
    }

    if (this.state.search.any) {
      params.push(`any=${this.state.search.any}`);
    }

    if (this.state.search.limit) {
      params.push(`limit=${this.state.search.limit}`);
    }

    if (this.state.showQuickToggle) {
      params.push(`toggle=true`);
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

  toggleAddIssueForm = () => {
    const showAddIssueForm = !this.state.showAddIssueForm;
    let search = this.state.search;

    search.issue_id = '';

    this.setState({
      errors: [],
      issue: JSON.parse(JSON.stringify(this.state.issueDefault)),
      search,
      showAddIssueForm,
      showEditIssueForm: false
    }, () => {
      this.setUrl();
    });
  };

  toggleShowQuickToggle = () => {
    const showQuickToggle = !this.state.showQuickToggle;

    this.setState({
      showQuickToggle
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

  updateIssue = event => {
    event.preventDefault();

    const issues = this.state.issues.slice();
    const data   = {
      params: {
        issue:    this.state.issue,
        md5:      this.state.user.md5,
        username: this.state.user.name
      }
    };

    issues.forEach(issue => {
      if (issue.id === this.state.issue.id) {
        issue = this.state.issue;
      }
    });

    this.setState({
      errors: []
    }, () => {
      axios.get('https://www.rootbeercomics.com/api/longbox/update.php', data).then(response => {
        if (response.data.success) {
          this.setState({
            errors: [],
            issue: null,
            issues,
            showEditIssueForm: false
          }, this.setUrl);
        } else {
          this.setState({
            errors: response.data.errors
          });
        }
      });
    });
  };

  updateIssueByToggle = params => {
    const issues = this.state.issues.slice();

    params.issue[params.field] = !params.issue[params.field];

    issues.forEach(issue => {
      if (issue.id === params.issue.id) {
        issue = params.issue;
      }
    });

    const data   = {
      params: {
        username: this.state.user.name,
        md5:      this.state.user.md5,
        issue:    params.issue
      }
    };

    axios.get('https://www.rootbeercomics.com/api/longbox/update.php', data).then(response => {
      if (response) {
        this.setState({
          issues
        });
      }
    });
  };

  render() {
    const showIssues      = !this.state.showAddIssueForm && !this.state.showEditIssueForm && !this.state.isGroupedByTitle && !this.state.showQuickToggle;
    const showTitles      = !this.state.showAddIssueForm && !this.state.showEditIssueForm && this.state.isGroupedByTitle && !this.state.showQuickToggle;
    const showQuickToggle = !this.state.showAddIssueForm && !this.state.showEditIssueForm && this.state.showQuickToggle;
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
            {this.state.user.isAdmin && this.state.issue && (
              <i aria-hidden={true} className="mr5 fas fa-clone pointer" onClick={this.duplicateIssue}></i>
            )}
            {this.state.user.isAdmin && (
              <i aria-hidden={true} className={`mr5 fas fa-edit ${this.state.showAddIssueForm ? '' : 'txtRed'} pointer`} onClick={this.toggleAddIssueForm}></i>
            )}
            <i aria-hidden={true} className={`mr5 fas fa-check-square ${this.state.showQuickToggle ? '' : 'txtRed'} pointer`} onClick={this.toggleShowQuickToggle}></i>
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
            autocomplete="off"
            className="searchFieldAny mr10 bdrBox bdrBlack p5 wFull"
            name="any"
            onChange={this.handleSearchChange}
            placeholder="search by title, publisher, contributor, or notes"
            value={this.state.search.any}
            />
            <i aria-hidden={true} className="clearSearchButton fas fa-times absolute pointer fs14" onClick={this.clearSearch}></i>
          </section>
        )}

        {(this.state.showAddIssueForm || this.state.showEditIssueForm) && (
          <IssueForm
          addContributor={this.addContributor}
          buttonLabel={this.state.showAddIssueForm ? 'add issue(s)' : 'update issue'}
          errors={this.state.errors}
          handleClose={this.handleIssueFormClose}
          handleInputBlur={this.handleInputBlur}
          handleContributorTextChange={this.handleContributorTextChange}
          handleIssueCheckboxChange={this.handleIssueCheckboxChange}
          handleIssueTextChange={this.handleIssueTextChange}
          handleInputKeyDown={this.handleInputKeyDown}
          handleSubmit={this.state.showAddIssueForm ? this.addIssue : this.updateIssue}
          issue={this.state.issue}
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
            )) : (<div class="whitespace-no-wrap">{this.state.status}</div>)}
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
            )) : (<div class="whitespace-no-wrap">{this.state.status}</div>)}
          </section>
        )}

        {showQuickToggle && (
          <table id="quick-toggle" className="bdrBox mb5 bdrBlack p5 flex100">
            <tbody>
              {this.state.issues.length > 0 ? this.state.issues.map((issue, index) => (
                <tr key={index}>
                  <td className="mr5 txtR">
                    {index + 1}.
                  </td>

                  <td>
                    <span
                    onClick={() => {this.setIssue(issue.id)}}
                    className="pointer underline-on-hover"
                    >
                      {issue.title}{issue.number ? ` #${issue.number}` : ''}
                    </span>
                  </td>

                  <td className="mr10 whitespace-no-wrap">
                    <input
                    autocomplete="off"
                    checked={issue.is_read}
                    className="inline-block mr5 pointer"
                    id={`read${index}`}
                    onChange={() => {
                      if (this.state.user.isAdmin) {
                        this.updateIssueByToggle({
                          field: 'is_read',
                          issue
                        });
                      }
                    }}
                    type="checkbox"
                    />
                    <label
                    className={`inline-block pointer ${issue.is_read === null ? 'txtRed' : ''}`}
                    htmlFor={`read${index}`}
                    >
                      read
                    </label>
                  </td>

                  <td className="mr10 whitespace-no-wrap">
                    <input
                    autocomplete="off"
                    checked={issue.is_owned}
                    className="inline-block mr5 pointer"
                    id={`owned${index}`}
                    onChange={() => {
                      if (this.state.user.isAdmin) {
                        this.updateIssueByToggle({
                          field: 'is_owned',
                          issue
                        });
                      }
                    }}
                    type="checkbox"
                    />
                    <label
                    className={`inline-block pointer ${issue.is_owned === null ? 'txtRed' : ''}`}
                    htmlFor={`owned${index}`}
                    >
                      owned
                    </label>
                  </td>

                  <td className="whitespace-no-wrap">
                    <input
                    autocomplete="off"
                    checked={issue.is_color}
                    className="inline-block mr5 pointer"
                    id={`color${index}`}
                    onChange={() => {
                      if (this.state.user.isAdmin) {
                        this.updateIssueByToggle({
                          field: 'is_color',
                          issue
                        });
                      }
                    }}
                    type="checkbox"
                    />
                    <label
                    className={`inline-block pointer ${issue.is_color === null ? 'txtRed' : ''}`}
                    htmlFor={`color${index}`}
                    >
                      color
                    </label>
                  </td>
                </tr>
              )) : (<tr><td class="col-span-all">{this.state.status}</td></tr>)}
            </tbody>
          </table>
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
export { KEYS };
