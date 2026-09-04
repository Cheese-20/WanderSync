import React, { useEffect } from 'react';

/**
 * Centred confirmation modal used across the admin screens.
 *
 * Props:
 *  - type       'success' | 'failure' (anything not 'success' is treated as failure)
 *  - message    body text
 *  - onClose    called on auto-dismiss or when the Close button / X is clicked
 *  - duration   auto-dismiss delay in ms (default 3000). Pass 0 to disable auto-dismiss.
 *  - title      optional heading shown above the message (e.g. "Report Spot")
 *  - icon       optional custom icon node shown in the circle instead of the default tick/cross
 *  - showClose  optional; when true, renders a full-width Close button and an X in the corner
 *
 * The first four props are the original contract; existing callers (ApplicationDetail,
 * ReportDetail, Dashboard, ReportForm) pass only those and are unaffected by the additions.
 */
export default function ConfirmationPopup({
  type,
  message,
  onClose,
  duration = 3000,
  title,
  icon,
  showClose = false,
}) {
  useEffect(() => {
    if (!duration) return undefined; // duration 0 => stay until dismissed manually
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
        position: 'relative',
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        padding: '40px 50px',
        textAlign: 'center',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 10px 40px rgba(0, 0, 0, 0.2)',
        maxWidth: '420px',
        width: '90%',
        animation: 'fadeIn 0.3s ease'
      }}>
        {showClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: '16px',
              right: '18px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#9ca3af',
              lineHeight: 1,
              padding: 0
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}

        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: isSuccess ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${isSuccess ? '#bbf7d0' : '#fecaca'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
          color: isSuccess ? '#1a8f66' : '#ef4444'
        }}>
          {icon ? icon : isSuccess ? (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#1a8f66" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>

        {title && (
          <h2 style={{
            margin: '0 0 12px 0',
            fontSize: '1.4rem',
            fontWeight: 700,
            color: '#1a1a1a'
          }}>
            {title}
          </h2>
        )}

        <p style={{
          fontSize: title ? '1.1rem' : '1rem',
          fontWeight: title ? 700 : 500,
          color: isSuccess && title ? '#1a8f66' : '#1f2937',
          margin: 0,
          lineHeight: '1.6'
        }}>
          {message}
        </p>

        {showClose && (
          <button
            type="button"
            className="btn-accept-large"
            onClick={onClose}
            style={{ marginTop: '24px', width: '100%' }}
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}
