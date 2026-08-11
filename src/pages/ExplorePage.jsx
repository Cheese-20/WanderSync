import React, { useState, useEffect } from 'react';
import '../styles/explore.css';

export default function ExplorePage() {
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ activityName: '', activityType: '', description: '', location: '' });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setUserRole((user.role || '').toLowerCase());
        setUserId(user.id);
      } catch (e) {
        console.error("Error parsing user from local storage", e);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.activityName || !formData.activityType || !formData.description || !formData.location) {
      setErrorMessage('Please fill in all mandatory fields.');
      return;
    }

    try {
      const payload = {
        activityName: formData.activityName,
        activityType: formData.activityType,
        description: formData.description,
        location: formData.location
      };

      const res = await fetch('/api/curatedspots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Failed to submit location');
      }

      setSuccessMessage('Submission Received! Your new spot is pending verification.');
      setFormData({ activityName: '', activityType: '', description: '', location: '' });
      setTimeout(() => {
        setShowModal(false);
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setErrorMessage('An error occurred while saving the record. Please try again.');
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/explore.css';

export default function ExplorePage() {
  const [query, setQuery] = useState('');
  const [guides, setGuides] = useState([]);
  const [tours, setTours] = useState([]);
  const [filteredGuides, setFilteredGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAllTours, setShowAllTours] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch guides and tours in parallel
      const [guidesRes, toursRes] = await Promise.all([
        axios.get('/api/local-guide/list'),
        axios.get('/api/tours')
      ]);
      setGuides(guidesRes.data || []);
      setFilteredGuides(guidesRes.data || []);
      setTours(toursRes.data || []);
    } catch (err) {
      console.error('Error loading explore data:', err);
      setError('Unable to load data. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const term = query.trim().toLowerCase();
    if (!term) {
      setFilteredGuides(guides);
      return;
    }
    // Move matching guides to the top, keep the rest below
    const matches = [];
    const rest = [];
    guides.forEach(g => {
      const isMatch =
        (g.firstName && g.firstName.toLowerCase().includes(term)) ||
        (g.lastName && g.lastName.toLowerCase().includes(term)) ||
        (g.location && g.location.toLowerCase().includes(term)) ||
        (g.interests && g.interests.toLowerCase().includes(term)) ||
        (g.description && g.description.toLowerCase().includes(term));
      if (isMatch) {
        matches.push(g);
      } else {
        rest.push(g);
      }
    });
    setFilteredGuides([...matches, ...rest]);
  };

  const handleClearSearch = () => {
    setQuery('');
    setFilteredGuides(guides);
  };

  const handleViewGuide = (guideId) => {
    navigate(`/guide/${guideId}`);
  };

  const handleBookTour = async (tourId, e) => {
    e.stopPropagation();
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      navigate('/login', { state: { message: 'Please login to book a tour' } });
      return;
    }
    const user = JSON.parse(userJson);
    const userId = user.id || user.userID;

    try {
      const res = await axios.post('/api/bookings', {
        userID: userId,
        tourID: tourId,
        bookingDate: new Date().toISOString()
      });
      alert(res.data.message || 'Booking confirmed!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to book. Please try again.';
      alert(msg);
    }
  };

  return (
    <div className="explore-page-container">
      <div className="explore-header">
        <h1 className="explore-title">Explore Dashboard</h1>
        {userRole.includes('guide') && (
          <button 
            className="submit-spot-btn"
            onClick={() => setShowModal(true)}
          >
            + Submit New Spot
          </button>
        )}
      </div>

      <main className="page">
        <p>Discover beautiful locations around the world! (Feed implementation coming soon)</p>
        
        {/* Spot List will go here in the future */}
      </main>

      {showModal && (
        <div className="spot-form-modal-overlay">
          <div className="spot-form-modal">
            <h2>Recommend New Location</h2>
            
            {successMessage && <div className="success-message">{successMessage}</div>}
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="activityName">Activity Name *</label>
                <input 
                  type="text" 
                  id="activityName" 
                  name="activityName" 
                  value={formData.activityName}
                  onChange={handleInputChange}
                  placeholder="e.g., Secret Waterfall"
                />
              </div>

              <div className="form-group">
                <label htmlFor="activityType">Activity Type *</label>
                <input 
                  type="text" 
                  id="activityType" 
                  name="activityType" 
                  value={formData.activityType}
                  onChange={handleInputChange}
                  placeholder="e.g., Jazz, Adventure, Festival"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea 
                  id="description" 
                  name="description" 
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Describe what makes this spot special..."
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="location">Address / Location *</label>
                <input 
                  type="text" 
                  id="location" 
                  name="location" 
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., 123 Forest Trail, Portland"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="submit-btn">Submit for Review</button>
              </div>
            </form>
          </div>
        </div>
    <div className="explore-page">

      {/* Search Bar */}
      <section className="explore-search-section">
        <form className="explore-search-form" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <input
              type="text"
              className="explore-search-input"
              placeholder="Search for Local Guide or spot"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search for local guide or spot"
            />
            {query && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={handleClearSearch}
                aria-label="Clear search"
              >
                &times;
              </button>
            )}
          </div>
          <button type="submit" className="explore-search-btn" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </form>
      </section>

      {/* Hero Text */}
      <header className="explore-hero">
        <h1>Explore with Verified Guides</h1>
        <p>Book authentic experiences led by trusted locals. Every guide is verified and reviewed.</p>
      </header>

      {loading && (
        <div className="explore-loading">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      )}

      {error && (
        <div className="explore-error">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Available Activities/Experiences */}
          <section className="explore-experiences">
            <div className="explore-section-header">
              <h2>Available experiences</h2>
            </div>

            {tours.length > 0 ? (
              <>
                <div className="experiences-grid">
                  {(showAllTours ? tours : tours.slice(0, 3)).map((tour) => (
                    <div key={tour.tourId} className="experience-card" onClick={() => handleViewGuide(tour.guideId)}>
                      <div className="experience-card-image">
                        <div className="experience-image-placeholder">
                          <span>{tour.type || 'Tour'}</span>
                        </div>
                        <span className="experience-verified-badge">Verified</span>
                      </div>
                      <div className="experience-card-body">
                        <h3 className="experience-title">{tour.title}</h3>
                        <p className="experience-description">
                          {tour.description || 'Explore with a verified local guide.'}
                        </p>
                        <p className="experience-guide-name">
                          <span className="guide-dot"></span> {tour.guideName}
                        </p>
                        <div className="experience-meta">
                          <span>{new Date(tour.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span>Max {tour.maxPeople} people</span>
                        </div>
                        <div className="experience-card-footer">
                          <span className="experience-price">R--/person</span>
                          <button
                            className="experience-book-btn"
                            onClick={(e) => handleBookTour(tour.tourId, e)}
                          >
                            Book
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {!showAllTours && tours.length > 3 && (
                  <div className="view-all-container">
                    <button className="btn-view-all" onClick={() => setShowAllTours(true)}>
                      View All Experiences ({tours.length})
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="explore-empty">
                <p>No activities available yet. Check back soon!</p>
              </div>
            )}
          </section>

          {/* Verified Guides */}
          <section className="explore-verified-guides">
            <div className="verified-badge-header">
              <span className="verified-check-icon">&#10003;</span>
              <span className="verified-label">Verified</span>
            </div>
            <h2>Verified Guides</h2>

            {filteredGuides.length > 0 ? (
              <div className="verified-guides-grid">
                {filteredGuides.map((guide) => (
                  <div
                    key={guide.guideId}
                    className="verified-guide-card"
                    onClick={() => handleViewGuide(guide.guideId)}
                  >
                    <div className="verified-guide-header">
                      <div className="verified-guide-avatar">
                        {guide.profilePictureLink ? (
                          <img src={guide.profilePictureLink} alt={`${guide.firstName} ${guide.lastName}`} />
                        ) : (
                          <div className="verified-avatar-placeholder">
                            {guide.firstName?.charAt(0)}{guide.lastName?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="verified-guide-name-block">
                        <h3>{guide.firstName} {guide.lastName}</h3>
                        <span className="verified-tag">Verified</span>
                      </div>
                    </div>
                    {guide.location && (
                      <p className="verified-guide-location">&#x1F4CD; {guide.location}</p>
                    )}
                    <p className="verified-guide-bio">
                      {guide.description || 'Passionate local guide ready to show you the best experiences.'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="explore-empty">
                {query ? (
                  <p>No guides found for "{query}". Try a different search.</p>
                ) : (
                  <p>No verified guides available yet.</p>
                )}
              </div>
            )}
          </section>

          {/* Trust Section */}
          <section className="explore-trust-section">
            <h2>Every Guide is Verified</h2>
            <p>We verify every guide's identity, check their local knowledge, and review their first experiences to ensure quality.</p>
          </section>

          {/* My Activities Link */}
          <section className="explore-my-activities-link">
            <p>Already booked a tour?</p>
            <button className="btn-view-all" onClick={() => navigate('/my-activities')}>
              View My Activities & Rate Guides
            </button>
          </section>
        </>
      )}
    </div>
  );
}
