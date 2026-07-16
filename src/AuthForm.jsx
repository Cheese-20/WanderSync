import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from './assets/images/logo.png';

function AuthForm() {
  const [isSignUpActive, setIsSignUpActive] = useState(false);
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
        password: loginValues.password
      });

      const { token, user } = response.data;
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Navigate to app home (role-based routing in App.jsx)
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  // ADDED: Make function async and send signup payload to backend
  // NOTE: We use a relative `/api` path so the Vite dev server proxy
  // forwards this request to the ASP.NET backend during development.
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
      <div className="logo-top">
        <img src={logo} alt="WanderSync logo" className="brand-logo" />
        <div className="logo-text">WanderSync</div>
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
              type="email"
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
                Local Guide
              </label>
            </div>

            <a href="#forgot" className="forgot-link">Forgot password?</a>
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
              <h2>Welcome back!</h2>
              <p>To keep connected with us, please login with your personal info.</p>
              <button className="btn transparent" onClick={() => setIsSignUpActive(false)}>
                Sign In
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h2>Hello, friend!</h2>
              <p>Enter your personal details and start your journey with WanderSync.</p>
              <button className="btn transparent" onClick={() => setIsSignUpActive(true)}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;