import React, { useState } from 'react';
import ConfirmationPopup from './ConfirmationPopup';

export default function ReportDetail({ report, onBack, onProcessed }) {
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [popup, setPopup] = useState(null);

  const handleSuspend = async () => {
    setActionLoading('suspend');
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:5200/api/admin/reported-accounts/${report.reportID}/suspend`,
        { method: 'PATCH' }
      );
      if (response.ok) {
        setPopup({ type: 'success', message: 'Account suspended successfully for 2 weeks. The user has been notified.' });
        setTimeout(() => onProcessed(report.reportID), 3000);
      } else {
        setPopup({ type: 'error', message: 'Failed to suspend the account. Please try again.' });
      }
    } catch (err) {
      console.error('Error suspending account:', err);
      setPopup({ type: 'error', message: 'A network error occurred. Please try again.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    setActionLoading('delete');
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:5200/api/admin/reported-accounts/${report.reportID}`,
        { method: 'DELETE' }
      );
      if (response.ok) {
        setPopup({ type: 'success', message: 'Report deleted successfully. The reported user\'s account remains unaffected.' });
        setTimeout(() => onProcessed(report.reportID), 3000);
      } else {
        setPopup({ type: 'error', message: 'Failed to delete the report. Please try again.' });
      }
    } catch (err) {
      console.error('Error deleting report:', err);
      setPopup({ type: 'error', message: 'A network error occurred. Please try again.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleBan = async () => {
    if (!window.confirm('Are you sure you want to permanently ban this user? This action cannot be undone.')) {
      return;
    }
    setActionLoading('ban');
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:5200/api/admin/reported-accounts/${report.reportID}/ban`,
        { method: 'PATCH' }
      );
      if (response.ok) {
        setPopup({ type: 'success', message: 'User has been permanently banned. They will no longer be able to access the platform.' });
        setTimeout(() => onProcessed(report.reportID), 3000);
      } else {
        const data = await response.text();
        setPopup({ type: 'error', message: data || 'Failed to ban the user. Please try again.' });
      }
    } catch (err) {
      console.error('Error banning user:', err);
      setPopup({ type: 'error', message: 'A network error occurred. Please try again.' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="application-detail">
      <button className="btn-back" onClick={onBack}>
        &larr; Back to Reports
      </button>

      <div className="detail-card">
        <div className="detail-card-header">
          <h2>Report Details</h2>
          <span className={`status-badge status-${report.status.toLowerCase()}`}>
            {report.status}
          </span>
        </div>

        <div className="detail-card-body">
          <div className="detail-field">
            <label>Reported User</label>
            <p>{report.reportedUserName}</p>
          </div>

          <div className="detail-field">
            <label>Reported User Email</label>
            <p>{report.reportedUserEmail}</p>
          </div>

          <div className="detail-field">
            <label>Reported By</label>
            <p>{report.reporterName}</p>
          </div>

          <div className="detail-field">
            <label>Reason</label>
            <p>{report.reason || 'No reason provided'}</p>
          </div>

          <div className="detail-field">
            <label>Date Reported</label>
            <p>{report.sentAt ? new Date(report.sentAt).toLocaleDateString('en-ZA', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'N/A'}</p>
          </div>
        </div>

        {popup && (
          <ConfirmationPopup
            type={popup.type}
            message={popup.message}
            onClose={() => setPopup(null)}
          />
        )}
        {successMsg && <div className="detail-success">{successMsg}</div>}
        {error && <div className="detail-error">{error}</div>}

        {!successMsg && (
          <div className="detail-card-footer">
            <button
              className="btn-reject-large"
              onClick={handleDelete}
              disabled={actionLoading !== null}
            >
              {actionLoading === 'delete' ? 'Deleting...' : 'Delete Report'}
            </button>
            <button
              className="btn-suspend-large"
              onClick={handleSuspend}
              disabled={actionLoading !== null}
            >
              {actionLoading === 'suspend' ? 'Suspending...' : 'Suspend (2 Weeks)'}
            </button>
            <button
              className="btn-ban-large"
              onClick={handleBan}
              disabled={actionLoading !== null}
            >
              {actionLoading === 'ban' ? 'Banning...' : 'Ban Permanently'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
