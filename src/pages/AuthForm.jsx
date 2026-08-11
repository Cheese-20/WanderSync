import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/images/logo.png';

function AuthForm() {
  const [isSignUpActive, setIsSignUpActive] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginValues, setLoginValues] = useState({
    email: '',
    password: '',
    role: 'explorer',
  });

  const [signupValues, setSignupValues] = useState({
    name: '',
    surname: '',
    email: '',
    number: '',
    age: '',
    password: '',
    confirmPassword: '',
  });

  const [signupStatus, setSignupStatus] = useState({
    message: '',
    type: '',
  });

  const [resetValues, setResetValues] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [resetStatus, setResetStatus] = useState({
    message: '',
    type: '',
  });

  const navigate = useNavigate();

  const handleLoginChange = event => {
    const { name, value } = event.target;
    setLoginValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSignupChange = event => {
    const { name, value } = event.target;
    setSignupValues(prev => ({ ...prev, [name]: value }));
    setSignupStatus({ message: '', type: '' });
  };

  // ADDED: Make function async and send login payload to backend
  // NOTE: Use a relative `/api` path; on success store token and user and navigate to home
  const submitLogin = async event => {
    event.preventDefault();

    try {
      const response = await axios.post('/api/auth/login', {
        email: loginValues.email,
        password: loginValues.password,
        role: loginValues.role
      });

      const { token, user } = response.data;
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Navigate to app home (role-based routing in App.jsx)
      navigate('/home');
    } catch (error) {
      let errorMsg = 'Login failed. Please check your credentials.';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMsg = error.response.data;
        } else if (error.response.data.message) {
          errorMsg = error.response.data.message;
        }
      }
      setLoginError(errorMsg);
    }
  };

  // ADDED: Make function async and send signup payload to backend
  // NOTE: We use a relative `/api` path so the Vite dev server proxy
  // forwards this request to the ASP.NET backend during development.

  const handleResetChange = event => {
    const { name, value } = event.target;
    setResetValues(prev => ({ ...prev, [name]: value }));
    setResetStatus({ message: '', type: '' });
  };

  const submitReset = async event => {
    event.preventDefault();

    if (resetValues.newPassword !== resetValues.confirmPassword) {
      setResetStatus({ message: 'Passwords do not match.', type: 'error' });
      return;
    }

    if (resetValues.newPassword.length < 6) {
      setResetStatus({ message: 'Password must be at least 6 characters.', type: 'error' });
      return;
    }

    try {
      const response = await axios.post('/api/auth/reset-password', {
        email: resetValues.email,
        newPassword: resetValues.newPassword,
      });

      setResetStatus({ message: response.data.message || 'Password reset successfully!', type: 'success' });

      setTimeout(() => {
        setShowForgotPassword(false);
        setResetValues({ email: '', newPassword: '', confirmPassword: '' });
        setResetStatus({ message: '', type: '' });
      }, 2000);
    } catch (error) {
      setResetStatus({
        message: error.response?.data?.message || 'Failed to reset password. Please try again.',
        type: 'error',
      });
    }
  };

  const submitSignup = async event => {
    event.preventDefault();

    if (signupValues.password !== signupValues.confirmPassword) {
      setSignupStatus({ message: 'Passwords do not match.', type: 'error' });
      return;
    }

    try {
      // Send data to C# AuthController
      const response = await axios.post('/api/auth/register', {
        name: signupValues.name,
        surname: signupValues.surname,
        email: signupValues.email,
        phoneNumber: signupValues.number,
        age: parseInt(signupValues.age, 10),
        password: signupValues.password,
        confirmPassword: signupValues.confirmPassword
      });

      setSignupStatus({ message: 'User created successfully. You may now sign in.', type: 'success' });

      // Automatically slide back to the login screen after a short delay
      setTimeout(() => {
        setIsSignUpActive(false);
      }, 1500);

    } catch (error) {
      setSignupStatus({
        message: error.response?.data || 'An error occurred during registration.',
        type: 'error'
      });
    }
  };

  return (
    <div className="signin-signup-page">
      {/* Forgot Password Overlay */}
      {showForgotPassword && (
        <div className="forgot-overlay">
          <div className="forgot-card">
            <h2 className="form-title">Reset Password</h2>
            <p className="form-subtitle">Enter your email and new password</p>
            <form onSubmit={submitReset} className="form">
              <input
                name="email"
                type="email"
                value={resetValues.email}
                onChange={handleResetChange}
                placeholder="Your registered email"
                required
              />
              <input
                name="newPassword"
                type="password"
                value={resetValues.newPassword}
                onChange={handleResetChange}
                placeholder="New password"
                required
              />
              <input
                name="confirmPassword"
                type="password"
                value={resetValues.confirmPassword}
                onChange={handleResetChange}
                placeholder="Confirm new password"
                required
              />
              <button type="submit" className="btn solid">Reset Password</button>
              <button
                type="button"
                className="btn transparent"
                onClick={() => { setShowForgotPassword(false); setResetStatus({ message: '', type: '' }); }}
              >
                Back to Sign In
              </button>
              {resetStatus.message && (
                <p className={`signup-status ${resetStatus.type}`}>
                  {resetStatus.message}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    <>
      {isLoading && (
        <div className="global-loading-overlay">
          <div className="global-spinner"></div>
          <div className="global-loading-text">Processing...</div>
        </div>
      )}
      <div className="signin-signup-page">
      <div className="logo-top">
        <img src={logo} alt="WanderSync logo" className="brand-logo" />
        <button type="button" className="logo-text-button" onClick={() => navigate('/home')}>
          <div className="logo-text">WanderSync</div>
        </button>
      </div>
      <div className="signin-signup-container">
        <div className={`signin-signup ${isSignUpActive ? 'sign-up-mode' : ''}`}>
          <div className="form-container sign-in-container">
            <form onSubmit={submitLogin} className="form">
              <h2 className="form-title">Sign in</h2>
              <p className="form-subtitle">Enter details to login</p>

              <input
                id="login-email"
                name="email"
                type="text"
                value={loginValues.email}
                onChange={handleLoginChange}
                placeholder="Email"
                required
              />
              <input
                id="login-password"
                name="password"
                type="password"
                value={loginValues.password}
                onChange={handleLoginChange}
                placeholder="Password"
                required
              />

              <div className="role-grid">
                <label className="radio-label">
                  <input
                    id="login-role-explorer"
                    type="radio"
                    name="role"
                    value="explorer"
                    checked={loginValues.role === 'explorer'}
                    onChange={handleLoginChange}
                  />
                  Explorer
                </label>
                <label className="radio-label">
                  <input
                    id="login-role-guide"
                    type="radio"
                    name="role"
                    value="guide"
                    checked={loginValues.role === 'guide'}
                    onChange={handleLoginChange}
                  />
                  Guide
                </label>
              </div>

              <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
              <button type="submit" className="btn solid">Sign In</button>
              <a href="#" className="forgot-link" onClick={(e) => { e.preventDefault(); setShowForgotPassword(true); }}>Forgot password?</a>
              <button type="submit" className="btn solid">Sign In</button>
              <a href="#forgot" className="forgot-link">Forgot password?</a>
              <button type="submit" className="btn solid" disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </div>

          <div className="form-container sign-up-container">
            <form onSubmit={submitSignup} className="form">
              <h2 className="form-title">Create account</h2>
              <p className="form-subtitle">Use your email for registration</p>

              <div className="input-grid-two">
                <input
                  id="signup-name"
                  name="name"
                  type="text"
                  value={signupValues.name}
                  onChange={handleSignupChange}
                  placeholder="Name"
                  required
                />
                <input
                  id="signup-surname"
                  name="surname"
                  type="text"
                  value={signupValues.surname}
                  onChange={handleSignupChange}
                  placeholder="Surname"
                  required
                />
              </div>

              <input
                id="signup-email"
                name="email"
                type="email"
                value={signupValues.email}
                onChange={handleSignupChange}
                placeholder="Email"
                required
              />
              <input
                id="signup-number"
                name="number"
                type="tel"
                value={signupValues.number}
                onChange={handleSignupChange}
                placeholder="Phone number"
                required
              />
              <input
                id="signup-age"
                name="age"
                type="number"
                min="12"
                value={signupValues.age}
                onChange={handleSignupChange}
                placeholder="Age"
                required
              />
              <input
                id="signup-password"
                name="password"
                type="password"
                value={signupValues.password}
                onChange={handleSignupChange}
                placeholder="Password"
                required
              />
              <input
                id="signup-confirm-password"
                name="confirmPassword"
                type="password"
                value={signupValues.confirmPassword}
                onChange={handleSignupChange}
                placeholder="Confirm Password"
                required
              />

              <button type="submit" className="btn">Sign Up</button>
              {signupStatus.message && (
                <p className={`signup-status ${signupStatus.type}`}>
                  {signupStatus.message}
                </p>
              )}
            </form>
          </div>

          <div className="overlay-container">
            <div className="overlay">
              <div className="overlay-panel overlay-left">
                <h2>Hello, Chommie!</h2>
                <p>If this is not the first time you're here, it means you're back for more. Sign in to see your next adventure </p>
                <button className="btn transparent" onClick={() => setIsSignUpActive(false)}>
                  Sign In
                </button>
              </div>
              <div className="overlay-panel overlay-right">
                <h2>Aweh, Traveller</h2>
                <p>If this is your first time on WanderSync, click Sign Up to join our community.</p>
                <button className="btn transparent" onClick={() => setIsSignUpActive(true)}>
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loginError && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: 'white', padding: '30px', borderRadius: '10px',
            maxWidth: '400px', width: '90%', textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ marginBottom: '15px', color: '#333' }}>Login Failed</h3>
            <p style={{ marginBottom: '25px', color: '#666', lineHeight: '1.5' }}>{loginError}</p>
            <button className="btn solid" onClick={() => setLoginError('')} style={{ margin: '0 auto', display: 'block' }}>
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default AuthForm;