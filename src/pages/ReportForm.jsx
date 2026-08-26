import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import ConfirmationPopup from '../components/admin/ConfirmationPopup';
import '../styles/report.css';

export default function ReportForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { reportType, reportedUserID, postID } = location.state || {};

  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [popup, setPopup] = useState(null);

  const userJson = localStorage.getItem('user');
  let currentUser = {};
  try { currentUser = JSON.parse(userJson); } catch (e) {}

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!reason.trim()) {
      setError('Please provide a reason for your report.');
      return;
    }

    setLoading(true);

    const reportReason = reportType === 'content'
      ? `[Content Report] ${reason}`
      : reason;

    try {
      const response = await fetch('http://localhost:5200/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterID: currentUser.id,
          reportedUserID: reportedUserID,
          reason: reportReason
        })
      });

      if (response.ok) {
        setPopup({ type: 'success', message: 'Report submitted successfully. Our team will review it shortly.' });
        setTimeout(() => navigate('/home'), 3000);
      } else {
        const data = await response.text();
        setPopup({ type: 'error', message: data || 'Failed to submit report. Please try again.' });
      }
    } catch (err) {
      console.error('Error submitting report:', err);
      setPopup({ type: 'error', message: 'A network error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!reportedUserID) {
    return (
      <div className="report-page">
        <NavBar />
        <div className="report-container">
          <p>Invalid report. Please go back and try again.</p>
          <button className="btn-back-report" onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="report-page">
      <NavBar />
      <div className="report-container">
        <button className="btn-back-report" onClick={() => navigate(-1)}>
          &larr; Back
        </button>

        <div className="report-form-card">
          <h2>{reportType === 'content' ? 'Report Content' : 'Report Account'}</h2>
          <p className="report-description">
            {reportType === 'content'
              ? 'Please describe why you are reporting this content. Our team will review your report.'
              : 'Please describe why you are reporting this account. Our team will review your report.'}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="reason">Reason for reporting</label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={reportType === 'content'
                  ? 'e.g. Inappropriate content, misinformation, spam...'
                  : 'e.g. Inappropriate behaviour, harassment, fake account...'}
                rows={5}
              />
            </div>

            {error && <div className="report-error">{error}</div>}

            <button
              type="submit"
              className="btn-submit-report"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        </div>
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
