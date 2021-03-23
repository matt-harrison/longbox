import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Main from './components/Main';
import { createBrowserHistory } from 'history';

import './css/library.css';

class App extends React.Component {
  render() {
    const history = createBrowserHistory();

    return (
      <BrowserRouter history={history}>
        <Route component={Main} path="/" />
      </BrowserRouter>
    );
  };
}

export default App;
