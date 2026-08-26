import React, { useEffect } from 'react';

export default function ConfirmationPopup({ type, message, onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const isSuccess = type === 'success';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      zIndex: 9999
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '20px',
        padding: '40px 50px',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        maxWidth: '400px',
        width: '90%',
        animation: 'fadeIn 0.3s ease'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: isSuccess ? '#e8f5e9' : '#ffebee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto'
        }}>
          {isSuccess ? (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#3d5a3e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="#c62828" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <p style={{
          fontSize: '1.1rem',
          fontWeight: '500',
          color: '#333',
          margin: 0,
          lineHeight: '1.5'
        }}>
          {message}
        </p>
      </div>
    </div>
  );
}
