import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Main from './components/Main';

import './css/library.css';

class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <Route component={Main} path="/" />
      </BrowserRouter>
    );
  };
}

export default App;
