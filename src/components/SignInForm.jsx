import React from 'react';

class SignInForm extends React.PureComponent {
  render() {
    return (
      <form id="signInForm" onSubmit={this.props.signIn} className="flex mb5">
        <div className="flex bdrBox mr5 flex80">
          <div className="mr5 flex50">
            <input 
            autocomplete="off"
            className="bdrBox bdrGray p5 flex100"
            name="username" 
            onChange={this.props.handleLoginChange} 
            placeholder="username" 
            type="text" 
            value={this.props.username} 
            />
          </div>
          
          <div className="flex50">
            <input 
            autocomplete="off"
            className="bdrBox bdrGray p5 flex100"
            name="password" 
            onChange={this.props.handleLoginChange} 
            placeholder="password" 
            type="password" 
            value={this.props.password} 
            />
          </div>
        </div>

        <button 
        type="submit" 
        className="bdrBox bdrGray p5 flex20 pointer">
          sign in
        </button>
      </form>
    );
  }
}

export default SignInForm;
