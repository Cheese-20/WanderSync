import React, { createContext, useState, useContext } from 'react';
import logo from '../assets/images/logo.png'; // Make sure this path resolves correctly
import '../styles/feedback.css';

const FeedbackContext = createContext();

export function useFeedback() {
  return useContext(FeedbackContext);
}

export function FeedbackProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  const showLoading = (msg = 'Loading, please wait...') => {
    setMessage(msg);
    setStatus('loading');
    setIsOpen(true);
  };

  const showSuccess = (msg = 'Action completed successfully!') => {
    setMessage(msg);
    setStatus('success');
    setIsOpen(true);
  };

  const showError = (msg = 'An error occurred. Please try again.') => {
    setMessage(msg);
    setStatus('error');
    setIsOpen(true);
  };

  const closeFeedback = () => {
    setIsOpen(false);
    setStatus('idle');
    setMessage('');
  };

  const withFeedback = async (asyncFn, { loadingMsg = 'Updating, please wait...', successMsg = 'Success!' } = {}) => {
    showLoading(loadingMsg);
    try {
      await asyncFn();
      showSuccess(successMsg);
    } catch (error) {
      console.error(error);
      const errorMsg = error?.response?.data?.message || error?.message || 'An error occurred.';
      showError(errorMsg);
      throw error; // Re-throw in case the caller needs it
    }
  };

  return (
    <FeedbackContext.Provider value={{ showLoading, showSuccess, showError, closeFeedback, withFeedback }}>
      {children}
      
      {isOpen && (
        <div className="global-loading-overlay" style={{ zIndex: 9999 }}>
          <div className="global-loading-popup" style={{ textAlign: 'center', padding: '2rem', maxWidth: '400px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
            
            {status === 'loading' && (
              <>
                <img src={logo} alt="WanderSync" className="brand-logo" style={{ width: '60px', height: 'auto', marginBottom: '1.5rem', animation: 'pulse 1.5s infinite' }} />
                <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>{message}</h3>
                <div className="loading-spinner" style={{ margin: '0 auto', width: '30px', height: '30px', border: '3px solid #f3f3f3', borderTop: '3px solid #1a8f66', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              </>
            )}

            {status === 'success' && (
              <>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', fontSize: '30px' }}>
                  ✓
                </div>
                <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>{message}</h3>
                <button 
                  onClick={closeFeedback}
                  style={{ width: '100%', padding: '12px', borderRadius: '24px', backgroundColor: '#1a8f66', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem' }}
                >
                  OK
                </button>
              </>
            )}

            {status === 'error' && (
              <>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', fontSize: '30px', fontWeight: 'bold' }}>
                  !
                </div>
                <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>Oops!</h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>{message}</p>
                <button 
                  onClick={closeFeedback}
                  style={{ width: '100%', padding: '12px', borderRadius: '24px', backgroundColor: '#ef4444', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Dismiss
                </button>
              </>
            )}

          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  );
}
