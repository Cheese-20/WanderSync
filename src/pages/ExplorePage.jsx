import React, { useState, useEffect } from 'react';
//import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../components/NavBar';
import '../styles/explore.css';

export default function ExplorePage() {
  const [query, setQuery] = useState('');
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Load all guides on initial page load
    searchGuides('');
  }, []);

  const searchGuides = async (searchTerm) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/local-guide/search', {
        params: { query: searchTerm }
      });
      setGuides(res.data);
      setHasSearched(true);
    } catch (err) {
      console.error('Error searching guides:', err);
      setError('Unable to search guides. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchGuides(query.trim());
  };

  const handleClear = () => {
    setQuery('');
    searchGuides('');
  };

  const handleViewGuide = (guideId) => {
    navigate(`/guide/${guideId}`);
  };

  return (
    <div className="explore-page">
      <NavBar />

      <header className="explore-hero">
        <h1>Search Local Guides</h1>
        <p>Find the perfect local guide by name, location, or interests</p>
      </header>

      <section className="explore-search-section">
        <form className="explore-search-form" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <span className="search-icon" aria-hidden="true">&#128269;</span>
            <input
              type="text"
              className="explore-search-input"
              placeholder="Search by name, location, or interest..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search local guides"
            />
            {query && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={handleClear}
                aria-label="Clear search"
              >
                &times;
              </button>
            )}
          </div>
          <button type="submit" className="explore-search-btn">
            Search
          </button>
        </form>
      </section>

      <section className="explore-results">
        {loading && (
          <div className="explore-loading">
            <div className="loading-spinner"></div>
            <p>Searching guides...</p>
          </div>
        )}

        {error && (
          <div className="explore-error">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && hasSearched && guides.length === 0 && (
          <div className="explore-empty">
            <h3>No guides found</h3>
            <p>Try a different search term or clear the search to see all guides.</p>
          </div>
        )}

        {!loading && !error && guides.length > 0 && (
          <>
            <p className="explore-results-count">
              {guides.length} guide{guides.length !== 1 ? 's' : ''} found
            </p>
            <div className="explore-guides-grid">
              {guides.map((guide) => (
                <div
                  key={guide.guideId}
                  className="explore-guide-card"
                  onClick={() => handleViewGuide(guide.guideId)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleViewGuide(guide.guideId); }}
                >
                  <div className="explore-guide-avatar">
                    {guide.profilePictureLink ? (
                      <img src={guide.profilePictureLink} alt={`${guide.firstName} ${guide.lastName}`} />
                    ) : (
                      <div className="explore-avatar-placeholder">
                        {guide.firstName?.charAt(0)}{guide.lastName?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="explore-guide-info">
                    <h3>{guide.firstName} {guide.lastName}</h3>
                    {guide.location && (
                      <p className="explore-guide-location">
                        <span className="location-icon">&#x1F4CD;</span> {guide.location}
                      </p>
                    )}
                    {guide.job && (
                      <p className="explore-guide-job">{guide.job}</p>
                    )}
                    {guide.description && (
                      <p className="explore-guide-description">{guide.description}</p>
                    )}
                    {guide.interests && (
                      <div className="explore-guide-interests">
                        {guide.interests.split(',').slice(0, 4).map((interest, idx) => (
                          <span key={idx} className="interest-tag">{interest.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    className="explore-view-btn"
                    onClick={(e) => { e.stopPropagation(); handleViewGuide(guide.guideId); }}
                  >
                    View Profile
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
