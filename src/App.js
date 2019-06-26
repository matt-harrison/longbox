import React from 'react';
import axios from 'axios';
// import md5 from 'md5';

import('./css/library.css');

class App extends React.Component {
  // constructor(props) {
  //   super(props);
  // };

  state = {
    cancelToken: null,
    issues: [],
    search: {
      any: ''
    }
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
      axios.get('https://www.rootbeercomics.com/api/longbox/get.php', {
        cancelToken: this.state.cancelToken.token,
        params: {
          any: this.state.search.any
        }
      }).then(response => {
        if (response) {
          this.setState({
            cancelToken: null,
            issues: response.data.issues.results
          });
        }
      });
    });
  };

  render() {
    return (
      <div className="mAuto w600">
        <div className="flex spaceBetween alignCenter mb5 fs14">
          <p className="flex alignCenter mr5 bold">
            <i aria-hidden={true} className={`mr10 fas fa-book-open csrPointer`}></i>
            <span>longbox</span>
          </p>
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
        <section id="list" className="bdrBox bdrBlack p5">
          {
            this.state.issues.length > 0 ? this.state.issues.map((issue, index) => {
              return (
                <div key={index}>
                  <span>{index + 1}. {issue.title}{issue.number ? ` #${issue.number}` : ''}</span>
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
