import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/images/logo.png';
import '../styles/discover.css';

export default function GuideDetail() {
  const { guideId } = useParams();
  const navigate = useNavigate();
  const [guide, setGuide] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewScore, setReviewScore] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [showIneligiblePopup, setShowIneligiblePopup] = useState(false);

  // Tour Booking Modal States
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [guestCount, setGuestCount] = useState(1);
  const [bookingStatus, setBookingStatus] = useState('idle');
  const [requestedTourIds, setRequestedTourIds] = useState([]);

  // One-on-one request form
  const todayIso = new Date().toISOString().slice(0, 10);
  const [oneOnOne, setOneOnOne] = useState({ date: '', time: '', guests: 1, focus: '' });
  const [isRequesting, setIsRequesting] = useState(false);
  const [oneOnOneMessage, setOneOnOneMessage] = useState('');
  const [oneOnOneError, setOneOnOneError] = useState('');

  useEffect(() => {
    fetchGuideDetails();
    fetchGuideRatings();
    fetchGuideReviews();
    checkReviewEligibility();
  }, [guideId]);

  const fetchGuideDetails = async () => {
    try {
      const res = await axios.get(`/api/local-guide/${guideId}`);
      setGuide(res.data);
    } catch (err) {
      console.error('Error fetching guide details:', err);
      if (err.response?.status === 404) {
        setError('Guide not found.');
      } else {
        setError('Unable to load guide details. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const checkReviewEligibility = async () => {
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      setCanReview(false);
      return;
    }
    const user = JSON.parse(userJson);
    const userId = user.id || user.userID;

    try {
      const res = await axios.get(`/api/bookings/user/${userId}/with-details`);
      const bookings = res.data || [];
      const hasBooking = bookings.some(b => b.guideId === Number(guideId));
      setCanReview(hasBooking);
      setRequestedTourIds(bookings.map(b => b.tourId || b.tourID));
    } catch (err) {
      console.error('Error checking user bookings:', err);
      setCanReview(false);
    }
  };

  const fetchGuideRatings = async () => {
    try {
      const res = await axios.get(`/api/local-guide/${guideId}/ratings`);
      setRatings(res.data.ratings || []);
    } catch (err) {
      console.error('Error fetching ratings:', err);
    }
  };

  const fetchGuideReviews = async () => {
    try {
      const res = await axios.get(`/api/local-guide/${guideId}/reviews`);
      setReviews(res.data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleBookTourClick = (tour) => {
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      navigate('/login', { state: { message: 'Please login to book a tour' } });
      return;
    }
    setSelectedTour(tour);
    setGuestCount(1);
    setBookingStatus('idle');
    setIsBookingModalOpen(true);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      navigate('/login', { state: { message: 'Please login to submit a review' } });
      return;
    }
    const user = JSON.parse(userJson);
    const userId = user.id || user.userID;

    setIsSubmittingReview(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      await axios.post(`/api/local-guide/${guideId}/rate`, {
        userID: userId,
        score: reviewScore,
        comment: reviewComment
      });
      setReviewSuccess('Review submitted successfully!');
      setReviewScore(5);
      setReviewComment('');
      setShowReviewForm(false);
      fetchGuideReviews();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleOneOnOneChange = (e) => {
    const { name, value } = e.target;
    setOneOnOne(prev => ({ ...prev, [name]: value }));
    setOneOnOneError('');
  };

  const handleRequestOneOnOne = async (e) => {
    e.preventDefault();

    const userJson = localStorage.getItem('user');
    if (!userJson) {
      navigate('/login', { state: { message: 'Please login to book a local guide' } });
      return;
    }

    const user = JSON.parse(userJson);
    const userId = user.id || user.userID;

    if (!oneOnOne.date) {
      setOneOnOneError('Please choose a date.');
      return;
    }
    if (!oneOnOne.time) {
      setOneOnOneError('Please choose a start time.');
      return;
    }
    if (oneOnOne.date < todayIso) {
      setOneOnOneError('Please choose a date that is not in the past.');
      return;
    }

    setIsRequesting(true);
    setOneOnOneMessage('');
    setOneOnOneError('');

    try {
      const res = await axios.post('/api/bookings/one-on-one', {
        userID: userId,
        guideID: Number(guideId),
        date: oneOnOne.date,
        timeOfBooking: oneOnOne.time,
        numberOfGuests: Number(oneOnOne.guests) || 1,
        focus: oneOnOne.focus.trim()
      });
      setOneOnOneMessage(res.data.message || 'Your one-on-one request has been sent!');
      setOneOnOne({ date: '', time: '', guests: 1, focus: '' });
    } catch (err) {
      setOneOnOneError(
        err.response?.data?.message || 'Failed to send your request. Please try again.'
      );
    } finally {
      setIsRequesting(false);
    }
  };

  const handleContact = () => {
    navigate('/messages');
  };

  const handleBack = () => {
    navigate('/discover');
  };

  const renderStars = (score) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < score ? 'filled' : ''}`}>&#9733;</span>
    ));
  };

  if (loading) {
    return (
      <div className="discover-page">
        <div className="discover-loading">
          <div className="loading-spinner"></div>
          <p>Loading guide profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="discover-page">
        <div className="discover-content">
          <div className="discover-error">
            <p>{error}</p>
            <button className="btn-back" onClick={handleBack}>Back to Guides</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="discover-page">

      <section className="guide-detail-container">
        <button className="btn-back" onClick={handleBack}>
          &larr; Back to Guides
        </button>

        <div className="guide-detail-header">
          <div className="guide-detail-avatar">
            {guide.profilePictureLink ? (
              <img src={guide.profilePictureLink} alt={`${guide.firstName} ${guide.lastName}`} />
            ) : (
              <div className="guide-card-avatar-placeholder large">
                {guide.firstName?.charAt(0)}{guide.lastName?.charAt(0)}
              </div>
            )}
          </div>
          <div className="guide-detail-info">
            <h1>{guide.firstName} {guide.lastName}</h1>
            {guide.job && <p className="guide-detail-job">{guide.job}</p>}
            {guide.location && (
              <p className="guide-detail-location">
                <span className="location-icon">&#x1F4CD;</span> {guide.location}
              </p>
            )}
            {guide.email && <p className="guide-detail-email">{guide.email}</p>}
            {guide.averageRating > 0 && (
              <div className="guide-rating-summary">
                <div className="rating-stars">
                  {renderStars(Math.round(guide.averageRating))}
                </div>
                <span className="rating-text">
                  {guide.averageRating} / 5 ({guide.totalRatings} {guide.totalRatings === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}
          </div>
          <div className="guide-detail-actions">
            <button className="btn-contact" onClick={handleContact}>
              Message Guide
            </button>
          </div>
        </div>

        {guide.description && (
          <div className="guide-detail-section">
            <h2>About</h2>
            <p>{guide.description}</p>
          </div>
        )}

        {guide.interests && (
          <div className="guide-detail-section">
            <h2>Interests</h2>
            <div className="guide-detail-interests">
              {guide.interests.split(',').map((interest, idx) => (
                <span key={idx} className="interest-tag">{interest.trim()}</span>
              ))}
            </div>
          </div>
        )}

        <div className="guide-detail-section">
          <h2>Book a 1-on-1 Experience</h2>
          <p className="one-on-one-intro">
            Want {guide.firstName} to yourself? Request a private experience on a date and time
            that suits you. {guide.firstName} confirms the details and the price with you in chat.
          </p>

          <form className="one-on-one-form" onSubmit={handleRequestOneOnOne}>
            <div className="one-on-one-row">
              <div className="one-on-one-field">
                <label htmlFor="oneOnOneDate">Date</label>
                <input
                  type="date"
                  id="oneOnOneDate"
                  name="date"
                  min={todayIso}
                  value={oneOnOne.date}
                  onChange={handleOneOnOneChange}
                  required
                />
              </div>
              <div className="one-on-one-field">
                <label htmlFor="oneOnOneTime">Start time</label>
                <input
                  type="time"
                  id="oneOnOneTime"
                  name="time"
                  value={oneOnOne.time}
                  onChange={handleOneOnOneChange}
                  required
                />
              </div>
              <div className="one-on-one-field">
                <label htmlFor="oneOnOneGuests">People</label>
                <select
                  id="oneOnOneGuests"
                  name="guests"
                  value={oneOnOne.guests}
                  onChange={handleOneOnOneChange}
                >
                  {[1, 2, 3, 4].map(n => (
                    <option key={n} value={n}>{n === 1 ? 'Just me' : `${n} people`}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="one-on-one-field">
              <label htmlFor="oneOnOneFocus">What would you like to do? (optional)</label>
              <textarea
                id="oneOnOneFocus"
                name="focus"
                rows="3"
                maxLength={500}
                value={oneOnOne.focus}
                onChange={handleOneOnOneChange}
                placeholder="e.g. a food walk through the city centre, or hidden photo spots at sunset"
              />
            </div>

            {oneOnOneError && <p className="booking-error">{oneOnOneError}</p>}
            {oneOnOneMessage && <p className="booking-success">{oneOnOneMessage}</p>}

            <button type="submit" className="mint-btn btn-request-one-on-one" disabled={isRequesting} style={{ width: '100%', padding: '12px', fontSize: '1rem' }}>
              {isRequesting ? 'Sending request...' : 'Request 1-on-1 Experience'}
            </button>
          </form>
        </div>

        <div className="guide-detail-section">
          <h2>Available Tours & Itineraries</h2>
          {guide.tours && guide.tours.length > 0 ? (
            <div className="tours-grid">
              {guide.tours.map((tour) => (
                <div key={tour.tourId} className="tour-card">
                  <div className="tour-card-header">
                    <h3>{tour.title}</h3>
                    {tour.type && <span className="tour-type-badge">{tour.type}</span>}
                  </div>
                  {tour.description && <p className="tour-description">{tour.description}</p>}
                  <div className="tour-card-footer">
                    <span className="tour-date">
                      {new Date(tour.date).toLocaleDateString()}
                    </span>
                    <span className="tour-capacity">
                      Max {tour.maxPeople} people
                    </span>
                  </div>
                  <div className="tour-card-actions">
                    <button
                      className="mint-btn"
                      onClick={() => handleBookTourClick(tour)}
                      disabled={requestedTourIds.includes(tour.tourId || tour.tourID)}
                      style={{ 
                        width: '100%',
                        backgroundColor: requestedTourIds.includes(tour.tourId || tour.tourID) ? '#d3d3d3' : '',
                        color: requestedTourIds.includes(tour.tourId || tour.tourID) ? '#888' : '',
                        cursor: requestedTourIds.includes(tour.tourId || tour.tourID) ? 'not-allowed' : 'pointer' 
                      }}
                    >
                      {requestedTourIds.includes(tour.tourId || tour.tourID) ? 'Requested' : 'Book Tour'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-tours">This guide has no tours listed yet.</p>
          )}
        </div>

        <div className="guide-reviews">
          <div className="reviews-header-container">
            <h2>Reviews</h2>
            <button 
              className={`btn-add-review ${!canReview ? 'disabled' : ''}`}
              onClick={() => {
                if (!canReview) {
                  setShowIneligiblePopup(true);
                  return;
                }
                setShowReviewForm(!showReviewForm);
              }}
              style={!canReview ? { backgroundColor: 'grey', cursor: 'not-allowed' } : {}}
              title={!canReview ? "You must book a tour with this guide to leave a review." : ""}
            >
              {showReviewForm ? 'Cancel Review' : 'Add Review'}
            </button>
          </div>

          {showReviewForm && (
            <div className="review-form-container">
              <form onSubmit={submitReview} className="review-form">
                <div className="form-group">
                  <label>Rating</label>
                  <select 
                    value={reviewScore} 
                    onChange={(e) => setReviewScore(Number(e.target.value))}
                    required
                  >
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Good</option>
                    <option value="3">3 - Average</option>
                    <option value="2">2 - Poor</option>
                    <option value="1">1 - Terrible</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Comment</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Write your review here..."
                    rows="4"
                    required
                  ></textarea>
                </div>
                {reviewError && <p className="review-error">{reviewError}</p>}
                <button 
                  type="submit" 
                  className="btn-submit-review"
                  disabled={isSubmittingReview}
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}
          {reviewSuccess && <p className="review-success">{reviewSuccess}</p>}

          {reviews && reviews.length > 0 ? (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.ratingId || review.reviewId} className="review-card">
                  <div className="review-header">
                    <span className="reviewer-name">
                      {review.reviewerName} {review.reviewerSurname}
                    </span>
                    <span className="review-date">
                      {new Date(review.createdAt || review.sentAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="review-rating">
                    {'★'.repeat(review.score || 0)}{'☆'.repeat(5 - (review.score || 0))}
                  </div>
                  {review.comment && (
                    <p className="review-comment">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-reviews">This guide has no reviews yet.</p>
          )}
        </div>


      </section>

      {showIneligiblePopup && (
        <div className="ineligible-modal-overlay" onClick={() => setShowIneligiblePopup(false)}>
          <div className="ineligible-modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={logo} alt="WanderSync Logo" className="ineligible-modal-logo" />
            <p className="ineligible-modal-text">
              You must have a confirmed booking that occurred more than 30 minutes ago to leave a review for this guide.
            </p>
            <button className="ineligible-modal-close" onClick={() => setShowIneligiblePopup(false)}>
              Got it
            </button>
          </div>
        </div>
      )}

      {isBookingModalOpen && selectedTour && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center', position: 'relative' }}>
            <button className="close-btn" onClick={() => setIsBookingModalOpen(false)}>&times;</button>
            <div style={{ marginBottom: '20px' }}>
              <img src={logo} alt="WanderSync" style={{ width: '60px', height: 'auto', margin: '0 auto 15px auto', display: 'block' }} />
              <h2 style={{ margin: '0', fontSize: '1.2rem', color: '#1a1a1a' }}>How many people are going?</h2>
            </div>

            {bookingStatus === 'idle' ? (
              <>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <input
                    type="number"
                    min="1"
                    max={selectedTour.maxPeople - (selectedTour.confirmedBookingsCount || 0)}
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    style={{ width: '100%', padding: '14px', border: '2px solid #e0e0e0', borderRadius: '16px', fontSize: '1.1rem', textAlign: 'center', backgroundColor: '#fff', color: '#000', outline: 'none' }}
                  />
                </div>

                <div className="modal-actions" style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn-secondary" onClick={() => setIsBookingModalOpen(false)} style={{ flex: 1, borderRadius: '24px', padding: '14px', fontWeight: 'bold' }}>Cancel</button>
                  <button className="btn-primary" style={{ flex: 1, borderRadius: '24px', padding: '14px', fontWeight: 'bold' }} onClick={async () => {
                    try {
                      const userJson = localStorage.getItem('user');
                      const userObj = userJson ? JSON.parse(userJson) : {};
                      const loggedInUserId = userObj.id || userObj.userID || null;
                      
                      await axios.post('http://localhost:5200/api/bookings', {
                        userID: loggedInUserId,
                        tourID: selectedTour.tourId || selectedTour.tourID,
                        bookingDate: selectedTour.date,
                        timeOfBooking: new Date(selectedTour.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        numberOfGuests: guestCount,
                        bookingType: "Standard",
                        userName: userObj.name || '',
                        userSurname: userObj.surname || '',
                        tourName: selectedTour.title || selectedTour.name || '',
                        tourLocation: selectedTour.location || selectedTour.city || ''
                      });
                      setRequestedTourIds([...requestedTourIds, selectedTour.tourId || selectedTour.tourID]);
                      setBookingStatus('success');
                    } catch (e) {
                      console.error(e);
                      alert('Error creating booking');
                    }
                  }}>Submit Request</button>
                </div>
              </>
            ) : (
              <div>
                <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1a8f66', marginBottom: '20px' }}>
                  Success, sending request to guide
                </p>
                <div className="modal-actions" style={{ display: 'flex', justifyContent: 'center' }}>
                  <button className="btn-primary" onClick={() => setIsBookingModalOpen(false)} style={{ width: '100%' }}>OK</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
