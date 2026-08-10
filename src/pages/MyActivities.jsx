import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/discover.css';

export default function MyActivities() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ratingForm, setRatingForm] = useState({ guideId: null, score: 0, comment: '' });
  const [ratingMessage, setRatingMessage] = useState('');
  const [ratingError, setRatingError] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      navigate('/login', { state: { message: 'Please login to view your activities' } });
      return;
    }
    try {
      const user = JSON.parse(userJson);
      const id = user.id || user.userID;
      setUserId(id);
      fetchBookings(id);
    } catch (e) {
      setError('Error loading user data.');
      setLoading(false);
    }
  }, [navigate]);

  const fetchBookings = async (id) => {
    try {
      const res = await axios.get(`/api/bookings/user/${id}/with-details`);
      setBookings(res.data);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Unable to load your activities. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRating = (guideId) => {
    setRatingForm({ guideId, score: 0, comment: '' });
    setRatingMessage('');
    setRatingError('');
  };

  const handleCloseRating = () => {
    setRatingForm({ guideId: null, score: 0, comment: '' });
    setRatingMessage('');
    setRatingError('');
  };

  const handleStarClick = (score) => {
    setRatingForm(prev => ({ ...prev, score }));
  };

  const handleCommentChange = (e) => {
    setRatingForm(prev => ({ ...prev, comment: e.target.value }));
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (ratingForm.score === 0) {
      setRatingError('Please select a rating (1-5 stars).');
      return;
    }

    setIsSubmittingRating(true);
    setRatingError('');
    setRatingMessage('');

    try {
      const res = await axios.post(`/api/local-guide/${ratingForm.guideId}/rate`, {
        userID: userId,
        score: ratingForm.score,
        comment: ratingForm.comment.trim() || null
      });
      setRatingMessage(res.data.message || 'Rating submitted!');
      setTimeout(() => {
        handleCloseRating();
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit rating. Please try again.';
      setRatingError(msg);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Group bookings by guide
  const groupedByGuide = bookings.reduce((acc, booking) => {
    const key = booking.guideId;
    if (!acc[key]) {
      acc[key] = {
        guideId: booking.guideId,
        guideName: booking.guideName,
        bookings: []
      };
    }
    acc[key].bookings.push(booking);
    return acc;
  }, {});

  const guideGroups = Object.values(groupedByGuide);

  const renderStars = (currentScore, interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`star ${i < currentScore ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
        onClick={interactive ? () => handleStarClick(i + 1) : undefined}
        role={interactive ? 'button' : undefined}
        aria-label={interactive ? `Rate ${i + 1} star${i > 0 ? 's' : ''}` : undefined}
      >
        &#9733;
      </span>
    ));
  };

  return (
    <div className="discover-page">

      <header className="discover-hero">
        <h1>My Activities</h1>
        <p>View your past bookings with local guides and leave reviews</p>
      </header>

      <section className="discover-content">
        {loading && (
          <div className="discover-loading">
            <div className="loading-spinner"></div>
            <p>Loading your activities...</p>
          </div>
        )}

        {error && (
          <div className="discover-error">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && guideGroups.length === 0 && (
          <div className="discover-empty">
            <h3>No activities yet</h3>
            <p>You haven't booked any tours with local guides yet.</p>
            <button
              className="guide-card-btn"
              style={{ marginTop: '16px' }}
              onClick={() => navigate('/discover')}
            >
              Discover Guides
            </button>
          </div>
        )}

        {!loading && !error && guideGroups.length > 0 && (
          <div className="activities-groups">
            {guideGroups.map((group) => (
              <div key={group.guideId} className="activity-guide-group">
                <div className="activity-guide-header">
                  <h3
                    className="activity-guide-name"
                    onClick={() => navigate(`/guide/${group.guideId}`)}
                  >
                    {group.guideName}
                  </h3>
                  <button
                    className="btn-rate-guide"
                    onClick={() => handleOpenRating(group.guideId)}
                  >
                    Rate Guide
                  </button>
                </div>

                {/* Rating form for this guide */}
                {ratingForm.guideId === group.guideId && (
                  <div className="rating-form-container">
                    <form onSubmit={handleSubmitRating} className="rating-form">
                      <h4>Rate {group.guideName}</h4>
                      <div className="rating-form-stars">
                        {renderStars(ratingForm.score, true)}
                      </div>
                      <textarea
                        className="rating-form-comment"
                        placeholder="Leave a comment (optional)"
                        value={ratingForm.comment}
                        onChange={handleCommentChange}
                        rows="3"
                        maxLength="500"
                      />
                      <div className="rating-form-actions">
                        <button
                          type="submit"
                          className="btn-filter"
                          disabled={isSubmittingRating}
                        >
                          {isSubmittingRating ? 'Submitting...' : 'Submit Rating'}
                        </button>
                        <button
                          type="button"
                          className="btn-filter-clear"
                          onClick={handleCloseRating}
                        >
                          Cancel
                        </button>
                      </div>
                      {ratingMessage && <p className="booking-success">{ratingMessage}</p>}
                      {ratingError && <p className="booking-error">{ratingError}</p>}
                    </form>
                  </div>
                )}

                <div className="activity-bookings-list">
                  {group.bookings.map((booking) => (
                    <div key={booking.bookingId} className="activity-booking-card">
                      <div className="activity-booking-info">
                        <h4>{booking.tourTitle}</h4>
                        <span className="tour-type-badge">{booking.tourType}</span>
                      </div>
                      <div className="activity-booking-meta">
                        <span>Tour Date: {new Date(booking.tourDate).toLocaleDateString()}</span>
                        <span>Booked: {new Date(booking.bookingDate).toLocaleDateString()}</span>
                        <span className={`activity-status status-${booking.status?.toLowerCase()}`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
