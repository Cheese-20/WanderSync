import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../components/NavBar';
import '../styles/explore.css';

const ACTIVITY_TYPES = [
  { label: '🏛️ Sightseeing', value: 'Sightseeing' },
  { label: '🍽️ Dining', value: 'Dining' },
  { label: '🚗 Transit', value: 'Transit' },
  { label: '🏕️ Outdoor', value: 'Outdoor' },
  { label: '🛍️ Shopping', value: 'Shopping' },
  { label: '🎭 Entertainment', value: 'Entertainment' },
  { label: '🏨 Accommodation', value: 'Accommodation' },
  { label: '📸 Photo Stop', value: 'Photo Stop' },
];

// Glyphs for the booking result dialog, one per tone.
const BOOKING_FEEDBACK_ICONS = {
  success: <polyline points="20 6 9 17 4 12"></polyline>,
  notice: (
    <>
      <circle cx="12" cy="12" r="9"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </>
  ),
  error: (
    <>
      <circle cx="12" cy="12" r="9"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </>
  )
};

export default function ExplorePage() {
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [guides, setGuides] = useState([]);
  const [tours, setTours] = useState([]);
  const [filteredGuides, setFilteredGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAllTours, setShowAllTours] = useState(false);
  const [userBookings, setUserBookings] = useState([]);
  
  // Submit New Spot Modal State
  const [showModal, setShowModal] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [newSpot, setNewSpot] = useState({
    activityName: '',
    activityType: '',
    description: '',
    location: '',
    pictureURL: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Booking feedback replaces window.alert so the outcome is shown in the app's own
  // styling. Shape: { tone: 'success' | 'notice' | 'error', title, message, tourTitle }.
  const [bookingFeedback, setBookingFeedback] = useState(null);
  const [bookingTourId, setBookingTourId] = useState(null);
  const bookingFeedbackBtnRef = useRef(null);

  // Tour IDs whose cover photo failed to load, so the card can fall back to the label.
  const [brokenImages, setBrokenImages] = useState({});

  const [userRole, setUserRole] = useState('');
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let currentUserId = null;
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      setUserRole((user.role || '').toLowerCase());
      currentUserId = user.id || user.userID;
      setLoggedInUserId(currentUserId);
    }
    loadData(currentUserId);
  }, []);

  // Move focus into the dialog and allow Escape to dismiss it, so the replacement
  // behaves like the native alert it took over from.
  useEffect(() => {
    if (!bookingFeedback) return;

    bookingFeedbackBtnRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setBookingFeedback(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [bookingFeedback]);

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
        pictureURL: newSpot.pictureURL,
        isVerified: "pending",
        submittedByUserID: loggedInUserId,
        submittedAt: new Date().toISOString()
      });
      setSuccessMessage('Spot submitted successfully for review!');
      setNewSpot({ activityName: '', activityType: '', description: '', location: '', pictureURL: '' });
      setTimeout(() => {
        setShowModal(false);
        setWizardStep(1);
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setErrorMessage('An error occurred while saving the record. Please try again.');
    }
  };

  const loadData = async (currentUserId) => {
    setLoading(true);
    setError('');
    try {
      let bookingsRes = { data: [] };
      if (currentUserId) {
        bookingsRes = await axios.get(`/api/bookings/user/${currentUserId}/with-details`).catch(() => ({ data: [] }));
      }
      const [guidesRes, toursRes] = await Promise.all([
        axios.get('/api/local-guide/list'),
        axios.get('/api/tours')
      ]);
      setGuides(guidesRes.data || []);
      setFilteredGuides(guidesRes.data || []);
      setTours(toursRes.data || []);
      setUserBookings(bookingsRes.data || []);
    } catch (err) {
      console.error('Error loading explore data:', err);
      setError('Unable to load data. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Scores how well a single field matches the search term.
  // Exact match ranks highest, then prefix, then word-start, then anywhere in the text.
  const scoreField = (value, term) => {
    if (!value) return 0;
    const text = String(value).toLowerCase();
    const index = text.indexOf(term);
    if (index === -1) return 0;

    if (text === term) return 1;              // exact field match
    if (index === 0) return 0.8;              // field starts with the term
    if (/[\s,]/.test(text.charAt(index - 1))) return 0.6; // term starts a word
    return 0.35;                              // term appears somewhere inside
  };

  // Field weights: a name hit is more relevant than a description hit.
  const GUIDE_SEARCH_FIELDS = [
    { get: (g) => `${g.firstName || ''} ${g.lastName || ''}`.trim(), weight: 110 },
    { get: (g) => g.firstName, weight: 100 },
    { get: (g) => g.lastName, weight: 100 },
    { get: (g) => g.location, weight: 70 },
    { get: (g) => g.interests, weight: 50 },
    { get: (g) => g.job, weight: 40 },
    { get: (g) => g.description, weight: 25 }
  ];

  const scoreGuide = (guide, term) =>
    GUIDE_SEARCH_FIELDS.reduce(
      (total, field) => total + field.weight * scoreField(field.get(guide), term),
      0
    );

  // The tours endpoint returns `guideID`; tolerate either casing.
  const getTourGuideId = (tour) => tour.guideID ?? tour.guideId;

  // Cover photo for a tour card. A pictureURL is either a single URL, a base64 data
  // URL from the create-experience upload, or a JSON array (the shape posts use) —
  // handle all three, matching how Profile/MyActivities read the same field.
  const getTourImage = (tour) => {
    const raw = tour.pictureURL || tour.imageURL;
    if (!raw) return null;
    if (!raw.startsWith('[')) return raw;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed[0] || null : raw;
    } catch {
      return raw;
    }
  };

  // While a search is active, only show experiences that belong to a matching guide.
  // Guides are already ranked, so experiences follow that same order.
  const visibleTours = useMemo(() => {
    if (!appliedQuery) return tours;
    const rank = new Map(filteredGuides.map((g, i) => [g.guideId, i]));
    return tours
      .filter(t => rank.has(getTourGuideId(t)))
      .sort((a, b) => rank.get(getTourGuideId(a)) - rank.get(getTourGuideId(b)));
  }, [tours, filteredGuides, appliedQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    const term = query.trim().toLowerCase();
    setAppliedQuery(query.trim());
    setShowAllTours(false);

    if (!term) {
      setFilteredGuides(guides);
      return;
    }

    // Keep only guides that match, ranked with the closest match first.
    const ranked = guides
      .map((guide, index) => ({ guide, index, score: scoreGuide(guide, term) }))
      .filter(entry => entry.score > 0)
      .sort((a, b) => (b.score - a.score) || (a.index - b.index))
      .map(entry => entry.guide);

    setFilteredGuides(ranked);
  };

  const handleClearSearch = () => {
    setQuery('');
    setAppliedQuery('');
    setShowAllTours(false);
    setFilteredGuides(guides);
  };

  const handleViewGuide = (guideId) => navigate(`/guide/${guideId}`);

  // The API reports its own failures as { message }, but ASP.NET model-validation
  // failures come back as { title, errors } instead. Reading only `message` turned
  // those into a generic "Failed to book", which hid the real reason.
  const getBookingErrorMessage = (err) => {
    const data = err.response?.data;
    if (!data) return 'Failed to book. Please try again.';
    if (data.message) return data.message;
    if (data.errors) {
      const details = Object.values(data.errors).flat().join(' ');
      if (details) return details;
    }
    return data.title || 'Failed to book. Please try again.';
  };

  // A 409/400 is a normal outcome the explorer can act on ("already booked", "tour is
  // full"), so it is shown as a notice rather than styled like a system failure.
  const getBookingFeedbackTone = (status) => {
    if (status === 409) return 'notice';
    if (status === 400 || status === 404) return 'notice';
    return 'error';
  };

  const handleBookTour = async (tour, e) => {
    e.stopPropagation();
    if (!loggedInUserId) {
      navigate('/login', { state: { message: 'Please login to book a tour' } });
      return;
    }

    const tourId = tour.tourId || tour.tourID;
    if (bookingTourId) return; // a request is already in flight

    setBookingTourId(tourId);
    try {
      const userJson = localStorage.getItem('user');
      const userObj = userJson ? JSON.parse(userJson) : {};
      const tourDate = tour.date ? new Date(tour.date) : null;
      const res = await axios.post('/api/bookings', {
        userID: loggedInUserId,
        tourID: tourId,
        // A booking is for the tour's scheduled slot, not for the moment the button was clicked.
        bookingDate: tour.date || new Date().toISOString(),
        timeOfBooking: tourDate
          ? tourDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '',
        numberOfGuests: 1,
        bookingType: 'Standard',
        userName: userObj.name || '',
        userSurname: userObj.surname || '',
        tourName: tour.title || tour.name || '',
        tourLocation: tour.location || ''
      });
      setBookingFeedback({
        tone: 'success',
        title: 'Request sent',
        message: res.data?.message || 'Booking request submitted successfully!',
        tourTitle: tour.title || tour.name || ''
      });
    } catch (err) {
      const tone = getBookingFeedbackTone(err.response?.status);
      setBookingFeedback({
        tone,
        title: tone === 'notice' ? 'Not so fast' : 'Booking failed',
        message: getBookingErrorMessage(err),
        tourTitle: tour.title || tour.name || ''
      });
    } finally {
      setBookingTourId(null);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewSpot({...newSpot, pictureURL: reader.result});
    };
    reader.readAsDataURL(file);
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setWizardStep(1), 300); // Reset step after transition
  };

  return (
    <>
      <NavBar />

      {bookingFeedback && (
        <div className="booking-feedback-overlay" onClick={() => setBookingFeedback(null)}>
          <div
            className={`booking-feedback-card booking-feedback-${bookingFeedback.tone}`}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="booking-feedback-title"
            aria-describedby="booking-feedback-message"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="booking-feedback-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {BOOKING_FEEDBACK_ICONS[bookingFeedback.tone]}
              </svg>
            </div>

            <h3 className="booking-feedback-title" id="booking-feedback-title">{bookingFeedback.title}</h3>
            {bookingFeedback.tourTitle && (
              <p className="booking-feedback-tour">{bookingFeedback.tourTitle}</p>
            )}
            <p className="booking-feedback-message" id="booking-feedback-message">{bookingFeedback.message}</p>

            <div className="booking-feedback-actions">
              {bookingFeedback.tone === 'success' && (
                <button
                  type="button"
                  className="booking-feedback-btn-secondary"
                  onClick={() => { setBookingFeedback(null); navigate('/my-activities'); }}
                >
                  View my activities
                </button>
              )}
              <button
                type="button"
                className="booking-feedback-btn"
                ref={bookingFeedbackBtnRef}
                onClick={() => setBookingFeedback(null)}
              >
                {bookingFeedback.tone === 'success' ? 'Done' : 'Got it'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="explore-page">
      <section className="explore-search-section">
        <form className="explore-search-form" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <input type="text" className="explore-search-input" placeholder="Search for Local Guide or spot" value={query} onChange={(e) => setQuery(e.target.value)} />
            {query && <button type="button" className="search-clear-btn" onClick={handleClearSearch}>&times;</button>}
          </div>
          <button type="submit" className="explore-search-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
        </form>
      </section>

      <header className="explore-hero">

        {loggedInUserId && (
          <button className="submit-spot-btn" style={{ marginTop: '15px' }} onClick={() => setShowModal(true)}>
            Submit New Spot
          </button>
        )}
      </header>

      {showModal && (
        <div className="cool-modal-overlay">
          <div className="cool-modal-card">
            <div className="cool-modal-header">
              <h2>Recommend a New Spot</h2>
              <p>Found a hidden gem? Share it with other guides!</p>
              <button className="cool-modal-close" onClick={closeModal}>&times;</button>
            </div>
            
            <div className="cool-modal-body" style={{ minHeight: '280px', position: 'relative' }}>
              {successMessage && <div className="cool-alert-success">{successMessage}</div>}
              {errorMessage && <div className="cool-alert-error">{errorMessage}</div>}
              
              {!successMessage && (
                <form onSubmit={handleSpotSubmit} className={`wizard-step-${wizardStep}`}>
                  
                  {/* STEP 1 */}
                  {wizardStep === 1 && (
                    <div className="wizard-slide-in">
                      <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>What's the spot called?</h3>
                      <div className="cool-form-group">
                        <div className="cool-input-wrapper">
                          <span className="cool-input-icon">📌</span>
                          <input 
                            type="text" className="cool-input" placeholder="e.g. Kalk Bay Harbour"
                            value={newSpot.activityName} onChange={(e) => setNewSpot({...newSpot, activityName: e.target.value})} 
                            required autoFocus
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
                        <button type="button" className="cool-submit-btn" style={{ width: 'auto', padding: '10px 24px' }} 
                          onClick={() => { if(newSpot.activityName.trim()) setWizardStep(2); }}>
                          Next →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2 */}
                  {wizardStep === 2 && (
                    <div className="wizard-slide-in">
                      <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>Awesome, where is {newSpot.activityName}?</h3>
                      <div className="cool-form-group">
                        <div className="cool-input-wrapper">
                          <span className="cool-input-icon">📍</span>
                          <input 
                            type="text" className="cool-input" placeholder="e.g. Cape Town, WC"
                            value={newSpot.location} onChange={(e) => setNewSpot({...newSpot, location: e.target.value})} 
                            required autoFocus
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                        <button type="button" className="cool-submit-btn" style={{ width: 'auto', padding: '10px 24px', background: '#e5e7eb', color: '#374151' }} 
                          onClick={() => setWizardStep(1)}>
                          ← Back
                        </button>
                        <button type="button" className="cool-submit-btn" style={{ width: 'auto', padding: '10px 24px' }} 
                          onClick={() => { if(newSpot.location.trim()) setWizardStep(3); }}>
                          Next →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3 */}
                  {wizardStep === 3 && (
                    <div className="wizard-slide-in">
                      <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>Almost done! What type of activity is this?</h3>
                      
                      <div className="cool-form-group">
                        <div className="cool-input-wrapper">
                          <span className="cool-input-icon">🏷️</span>
                          <select className="cool-select" value={newSpot.activityType} onChange={(e) => setNewSpot({...newSpot, activityType: e.target.value})} required>
                            <option value="" disabled>Select a type...</option>
                            {ACTIVITY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="cool-form-group">
                        <textarea className="cool-textarea" rows="3" placeholder="What makes this spot special? Why should other guides take tourists here?"
                          value={newSpot.description} onChange={(e) => setNewSpot({...newSpot, description: e.target.value})} required />
                      </div>

                      <div className="cool-form-group" style={{ marginTop: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9rem', color: '#374151' }}>Add a Photo (Optional)</label>
                        
                        {!newSpot.pictureURL ? (
                          <div 
                            className="cool-image-upload-zone"
                            onClick={() => document.getElementById('spotImageUpload').click()}
                          >
                            <div className="upload-icon-large">📸</div>
                            <p className="upload-text-main">Click to upload a photo</p>
                            <p className="upload-text-sub">JPEG, PNG up to 5MB</p>
                            <input 
                              id="spotImageUpload"
                              type="file" 
                              accept="image/*" 
                              onChange={handleImageUpload} 
                              style={{ display: 'none' }}
                            />
                          </div>
                        ) : (
                          <div className="cool-image-upload-zone has-image">
                            <div className="cool-image-preview-wrapper">
                              <img src={newSpot.pictureURL} alt="Preview" />
                              <button 
                                type="button" 
                                className="cool-image-remove-btn" 
                                onClick={(e) => { e.stopPropagation(); setNewSpot({...newSpot, pictureURL: ''}); }}
                                title="Remove photo"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                        <button type="button" className="cool-submit-btn" style={{ width: 'auto', padding: '10px 24px', background: '#e5e7eb', color: '#374151' }} 
                          onClick={() => setWizardStep(2)}>
                          ← Back
                        </button>
                        <button type="submit" className="cool-submit-btn" style={{ width: 'auto', padding: '10px 24px' }}>
                          Submit ✨
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {loading && <div className="explore-loading"><div className="loading-spinner"></div><p>Loading...</p></div>}
      {error && <div className="explore-error"><p>{error}</p></div>}

      {!loading && !error && (
        <>
          {/* Hidden entirely when a search is active and no matching guide has experiences */}
          {(!appliedQuery || visibleTours.length > 0) && (
          <section className="explore-experiences">
            <div className="explore-section-header"><h2>Available experiences</h2></div>
            {appliedQuery && (
              <p className="explore-search-summary">
                Experiences by guides matching "{appliedQuery}"
              </p>
            )}
            {visibleTours.length > 0 ? (
              <>
                <div className="experiences-grid">
                  {(showAllTours ? visibleTours : visibleTours.slice(0, 3)).map((tour) => (
                    <div key={tour.tourId} className="experience-card" onClick={() => handleViewGuide(getTourGuideId(tour))}>
                      <div className="experience-card-image">
                        {getTourImage(tour) && !brokenImages[tour.tourId] ? (
                          <img
                            className="experience-image"
                            src={getTourImage(tour)}
                            alt={tour.title || 'Experience'}
                            loading="lazy"
                            // Some stored values are page links rather than direct image
                            // URLs, so fall back to the type label if the load fails.
                            onError={() => setBrokenImages(prev => ({ ...prev, [tour.tourId]: true }))}
                          />
                        ) : (
                          <div className="experience-image-placeholder"><span>{tour.type || 'Tour'}</span></div>
                        )}
                        <span className="experience-verified-badge">Verified</span>
                      </div>
                      <div className="experience-card-body">
                        <h3 className="experience-title">{tour.title}</h3>
                        <p className="experience-description">{tour.description}</p>
                        <p className="experience-guide-name"><span className="guide-dot"></span> {tour.guideName}</p>
                        <div className="experience-meta"><span>{new Date(tour.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span><span>Max {tour.maxPeople} people</span></div>
                        <div className="experience-card-footer">
                          <span className="experience-price">R--/person</span>
                          <button
                            className="experience-book-btn"
                            onClick={(e) => handleBookTour(tour, e)}
                            disabled={bookingTourId !== null || userBookings.some(b => b.tourId === (tour.tourId || tour.tourID) || b.tourID === (tour.tourId || tour.tourID))}
                          >
                            {userBookings.some(b => b.tourId === (tour.tourId || tour.tourID) || b.tourID === (tour.tourId || tour.tourID))
                              ? 'Already booked'
                              : (bookingTourId === (tour.tourId || tour.tourID) ? 'Booking...' : 'Book')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {!showAllTours && visibleTours.length > 3 && (
                  <div className="view-all-container"><button className="btn-view-all" onClick={() => setShowAllTours(true)}>View All ({visibleTours.length})</button></div>
                )}
              </>
            ) : (<div className="explore-empty"><p>No activities available yet. Check back soon!</p></div>)}
          </section>
          )}

          <section className="explore-verified-guides">
            <div className="verified-badge-header"><span className="verified-check-icon">&#10003;</span><span className="verified-label">Verified</span></div>
            <h2>Verified Guides</h2>
            {appliedQuery && (
              <p className="explore-search-summary">
                {filteredGuides.length} {filteredGuides.length === 1 ? 'guide' : 'guides'} matching "{appliedQuery}"
                <button type="button" className="btn-view-all" style={{ marginLeft: '12px' }} onClick={handleClearSearch}>
                  Show all
                </button>
              </p>
            )}
            {filteredGuides.length > 0 ? (
              <div className="verified-guides-grid">
                {filteredGuides.map((guide) => (
                  <div key={guide.guideId} className="verified-guide-card" onClick={() => handleViewGuide(guide.guideId)}>
                    <div className="verified-guide-header">
                      <div className="verified-guide-avatar">
                        {guide.profilePictureLink ? <img src={guide.profilePictureLink} alt={`${guide.firstName} ${guide.lastName}`} /> : <div className="verified-avatar-placeholder">{guide.firstName?.charAt(0)}{guide.lastName?.charAt(0)}</div>}
                      </div>
                      <div className="verified-guide-name-block"><h3>{guide.firstName} {guide.lastName}</h3><span className="verified-tag">Verified</span></div>
                    </div>
                    {guide.location && <p className="verified-guide-location">&#x1F4CD; {guide.location}</p>}
                    <p className="verified-guide-bio">{guide.description || 'Passionate local guide ready to show you the best experiences.'}</p>
                  </div>
                ))}
              </div>
            ) : (<div className="explore-empty">{appliedQuery ? <p>No guides found for "{appliedQuery}".</p> : <p>No verified guides available yet.</p>}</div>)}
          </section>



          <section className="explore-my-activities-link">
            <p>Already booked a tour?</p>
            <button className="btn-view-all" onClick={() => navigate('/my-activities')}>View My Activities & Rate Guides</button>
          </section>
        </>
      )}
    </div>
    </>
  );
}
