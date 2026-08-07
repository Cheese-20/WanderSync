import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../components/NavBar';
import '../styles/discover.css';

export default function Discover() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      const res = await axios.get('/api/local-guide/list');
      setGuides(res.data);
    } catch (err) {
      console.error('Error fetching guides:', err);
      setError('Unable to load local guides. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewGuide = (guideId) => {
    navigate(`/guide/${guideId}`);
  };

  return (
    <div className="discover-page">
      <NavBar />

      <header className="discover-hero">
        <h1>Discover Local Guides</h1>
        <p>Connect with experienced local guides who can show you the best of their area</p>
      </header>

      <section className="discover-content">
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
            <h3>No local guides available</h3>
            <p>Check back later as new guides join the community.</p>
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
