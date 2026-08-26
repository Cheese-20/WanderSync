import React, { useState } from 'react';
import ConfirmationPopup from './ConfirmationPopup';

export default function ApplicationDetail({ application, onBack, onProcessed }) {
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [popup, setPopup] = useState(null);

  const handleAccept = async () => {
    setActionLoading('accept');
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:5200/api/admin/applications/${application.applicationID}/approve`,
        { method: 'PATCH' }
      );
      if (response.ok) {
        setPopup({ type: 'success', message: 'Application accepted successfully! User has been promoted to Local Guide.' });
        setTimeout(() => onProcessed(application.applicationID), 3000);
      } else {
        setPopup({ type: 'error', message: 'Failed to accept the application. Please try again.' });
      }
    } catch (err) {
      console.error('Error accepting application:', err);
      setPopup({ type: 'error', message: 'A network error occurred. Please try again.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    setActionLoading('reject');
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:5200/api/admin/applications/${application.applicationID}/reject`,
        { method: 'DELETE' }
      );
      if (response.ok) {
        setPopup({ type: 'success', message: 'Application rejected successfully. The applicant has been notified.' });
        setTimeout(() => onProcessed(application.applicationID), 3000);
      } else {
        setPopup({ type: 'error', message: 'Failed to reject the application. Please try again.' });
      }
    } catch (err) {
      console.error('Error rejecting application:', err);
      setPopup({ type: 'error', message: 'A network error occurred. Please try again.' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="application-detail">
      <button className="btn-back" onClick={onBack}>
        &larr; Back to Applications
      </button>

      <div className="detail-card">
        <div className="detail-card-header">
          <h2>Application Details</h2>
        </div>

        <div className="detail-card-body">
          <div className="detail-field">
            <label>Applicant Name</label>
            <p>{application.userName}</p>
          </div>

          <div className="detail-field">
            <label>Email Address</label>
            <p>{application.email}</p>
          </div>

          <div className="detail-field">
            <label>ID Number</label>
            <p>{application.iDno}</p>
          </div>

          <div className="detail-field">
            <label>Reason for Applying</label>
            <p>{application.reason || 'Not specified'}</p>
          </div>

          <div className="detail-field">
            <label>Location</label>
            <p>{application.location || 'Not specified'}</p>
          </div>

          <div className="detail-field">
            <label>Bio</label>
            <p>{application.bio || 'Not specified'}</p>
          </div>
        </div>

        {successMsg && <div className="detail-success">{successMsg}</div>}
        {error && <div className="detail-error">{error}</div>}

        {!successMsg && (
          <div className="detail-card-footer">
            <button
              className="btn-reject-large"
              onClick={handleReject}
              disabled={actionLoading !== null}
            >
              {actionLoading === 'reject' ? 'Rejecting...' : 'Reject'}
            </button>
            <button
              className="btn-accept-large"
              onClick={handleAccept}
              disabled={actionLoading !== null}
            >
              {actionLoading === 'accept' ? 'Accepting...' : 'Accept'}
            </button>
          </div>
        )}
      </div>
      {popup && (
        <ConfirmationPopup
          type={popup.type}
          message={popup.message}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}
