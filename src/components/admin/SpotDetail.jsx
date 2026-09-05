import React, { useState, useEffect } from 'react';
import ConfirmationPopup from './ConfirmationPopup';
import { MapPinIcon } from '../icons/AdminIcons.jsx';

// `embedded` renders the card without the "Back" button and titles it with the spot
// name, so several can stack in the reported-spots list. Non-embedded (drill-in) keeps
// the original back button and generic "Spot Details" heading.
export default function SpotDetail({ spotId, onBack, onDeleted, onFlagged, embedded = false }) {
  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  // popup: { type, title, message, onClose } shown after a flag/delete completes.
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    fetchSpotDetail();
  }, [spotId]);

  const fetchSpotDetail = async () => {
    try {
      const response = await fetch(`http://localhost:5200/api/admin/reported-spots/${spotId}`);
      if (response.ok) {
        const data = await response.json();
        setSpot(data);
      }
    } catch (err) {
      console.error('Error fetching spot detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFlag = async () => {
    setActionLoading('flag');
    try {
      const response = await fetch(
        `http://localhost:5200/api/admin/reported-spots/${spotId}/flag`,
        { method: 'PATCH' }
      );
      if (response.ok) {
        // On close, return to the list so it reflects the new status.
        setPopup({
          type: 'success',
          title: 'Spot Flagged',
          message: 'This spot has been flagged. Users will now see a warning on it.',
          onClose: () => onFlagged(spotId)
        });
      } else {
        const data = await response.text();
        setPopup({
          type: 'failure',
          title: 'Could Not Flag Spot',
          message: data || 'Failed to flag the spot. Please try again.',
          onClose: () => setPopup(null)
        });
      }
    } catch (err) {
      setPopup({
        type: 'failure',
        title: 'Could Not Flag Spot',
        message: 'A network error occurred. Please try again.',
        onClose: () => setPopup(null)
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    setActionLoading('delete');
    try {
      const response = await fetch(
        `http://localhost:5200/api/admin/reported-spots/${spotId}`,
        { method: 'DELETE' }
      );
      if (response.ok) {
        setPopup({
          type: 'success',
          title: 'Spot Deleted',
          message: 'This spot has been permanently removed from WanderSync.',
          onClose: () => onDeleted(spotId)
        });
      } else {
        const data = await response.text();
        setPopup({
          type: 'failure',
          title: 'Could Not Delete Spot',
          message: data || 'Failed to delete the spot. Please try again.',
          onClose: () => setPopup(null)
        });
      }
    } catch (err) {
      setPopup({
        type: 'failure',
        title: 'Could Not Delete Spot',
        message: 'A network error occurred. Please try again.',
        onClose: () => setPopup(null)
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading spot details...</div>;
  }

  if (!spot) {
    return (
      <div className="admin-empty-state">
        <p>Spot not found.</p>
        <button className="btn-back" onClick={onBack}>&larr; Back</button>
      </div>
    );
  }

  // Reports come back newest-first, so the first entry is the most recent report.
  const latestReport = spot.reports && spot.reports.length > 0 ? spot.reports[0] : null;

  const formatDate = (value) => {
    if (!value) return 'N/A';
    const d = new Date(value);
    return Number.isNaN(d.getTime())
      ? 'N/A'
      : d.toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className={embedded ? 'spot-detail-embedded' : 'application-detail'}>
      {!embedded && (
        <button className="btn-back" onClick={onBack}>
          &larr; Back to Reported Spots
        </button>
      )}

      <div className="detail-card">
        <div className="detail-card-header">
          <h2>{embedded ? spot.activityName : 'Spot Details'}</h2>
          <div className="spot-badges">
            <span className={`status-badge status-${(spot.isVerified || 'active').toLowerCase()}`}>
              {spot.isVerified || 'Active'}
            </span>
            <span className="report-count-badge">{spot.reportCount} report{spot.reportCount !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="detail-card-body">
          {spot.pictureURL && (
            <div className="spot-image-container">
              <img src={spot.pictureURL} alt={spot.activityName} className="spot-image" />
            </div>
          )}

          {/* When embedded, the spot name is already the card heading. */}
          {!embedded && (
            <div className="detail-field">
              <label>Activity Name</label>
              <p>{spot.activityName}</p>
            </div>
          )}

          {spot.activityType && (
            <div className="detail-field">
              <label>Activity Type</label>
              <p>{spot.activityType}</p>
            </div>
          )}

          {spot.description && (
            <div className="detail-field">
              <label>Description</label>
              <p>{spot.description}</p>
            </div>
          )}

          {spot.location && (
            <div className="detail-field">
              <label>Location</label>
              <p>{spot.location}</p>
            </div>
          )}

          {spot.isVerified && (
            <div className="detail-field">
              <label>Verification Status</label>
              <p>{spot.isVerified}</p>
            </div>
          )}

          {/* Reporting details up front: who raised the most recent report and when.
              The API returns reports newest-first, so reports[0] is the latest. */}
          {latestReport && (
            <>
              <div className="detail-field">
                <label>Reported By</label>
                <p>{latestReport.reporterName || 'Unknown'}</p>
              </div>

              <div className="detail-field">
                <label>Date Reported</label>
                <p>{formatDate(latestReport.sentAt)}</p>
              </div>
            </>
          )}

          <div className="detail-field">
            <label>Number of Reports</label>
            <p className="report-count-large">{spot.reportCount}</p>
          </div>

          {/* Who originally submitted the spot. Distinct from who reported it, and often
              missing on older curated spots. Hidden entirely when unknown rather than
              showing an empty placeholder. */}
          {spot.submittedByName && spot.submittedByName !== 'Unknown' && (
            <div className="detail-field">
              <label>Spot Submitted By</label>
              <p>{spot.submittedByName}</p>
            </div>
          )}

          {spot.submittedAt && (
            <div className="detail-field">
              <label>Spot Submitted On</label>
              <p>{formatDate(spot.submittedAt)}</p>
            </div>
          )}

          {spot.reports && spot.reports.length > 0 && (
            <div className="detail-field">
              <label>Report History</label>
              <ul className="report-history-list">
                {spot.reports.map((r) => (
                  <li key={r.spotReportID} className="report-history-item">
                    <strong>{r.reporterName || 'Unknown'}</strong>: {r.reason}
                    <span className="report-history-date">
                      {r.sentAt ? new Date(r.sentAt).toLocaleDateString() : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="detail-card-footer">
          <button
            className="btn-flag-large"
            onClick={handleFlag}
            disabled={actionLoading !== null || spot.reportCount < 3}
            title={spot.reportCount < 3 ? 'Requires at least 3 reports to flag' : ''}
          >
            {actionLoading === 'flag' ? 'Flagging...' : `Flag Spot (${spot.reportCount}/3)`}
          </button>
          <button
            className="btn-reject-large"
            onClick={handleDelete}
            disabled={actionLoading !== null || spot.reportCount <= 5}
            title={spot.reportCount <= 5 ? 'Requires more than 5 reports to delete' : ''}
          >
            {actionLoading === 'delete' ? 'Deleting...' : `Delete Spot (${spot.reportCount}/6)`}
          </button>
        </div>
      </div>

      {popup && (
        <ConfirmationPopup
          type={popup.type}
          title={popup.title}
          message={popup.message}
          icon={<MapPinIcon size={38} />}
          showClose
          duration={0}
          onClose={popup.onClose}
        />
      )}
    </div>
  );
}
