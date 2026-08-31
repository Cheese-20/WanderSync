import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/images/logo.png';
import { setActiveMode, resolveLoginMode } from '../utils/session';

const MIN_AGE = 12;
const MAX_AGE = 150;

// Each rule doubles as the advice shown when it isn't met.
const PASSWORD_RULES = [
  { label: 'at least 8 characters', isMet: value => value.length >= 8 },
  { label: 'one uppercase letter', isMet: value => /[A-Z]/.test(value) },
  { label: 'one special character', isMet: value => /[^A-Za-z0-9]/.test(value) }
];

const PASSWORD_ADVICE =
  'Please use a strong password with at least 8 characters, one uppercase letter and one special character.';

function validateAge(value) {
  const raw = String(value ?? '').trim();
  if (!/^\d+$/.test(raw)) {
    return 'Please enter your age as a whole number.';
  }
  const age = parseInt(raw, 10);
  if (age < MIN_AGE) {
    return `You must be at least ${MIN_AGE} years old to create an account.`;
  }
  if (age > MAX_AGE) {
    return `Please enter a valid age between ${MIN_AGE} and ${MAX_AGE}.`;
  }
  return '';
}

function validatePassword(value) {
  const password = String(value ?? '');
  const missing = PASSWORD_RULES.filter(rule => !rule.isMet(password)).map(rule => rule.label);
  if (missing.length === 0) return '';
  return `${PASSWORD_ADVICE} Yours is missing: ${missing.join(', ')}.`;
}

function AuthForm() {
  const [isSignUpActive, setIsSignUpActive] = useState(false);
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

      // Remember what they chose to log in as. A verified guide who picked Explorer
      // gets the explorer experience; picking Guide only works if the account really is one
      // (the backend rejects the request otherwise).
      setActiveMode(resolveLoginMode(user, loginValues.role));

      // Navigate to app home (mode-based routing in App.jsx)
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
  const submitSignup = async event => {
    event.preventDefault();

    const ageError = validateAge(signupValues.age);
    if (ageError) {
      setSignupStatus({ message: ageError, type: 'error' });
      return;
    }

    const passwordError = validatePassword(signupValues.password);
    if (passwordError) {
      setSignupStatus({ message: passwordError, type: 'error' });
      return;
    }

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
      // The API returns plain strings for registration errors, but guard against
      // an object body so we never try to render one.
      const data = error.response?.data;
      let errorMsg = 'An error occurred during registration.';
      if (typeof data === 'string' && data.trim()) {
        errorMsg = data;
      } else if (data?.message) {
        errorMsg = data.message;
      }
      setSignupStatus({ message: errorMsg, type: 'error' });
    }
  };

  return (
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
                min={MIN_AGE}
                max={MAX_AGE}
                step="1"
                value={signupValues.age}
                onChange={handleSignupChange}
                placeholder={`Age (${MIN_AGE}-${MAX_AGE})`}
                required
              />
              <input
                id="signup-password"
                name="password"
                type="password"
                value={signupValues.password}
                onChange={handleSignupChange}
                placeholder="Password"
                aria-describedby="signup-password-hint"
                required
              />
              <p id="signup-password-hint" className="field-hint">
                Use at least 8 characters, one uppercase letter and one special character.
              </p>
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