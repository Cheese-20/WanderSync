import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../components/NavBar';
import '../styles/explore.css';

export default function ExplorePage() {
  const [query, setQuery] = useState('');
  const [guides, setGuides] = useState([]);
  const [tours, setTours] = useState([]);
  const [filteredGuides, setFilteredGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAllTours, setShowAllTours] = useState(false);
  
  // Submit New Spot Modal State
  const [showModal, setShowModal] = useState(false);
  const [newSpot, setNewSpot] = useState({
    activityName: '',
    activityType: '',
    description: '',
    location: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      setUserRole(user.role || '');
    }
  }, []);

  const handleSpotSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await axios.post('/api/curatedspots', {
        activityName: newSpot.activityName,
        activityType: newSpot.activityType,
        description: newSpot.description,
        location: newSpot.location,
        isVerified: false
      });
      setSuccessMessage('Spot submitted successfully for review!');
      setNewSpot({ activityName: '', activityType: '', description: '', location: '' });
      setTimeout(() => {
        setShowModal(false);
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setErrorMessage('An error occurred while saving the record. Please try again.');
    }
  };

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
      alert(res.data.message || 'Booking request submitted successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to book. Please try again.';
      alert(msg);
    }
  };

  return (
    <>
      <NavBar />
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
        {userRole.includes('guide') && (
          <button 
            className="submit-spot-btn"
            style={{ marginTop: '15px' }}
            onClick={() => setShowModal(true)}
          >
            + Submit New Spot
          </button>
        )}
      </header>

      {showModal && (
        <div className="spot-form-modal-overlay">
          <div className="spot-form-modal">
            <h2>Recommend New Location</h2>
            <button className="spot-form-close-btn" onClick={() => setShowModal(false)}>&times;</button>
            
            {successMessage && <div className="alert-success" style={{color: 'green', marginBottom: '10px'}}>{successMessage}</div>}
            {errorMessage && <div className="alert-error" style={{color: 'red', marginBottom: '10px'}}>{errorMessage}</div>}
            
            <form onSubmit={handleSpotSubmit}>
              <div className="form-group">
                <label>Activity Name</label>
                <input 
                  type="text" 
                  value={newSpot.activityName} 
                  onChange={(e) => setNewSpot({...newSpot, activityName: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Activity Type (e.g. Jazz, Adventure, Festival)</label>
                <input 
                  type="text" 
                  value={newSpot.activityType} 
                  onChange={(e) => setNewSpot({...newSpot, activityType: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input 
                  type="text" 
                  value={newSpot.location} 
                  onChange={(e) => setNewSpot({...newSpot, location: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  rows="4"
                  value={newSpot.description} 
                  onChange={(e) => setNewSpot({...newSpot, description: e.target.value})} 
                  required 
                />
              </div>
              <button type="submit" className="spot-submit-btn">Submit for Review</button>
            </form>
          </div>
        </div>
      )}

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
    </>
  );
}
