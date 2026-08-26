import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/images/logo.png';
import '../styles/styles.css';

export default function ForgotPassword() {
  const [phase, setPhase] = useState('email'); // email | loading | reset | success
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(45);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (phase === 'loading') {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setPhase('reset');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [phase]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    // Optional: could call backend to verify email exists first, but we'll just proceed to loading.
    setError('');
    setTimeLeft(45);
    setPhase('loading');
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await axios.post('/api/auth/reset-password', {
        email: email,
        newPassword: newPassword
      });
      setPhase('success');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <div className="page-container" style={{ background: '#f5f7fa', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="signin-signup-container" style={{ minHeight: 'auto', maxWidth: '500px', width: '100%', padding: '40px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <button type="button" className="logo-text-button" onClick={() => navigate('/home')}>
            <img src={logo} alt="WanderSync logo" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
          </button>
          <h2 style={{ color: '#1e293b', marginTop: '15px' }}>Password Recovery</h2>
        </div>

        {error && <p style={{ color: '#dc2626', textAlign: 'center', marginBottom: '20px' }}>{error}</p>}

        {phase === 'email' && (
          <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', width: '100%' }}>
            <p style={{ textAlign: 'center', color: '#64748b' }}>Enter your email address to recover your account.</p>
            <input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="forgot-input"
              style={{ width: '100%', maxWidth: '450px', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', backgroundColor: '#fff', color: '#333' }}
            />
            <button type="submit" className="btn solid" style={{ width: '100%', maxWidth: '450px', backgroundColor: '#a6d8b6', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Recover Password</button>
            <button type="button" className="btn transparent" style={{ width: '100%', maxWidth: '450px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => navigate('/login')}>
              Back to Login
            </button>
          </form>
        )}

        {phase === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '40px 0' }}>
            <div className="loading-spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #a4ddbc', borderRadius: '50%', width: '60px', height: '60px', animation: 'spin 1s linear infinite' }}></div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            <h3 style={{ color: '#1e293b' }}>Securely Retrieving Data...</h3>
            <p style={{ color: '#64748b', fontSize: '1.2rem' }}>Please wait <strong>{timeLeft}</strong> seconds</p>
          </div>
        )}

        {phase === 'reset' && (
          <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', width: '100%' }}>
            <p style={{ textAlign: 'center', color: '#64748b' }}>Data retrieved. Please enter a new password for {email}.</p>
            <input 
              type="password" 
              placeholder="New Password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              required 
              className="forgot-input"
              style={{ width: '100%', maxWidth: '450px', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', backgroundColor: '#fff', color: '#333' }}
            />
            <input 
              type="password" 
              placeholder="Confirm Password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
              className="forgot-input"
              style={{ width: '100%', maxWidth: '450px', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', backgroundColor: '#fff', color: '#333' }}
            />
            <button type="submit" className="btn solid" style={{ width: '100%', maxWidth: '450px', backgroundColor: '#a6d8b6', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Reset Password</button>
          </form>
        )}

        {phase === 'success' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#a4ddbc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h3 style={{ color: '#1e293b', marginBottom: '10px' }}>Password Reset Successful!</h3>
            <p style={{ color: '#64748b', marginBottom: '30px' }}>Your password has been securely updated.</p>
            <button className="btn solid" onClick={() => navigate('/login')} style={{ width: '100%', maxWidth: '450px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              Return to Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
