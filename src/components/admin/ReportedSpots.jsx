import React, { useState, useEffect } from 'react';
import SpotDetail from './SpotDetail';
import { MapPinIcon } from '../icons/AdminIcons.jsx';

export default function ReportedSpots() {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState(null);

  useEffect(() => {
    fetchReportedSpots();
  }, []);

  const fetchReportedSpots = async () => {
    try {
      const response = await fetch('http://localhost:5200/api/admin/reported-spots');
      if (response.ok) {
        const data = await response.json();
        setSpots(data);
      }
    } catch (err) {
      console.error('Error fetching reported spots:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSpotProcessed = (spotId) => {
    setSpots((prev) => prev.filter((spot) => spot.spotID !== spotId));
    setSelectedSpot(null);
  };

  const handleSpotFlagged = (spotId) => {
    setSpots((prev) =>
      prev.map((spot) =>
        spot.spotID === spotId ? { ...spot, isVerified: 'Flagged' } : spot
      )
    );
    setSelectedSpot(null);
  };

  const handleBack = () => {
    setSelectedSpot(null);
  };

  if (loading) {
    return <div className="admin-loading">Loading reported spots...</div>;
  }

  if (selectedSpot) {
    return (
      <SpotDetail
        spotId={selectedSpot.spotID}
        onBack={handleBack}
        onDeleted={handleSpotProcessed}
        onFlagged={handleSpotFlagged}
      />
    );
  }

  if (spots.length === 0) {
    return (
      <div className="admin-empty-state">
        <span className="empty-icon"><MapPinIcon size={44} /></span>
        <p>No reported spots.</p>
      </div>
    );
  }

  return (
    <div className="reported-spots-list">
      <div className="reports-list">
        {spots.map((spot) => (
          <div key={spot.spotID} className="report-card">
            <div className="report-header">
              <div className="reported-user-info">
                <h3>{spot.activityName}</h3>
                <span className="reported-email">{spot.location || 'No location'}</span>
              </div>
              <div className="spot-badges">
                <span className={`status-badge status-${(spot.isVerified || 'active').toLowerCase()}`}>
                  {spot.isVerified || 'Active'}
                </span>
                <span className="report-count-badge">{spot.reportCount} report{spot.reportCount !== 1 ? 's' : ''}</span>
              </div>
            </div>

            <div className="application-summary">
              <span className="summary-item">Type: {spot.activityType || 'N/A'}</span>
              <span className="summary-item"> | Submitted by: {spot.submittedByName}</span>
            </div>

            <div className="application-actions">
              <button
                className="btn-view"
                onClick={() => setSelectedSpot(spot)}
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
