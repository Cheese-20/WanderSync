import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/discover.css';

export default function Discover() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [appliedLocation, setAppliedLocation] = useState('');
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has a known location from their profile
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        const userLocation = user.location || '';
        if (userLocation) {
          setLocationFilter(userLocation);
          setAppliedLocation(userLocation);
          fetchGuidesByLocation(userLocation);
          return;
        }
      } catch (e) {
        // ignore parse errors
      }
    }
    // No location known — show prompt and load all guides
    setShowLocationPrompt(true);
    fetchAllGuides();
  }, []);

  const fetchAllGuides = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/local-guide/by-location');
      setGuides(res.data);
    } catch (err) {
      console.error('Error fetching guides:', err);
      setError('Unable to load local guides. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchGuidesByLocation = async (location) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/local-guide/by-location', {
        params: { location: location || undefined }
      });
      setGuides(res.data);
      if (location) {
        setShowLocationPrompt(false);
      }
    } catch (err) {
      console.error('Error fetching guides by location:', err);
      setError('Unable to load local guides. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setAppliedLocation(locationFilter.trim());
    fetchGuidesByLocation(locationFilter.trim());
  };

  const handleClearFilter = () => {
    setLocationFilter('');
    setAppliedLocation('');
    setShowLocationPrompt(true);
    fetchGuidesByLocation('');
  };

  const handleViewGuide = (guideId) => {
    navigate(`/guide/${guideId}`);
  };

  const renderStars = (score) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < Math.round(score) ? 'filled' : ''}`}>&#9733;</span>
    ));
  };

  return (
    <div className="discover-page">

      <header className="discover-hero">
        <h1>Discover Local Guides</h1>
        <p>Connect with experienced local guides who can show you the best of their area</p>
      </header>

      {/* Location Filter */}
      <form className="discover-filters" onSubmit={handleFilterSubmit}>
        <input
          type="text"
          className="filter-input"
          placeholder="Search by location (e.g. Cape Town, Johannesburg...)"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          aria-label="Filter guides by location"
        />
        <button type="submit" className="btn-filter">Search</button>
        {appliedLocation && (
          <button type="button" className="btn-filter-clear" onClick={handleClearFilter}>
            Clear
          </button>
        )}
      </form>

      <section className="discover-content">
        {showLocationPrompt && !appliedLocation && (
          <div className="location-prompt">
            <p>Enter your location above to see local guides in your area, or browse all available guides below.</p>
          </div>
        )}

        {appliedLocation && !loading && !error && (
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>
            Showing guides near <strong>{appliedLocation}</strong>
          </p>
        )}

        {loading && (
          <div className="discover-loading">
            <div className="loading-spinner"></div>
            <p>Loading guides...</p>
          </div>
        )}

        {error && (
          <div className="discover-error">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && guides.length === 0 && (
          <div className="discover-empty">
            <h3>No local guides found</h3>
            <p>
              {appliedLocation
                ? `No guides found in "${appliedLocation}". Try a different location or clear the filter.`
                : 'Check back later as new guides join the community.'}
            </p>
          </div>
        )}

        {!loading && !error && guides.length > 0 && (
          <div className="guides-grid">
            {guides.map((guide) => (
              <div key={guide.guideId} className="guide-card" onClick={() => handleViewGuide(guide.guideId)}>
                <div className="guide-card-avatar">
                  {guide.profilePictureLink ? (
                    <img src={guide.profilePictureLink} alt={`${guide.firstName} ${guide.lastName}`} />
                  ) : (
                    <div className="guide-card-avatar-placeholder">
                      {guide.firstName?.charAt(0)}{guide.lastName?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="guide-card-info">
                  <h3>{guide.firstName} {guide.lastName}</h3>
                  {guide.location && (
                    <p className="guide-card-location">
                      <span className="location-icon">&#x1F4CD;</span> {guide.location}
                    </p>
                  )}
                  {guide.averageRating > 0 && (
                    <div className="guide-card-rating">
                      {renderStars(guide.averageRating)}
                      <span className="rating-count">({guide.totalRatings})</span>
                    </div>
                  )}
                  {guide.description && (
                    <p className="guide-card-description">{guide.description}</p>
                  )}
                  {guide.interests && (
                    <div className="guide-card-interests">
                      {guide.interests.split(',').slice(0, 3).map((interest, idx) => (
                        <span key={idx} className="interest-tag">{interest.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>
                <button className="guide-card-btn" onClick={(e) => { e.stopPropagation(); handleViewGuide(guide.guideId); }}>
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
