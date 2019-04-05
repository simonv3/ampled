import * as React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import { bindActionCreators } from 'redux';
import { userLoginAction } from 'src/redux/ducks/login';
import { routePaths } from '../route-paths';

import './login.scss';

interface Props {
  login: {
    error: string;
  };
  userLogin: Function;
  authentication: {
    authenticated: boolean;
  };
  location?: {
    showMessage: boolean;
  };
}

class LoginComponent extends React.Component<Props, any> {
  state = {
    email: '',
    password: '',
    submitted: false,
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = this.state;

    await this.props.userLogin(email, password);

    this.setState({ submitted: true });
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  render() {
    const { authentication, login, location } = this.props;

    if (this.state.submitted && !login.error) {
      return <Redirect to={routePaths.connect} />;
    }

    if (authentication.authenticated) {
      return <Redirect to={routePaths.root} />;
    }

    return (
      <div>
        <div className="login">
          <h2>LOGIN</h2>
          <form className="form-container form-control flex-column" name="login" onSubmit={this.handleSubmit}>
            <input
              className="input-group-text"
              type="email"
              placeholder="Email"
              name="email"
              onChange={this.handleChange}
              required
            />
            <input
              className="input-group-text"
              type="password"
              placeholder="Password"
              name="password"
              onChange={this.handleChange}
              required
            />
            <button className="btn" type="submit">
              LOGIN
            </button>
            <span className="error-message">{login.error}</span>
          </form>
          <label>
            Forgot your password?{' '}
            <a href="">
              <u>click here</u>
            </a>
            .
          </label>

          {location.showMessage && (
            <label className="confirmation-message">
              Thank you for signing up!
              <br /> Please check your inbox for a confirmation email.
            </label>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  authentication: state.authentication,
  login: state.userLogin,
});

const mapPropsToDispatch = (dispatch) => ({
  userLogin: bindActionCreators(userLoginAction, dispatch),
});

const Login = connect(
  mapStateToProps,
  mapPropsToDispatch,
)(LoginComponent);

export { Login };
