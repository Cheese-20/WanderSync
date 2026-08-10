import React, { useState } from 'react';

export default function ReportDetail({ report, onBack, onProcessed }) {
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  const handleSuspend = async () => {
    setActionLoading('suspend');
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:5200/api/admin/reported-accounts/${report.reportID}/suspend`,
        { method: 'PATCH' }
      );
      if (response.ok) {
        onProcessed(report.reportID);
      } else {
        setError('Failed to suspend the account. Please try again.');
      }
    } catch (err) {
      console.error('Error suspending account:', err);
      setError('A network error occurred. Please try again.');
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
        onProcessed(report.reportID);
      } else {
        setError('Failed to delete the report. Please try again.');
      }
    } catch (err) {
      console.error('Error deleting report:', err);
      setError('A network error occurred. Please try again.');
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

        {error && <div className="detail-error">{error}</div>}

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
        </div>
      </div>
    </div>
  );
}
