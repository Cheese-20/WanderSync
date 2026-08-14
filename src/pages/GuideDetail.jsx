import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/discover.css';

export default function GuideDetail() {
  const { guideId } = useParams();
  const navigate = useNavigate();
  const [guide, setGuide] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingTourId, setBookingTourId] = useState(null);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    fetchGuideDetails();
    fetchGuideRatings();
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

  const fetchGuideRatings = async () => {
    try {
      const res = await axios.get(`/api/local-guide/${guideId}/ratings`);
      setRatings(res.data.ratings || []);
    } catch (err) {
      console.error('Error fetching ratings:', err);
    }
  };

  const handleBookTour = async (tourId) => {
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      navigate('/login', { state: { message: 'Please login to book a tour' } });
      return;
    }

    const user = JSON.parse(userJson);
    const userId = user.id || user.userID;

    setIsBooking(true);
    setBookingTourId(tourId);
    setBookingMessage('');
    setBookingError('');

    try {
      const res = await axios.post('/api/bookings', {
        userID: userId,
        tourID: tourId,
        bookingDate: new Date().toISOString()
      });
      setBookingMessage(res.data.message || 'Booking confirmed!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to book tour. Please try again.';
      setBookingError(msg);
    } finally {
      setIsBooking(false);
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
                      className="btn-book-tour"
                      onClick={() => handleBookTour(tour.tourId)}
                      disabled={isBooking && bookingTourId === tour.tourId}
                    >
                      {isBooking && bookingTourId === tour.tourId ? 'Booking...' : 'Book Tour'}
                    </button>
                    {bookingTourId === tour.tourId && bookingMessage && (
                      <p className="booking-success">{bookingMessage}</p>
                    )}
                    {bookingTourId === tour.tourId && bookingError && (
                      <p className="booking-error">{bookingError}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-tours">This guide has no tours listed yet.</p>
          )}
        </div>

        {ratings.length > 0 && (
          <div className="guide-detail-section">
            <h2>Reviews</h2>
            <div className="ratings-list">
              {ratings.map((rating) => (
                <div key={rating.ratingId} className="rating-card">
                  <div className="rating-card-header">
                    <span className="rating-user">{rating.userName}</span>
                    <div className="rating-stars-small">
                      {renderStars(rating.score)}
                    </div>
                  </div>
                  {rating.comment && <p className="rating-comment">{rating.comment}</p>}
                  <span className="rating-date">
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
