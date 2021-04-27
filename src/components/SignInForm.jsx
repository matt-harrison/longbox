import React from 'react';

class SignInForm extends React.PureComponent {
  render() {
    return (
      <form id="signInForm" onSubmit={this.props.signIn} className="flex mb5">
        <div className="flex bdrBox mr5 flex80">
          <div className="mr5 flex50">
            <input type="text" name="username" placeholder="username" value={this.props.username} onChange={this.props.handleLoginChange} className="bdrBox bdrGray p5 flex100"/>
          </div>
          <div className="flex50">
            <input type="password" name="password" placeholder="password" value={this.props.password} onChange={this.props.handleLoginChange} className="bdrBox bdrGray p5 flex100"/>
          </div>
        </div>
        <button type="submit" className="bdrBox bdrGray p5 flex20 pointer">sign in</button>
      </form>
    );
  }
}

export default SignInForm;
