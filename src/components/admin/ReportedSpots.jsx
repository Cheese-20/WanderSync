import React, { useState, useEffect } from 'react';
import SpotDetail from './SpotDetail';
import { MapPinIcon } from '../icons/AdminIcons.jsx';

export default function ReportedSpots() {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // A spot that has been deleted drops out of the list; a flagged spot stays but its
  // status updates. Each embedded SpotDetail reports back via these callbacks.
  const handleSpotDeleted = (spotId) => {
    setSpots((prev) => prev.filter((spot) => spot.spotID !== spotId));
  };

  const handleSpotFlagged = (spotId) => {
    setSpots((prev) =>
      prev.map((spot) =>
        spot.spotID === spotId ? { ...spot, isVerified: 'Flagged' } : spot
      )
    );
  };

  if (loading) {
    return <div className="admin-loading">Loading reported spots...</div>;
  }

  if (spots.length === 0) {
    return (
      <div className="admin-empty-state">
        <span className="empty-icon"><MapPinIcon size={44} /></span>
        <p>No reported spots.</p>
      </div>
    );
  }

  // Show every reported spot's full details inline, so the admin sees all reports,
  // report history and the flag/delete actions without opening each spot individually.
  return (
    <div className="reported-spots-list">
      {spots.map((spot) => (
        <SpotDetail
          key={spot.spotID}
          spotId={spot.spotID}
          embedded
          onDeleted={handleSpotDeleted}
          onFlagged={handleSpotFlagged}
        />
      ))}
    </div>
  );
}
