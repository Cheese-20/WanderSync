import React, { useState, useEffect } from 'react';
import '../styles/dashboard.css';
import logo from '../assets/images/logo.png';
import NavBar from '../components/NavBar';

// SVG Icons
const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const StarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'text-bottom' }}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'text-bottom' }}>
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [pendingSpots, setPendingSpots] = useState([]);
  const [loadingSpots, setLoadingSpots] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [isUpdatingBooking, setIsUpdatingBooking] = useState(false);
  const [bookingToDecline, setBookingToDecline] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [tourTypeFilter, setTourTypeFilter] = useState('All');

  // Fetch logged in user id
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const guideId = user?.id || user?.userID;

  useEffect(() => {
    if (activeTab === 'Spot verification' && guideId) {
      fetchPendingSpots();
    } else if (activeTab === 'Bookings' && guideId) {
      fetchGuideBookings();
    }
  }, [activeTab, guideId]);

  const fetchGuideBookings = async () => {
    setLoadingBookings(true);
    try {
      const response = await fetch(`http://localhost:5200/api/bookings/guide/${guideId}`);
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error("Failed to fetch bookings", error);
    }
    setLoadingBookings(false);
  };

  const updateBookingStatus = async (bookingId, action) => {
    setIsUpdatingBooking(true);
    try {
      const response = await fetch(`http://localhost:5200/api/bookings/${bookingId}/${action}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        // Refresh bookings
        fetchGuideBookings();
      } else {
        alert(`Failed to ${action} booking.`);
      }
    } catch (error) {
      console.error(`Error updating booking: ${action}`, error);
    } finally {
      setIsUpdatingBooking(false);
    }
  };

  const fetchPendingSpots = async () => {
    setLoadingSpots(true);
    try {
      const response = await fetch(`http://localhost:5200/api/spot/pending/${guideId}`);
      if (response.ok) {
        const data = await response.json();
        setPendingSpots(data);
      }
    } catch (error) {
      console.error("Failed to fetch spots", error);
    }
    setLoadingSpots(false);
  };

  const handleVote = async (spotId, voteType) => {
    setIsVoting(true);
    try {
      const response = await fetch(`http://localhost:5200/api/spot/${spotId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideId, voteType })
      });
      if (response.ok) {
        // Remove the voted spot from the list
        setPendingSpots(prev => prev.filter(s => s.spotID !== spotId));
      } else {
        alert("Failed to submit vote");
      }
    } catch (error) {
      console.error("Error submitting vote", error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <>
      <NavBar />
      {(isVoting || isUpdatingBooking) && (
        <div className="global-loading-overlay">
          <div className="global-loading-popup">
            <img src={logo} alt="WanderSync" className="brand-logo" style={{ width: '60px', height: 'auto', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }} />
            <div className="global-loading-text">Updating, please wait</div>
          </div>
        </div>
      )}

      {/* Decline Confirmation Modal */}
      {bookingToDecline && (
        <div className="global-loading-overlay" style={{ zIndex: 1000 }}>
          <div className="global-loading-popup" style={{ textAlign: 'center', padding: '2rem', maxWidth: '400px' }}>
            <img src={logo} alt="WanderSync" className="brand-logo" style={{ width: '80px', height: 'auto', marginBottom: '1.5rem' }} />
            <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>Decline Booking?</h3>
            <p style={{ color: '#4b5563', marginBottom: '2rem', lineHeight: '1.5' }}>
              Are you sure you want to decline the booking from <strong>{bookingToDecline.userName}</strong> for <strong>{bookingToDecline.tourTitle}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                className="b-btn"
                style={{ backgroundColor: '#f1f5f9', color: '#475569' }}
                onClick={() => setBookingToDecline(null)}
              >
                Cancel
              </button>
              <button
                className="b-btn b-btn-decline"
                onClick={() => {
                  updateBookingStatus(bookingToDecline.bookingId, 'decline');
                  setBookingToDecline(null);
                }}
              >
                Yes, Decline
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-container">
        {/* Top Tabs */}
        <div className="dashboard-tabs">
          <div
            className={`dashboard-tab ${activeTab === 'Overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('Overview')}
          >
            Overview
          </div>
          <div
            className={`dashboard-tab ${activeTab === 'Bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('Bookings')}
          >
            Bookings
          </div>
          <div
            className={`dashboard-tab ${activeTab === 'Spot verification' ? 'active' : ''}`}
            onClick={() => setActiveTab('Spot verification')}
          >
            Spot verification
          </div>
        </div>

        {activeTab === 'Overview' && (
          <>
            {/* Summary Cards */}
            <div className="summary-cards">
              <div className="summary-card">
                <div className="card-icon icon-blue">
                  <UsersIcon />
                </div>
                <h2>18</h2>
                <p>Bookings this month</p>
              </div>
              <div className="summary-card">
                <div className="card-icon icon-green">
                  <StarIcon />
                </div>
                <h2>4.9</h2>
                <p>Average Rating</p>
              </div>
            </div>

            {/* My Experiences */}
            <div className="dashboard-section">
              <div className="section-header">
                <h3>My Experiences</h3>
                <button className="btn-create">+ Create Experience</button>
              </div>
              <div className="experience-list">

                <div className="experience-item">
                  <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="Sunrise Photo Walk" className="exp-image" />
                  <div className="exp-details">
                    <div className="exp-title-row">
                      <h4 className="exp-title">Sunrise Photo Walk</h4>
                      <span className="badge active">active</span>
                    </div>
                    <p className="exp-subtitle">3 bookings</p>
                  </div>
                  <div className="exp-actions">
                    <button className="btn-small btn-edit">Edit</button>
                    <button className="btn-small btn-view">View</button>
                  </div>
                </div>

                <div className="experience-item">
                  <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="Street Art & Coffee" className="exp-image" />
                  <div className="exp-details">
                    <div className="exp-title-row">
                      <h4 className="exp-title">Street Art &amp; Coffee</h4>
                      <span className="badge draft">draft</span>
                    </div>
                    <p className="exp-subtitle">0 bookings</p>
                  </div>
                  <div className="exp-actions">
                    <button className="btn-small btn-edit">Edit</button>
                    <button className="btn-small btn-view">View</button>
                  </div>
                </div>

              </div>
            </div>

            {/* Bookings Section */}
            <div className="dashboard-section">

              <div className="booking-item highlight">
                <div className="booking-details">
                  <p className="bk-title">Sunrise photo walk</p>
                  <p className="bk-time">Tomorrow, 10:00 AM</p>
                  <p className="bk-count">3 booked</p>
                </div>
                <span className="badge confirmed">Confirmed</span>
              </div>

              <div className="booking-item">
                <div className="booking-details">
                  <p className="bk-title">Sunrise photo walk</p>
                  <p className="bk-time">Tomorrow, 10:00 AM</p>
                  <p className="bk-count">5 booked</p>
                </div>
                <span className="badge pending">Pending</span>
              </div>

            </div>
          </>
        )}

        {activeTab === 'Bookings' && (
          <div className="dashboard-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ margin: 0 }}>Tour Bookings</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <select
                  className="filter-select"
                  value={tourTypeFilter}
                  onChange={(e) => setTourTypeFilter(e.target.value)}
                >
                  <option value="All">All Tour Types</option>
                  {[...new Set(bookings.map(b => b.tourType))].filter(Boolean).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <select
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Declined">Declined</option>
                </select>
              </div>
            </div>

            {loadingBookings ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>Loading bookings...</div>
            ) : (
              <div className="bookings-list-container">
                {bookings
                  .filter(b => statusFilter === 'All' || b.status === statusFilter)
                  .filter(b => tourTypeFilter === 'All' || b.tourType === tourTypeFilter)
                  .sort((a, b) => {
                    const statusOrder = { 'Pending': 1, 'Accepted': 2, 'Declined': 3 };
                    const orderA = statusOrder[a.status] || 4;
                    const orderB = statusOrder[b.status] || 4;
                    // If statuses are the same, sort by booking date (newest first)
                    if (orderA === orderB) {
                      return new Date(b.bookingDate) - new Date(a.bookingDate);
                    }
                    return orderA - orderB;
                  })
                  .map(booking => {

                    let statusText = booking.status;
                    if (statusText === 'Accepted') statusText = 'Confirmed';
                    if (statusText === 'Declined') statusText = 'Rejected';

                    const statusClass = booking.status.toLowerCase();

                    return (
                      <div key={booking.bookingId} className={`b-card b-card-${statusClass}`}>

                        <div className="b-card-top">
                          <img
                            src={booking.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=80'}
                            alt={booking.userName}
                            className="b-avatar"
                          />
                          <div className="b-user-info">
                            <div className="b-user-row">
                              <span className="b-name">{booking.userName}</span>
                              <span className={`b-status-pill b-status-${statusClass}`}>{statusText}</span>
                            </div>
                            <div className="b-tour-title">{booking.tourTitle}</div>
                          </div>
                        </div>

                        <div className="b-card-middle">
                          <div className="b-detail"><CalendarIcon /> {new Date(booking.bookingDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                          <div className="b-detail"><ClockIcon /> {booking.timeOfBooking || 'N/A'}</div>
                          <div className="b-detail">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'text-bottom' }}>
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                              <circle cx="9" cy="7" r="4"></circle>
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            {booking.numberOfGuests} guest{booking.numberOfGuests > 1 ? 's' : ''}
                          </div>
                        </div>



                        <div className="b-card-bottom">
                          <div className="b-price">
                            <strong>R{(booking.price * booking.numberOfGuests).toFixed(0)}</strong> total
                          </div>

                          {booking.status === 'Pending' && (
                            <div className="b-actions">
                              <button
                                className="b-btn b-btn-decline"
                                disabled={isUpdatingBooking}
                                onClick={() => setBookingToDecline(booking)}
                              >
                                Decline
                              </button>
                              <button
                                className="b-btn b-btn-accept"
                                disabled={isUpdatingBooking}
                                onClick={() => updateBookingStatus(booking.bookingId, 'accept')}
                              >
                                Accept
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                {bookings.length === 0 && !loadingBookings && (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280', gridColumn: '1 / -1' }}>
                    No bookings found.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'Spot verification' && (
          <div className="dashboard-section">
            <div className="section-header">
              <div>
                <h3 style={{ marginBottom: '4px' }}>User-Submitted Spots</h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>Review and verify new hangout spots discovered by community members</p>
              </div>
            </div>
            {loadingSpots ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 0' }}>
                <div className="spinner"></div>
                <p style={{ marginTop: '1rem', color: '#6b7280', fontWeight: '500' }}>Fetching spots...</p>
              </div>
            ) : pendingSpots.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>There are no spots pending verification.</p>
            ) : (
              <div className="experience-list" style={{ display: 'flex', flexDirection: 'column' }}>
                {pendingSpots.map(spot => {
                  // Calculate days ago
                  const daysAgo = Math.round((new Date() - new Date(spot.submittedAt)) / (1000 * 60 * 60 * 24));
                  const timeText = daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`;

                  return (
                    <div className="spot-card" key={spot.spotID}>
                      {spot.pictureURL ? (
                        <img src={spot.pictureURL} alt={spot.activityName} className="spot-card-img" />
                      ) : (
                        <div className="spot-card-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e2e8f0', color: '#94a3b8' }}>No Image</div>
                      )}

                      <div className="spot-card-content">
                        <div className="spot-card-header">
                          <h4 className="spot-card-title">{spot.activityName}</h4>
                          <span className="badge pending" style={{ backgroundColor: '#ecfdf5', color: '#10b981', borderColor: 'transparent', padding: '4px 10px' }}>Pending</span>
                        </div>
                        <p className="spot-card-subtitle">
                          <span style={{ backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', marginRight: '8px' }}>{spot.activityType || 'Activity'}</span>
                          • {timeText}
                        </p>

                        <div className="spot-submitter">
                          {spot.submitterAvatar ? (
                            <img src={spot.submitterAvatar} alt="Submitter" className="spot-submitter-avatar" />
                          ) : (
                            <div className="spot-submitter-avatar"></div>
                          )}
                          <div className="spot-submitter-info">
                            <p>Submitted by</p>
                            <h5>{spot.submitterName || 'Unknown User'}</h5>
                          </div>
                        </div>

                        <div className="spot-location">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                          {spot.location || 'Unknown Location'}
                        </div>

                        <p className="spot-desc">{spot.description}</p>

                        <div className="spot-card-actions">
                          <button className="btn-small" style={{ backgroundColor: '#ef4444', color: 'white', borderRadius: '20px', padding: '6px 16px', border: 'none' }} onClick={() => handleVote(spot.spotID, 'reject')} disabled={isVoting}>Reject</button>
                          <button className="btn-small" style={{ backgroundColor: '#a4ddbc', color: '#065f46', borderRadius: '20px', padding: '6px 16px', border: 'none', fontWeight: '500' }} onClick={() => handleVote(spot.spotID, 'approve')} disabled={isVoting}>Approve</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </>
  );
}
