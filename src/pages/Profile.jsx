import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from '../components/NavBar';
import '../styles/profile.css';
import axios from 'axios';
import logo from '../assets/images/logo.png';
import '../styles/discover.css';
import {
  clearSession,
  getActiveMode,
  getStoredUser,
  roleOf,
  setActiveMode,
  setStoredRole,
  MODE_EXPLORER,
  MODE_GUIDE
} from '../utils/session';
import { withdrawGuideApplication, messageFromError } from '../utils/guideApplication';

export default function Profile() {
  const locationHook = useLocation();
  const [activeTab, setActiveTab] = useState('info');
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  // Delete account confirmation modal state
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    password: '',
    confirmText: '',
    isDeleting: false,
  });

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    cellNumber: '',
    age: '',
    job: '',
    interests: '',
    description: '',
    profilePictureLink: '', // will store data URL or uploaded URL
    location: '',
    createdAt: '',
    createdAtDisplay: ''
  });

  const [preview, setPreview] = useState('');
  const [statusModal, setStatusModal] = useState({ open: false, success: false, message: '' });
  const fileRef = useRef(null);
  const navigate = useNavigate();

  // Role is kept in state so an admin decision made after login can be picked up below.
  const [accountRole, setAccountRole] = useState(roleOf());
  const [activeMode, setActiveModeState] = useState(getActiveMode);
  const [guideActionError, setGuideActionError] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const isGuideAccount = accountRole === MODE_GUIDE;
  const isAwaitingGuideApproval = accountRole === 'pendingguide';

  // The cached role goes stale the moment an admin approves or rejects an application,
  // so confirm it against the server on every visit.
  useEffect(() => {
    const user = getStoredUser();
    const uid = user?.id || user?.userID;
    if (!uid) return;

    let cancelled = false;
    axios.get(`/api/local-guide/application/status/${uid}`)
      .then(res => {
        if (cancelled || !res.data?.role) return;
        setStoredRole(res.data.role);
        setAccountRole((res.data.role || '').toLowerCase());
        setActiveModeState(getActiveMode());
      })
      .catch(() => { /* offline or endpoint unavailable: fall back to the cached role */ });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    // set createdAt once when component mounts
    const date = new Date();
    const displayDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    setForm(f => ({ ...f, createdAt: date.toISOString().slice(0,10), createdAtDisplay: displayDate }));
    // attempt to capture geolocation immediately
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async pos => {
          try {
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=en`);
            const data = await response.json();
            const city = data.city || data.locality || data.principalSubdivision || '';
            setForm(f => ({ ...f, location: city }));
          } catch (err) {
            console.warn('Reverse geocode error', err);
          }
        },
        err => console.warn('Geolocation error', err),
        { enableHighAccuracy: true }
      );
    }
    // populate email/ids from logged-in user if available
    try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        setForm(f => ({ ...f, firstName: user.name || user.firstName || f.firstName, lastName: user.surname || user.lastName || f.lastName, email: user.email || f.email }));
        if (user.id || user.userID) {
          const uid = user.id || user.userID;
          fetchProfile(uid);
          fetchUserData(uid);
        }
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (locationHook.state && locationHook.state.message) {
      setStatusModal({ open: true, success: false, message: locationHook.state.message });
      // Clear the state so the message doesn't persist on subsequent reloads
      window.history.replaceState({}, document.title);
    }
  }, [locationHook.state]);

  useEffect(() => {
    if (activeTab === 'bookings') {
      const fetchBookings = async () => {
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            // using local proxy config since main uses axios with relative paths
            const response = await axios.get(`/api/bookings/user/${user.id || user.userID}/with-details`);
            if (response.data) {
              setBookings(response.data);
            }
          }
        } catch (error) {
          console.error("Error fetching bookings:", error);
        }
      };
      fetchBookings();
    }
  }, [activeTab]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    const userStr = localStorage.getItem('user');
    const userId = userStr ? (JSON.parse(userStr).id || JSON.parse(userStr).userID) : null;
    if (!userId) return;
    setCancellingId(bookingId);
    try {
      await axios.put(`/api/bookings/${bookingId}/cancel?userId=${userId}`);
      setBookings(prev =>
        prev.map(b => b.bookingId === bookingId ? { ...b, status: 'Cancelled' } : b)
      );
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel booking. Please try again.';
      alert(msg);
    } finally {
      setCancellingId(null);
    }
  };

  const fetchProfile = async userId => {
    try {
      const response = await axios.get(`/api/profile/${userId}`);
      const profile = response.data;
      if (profile) {
        setForm(f => ({
          ...f,
          interests: profile.interests || f.interests,
          job: profile.job || f.job,
          description: profile.description || f.description,
          profilePictureLink: profile.profilePictureLink || f.profilePictureLink,
          location: profile.location || f.location,
          createdAt: profile.createdAt ? profile.createdAt.slice(0, 10) : f.createdAt,
          createdAtDisplay: profile.createdAt ? formatDisplayDate(profile.createdAt) : f.createdAtDisplay
        }));
        setPreview(profile.profilePictureLink || '');
      }
    } catch (err) {
      console.warn('Could not fetch existing profile', err);
    }
  };

  const fetchUserData = async userId => {
    try {
      const response = await axios.get(`/api/profile/user/${userId}`);
      const userData = response.data;
      if (userData) {
        setForm(f => ({
          ...f,
          firstName: userData.firstName || f.firstName,
          lastName: userData.lastName || f.lastName,
          email: userData.email || f.email,
          cellNumber: userData.cellNumber || f.cellNumber,
          age: userData.age ? String(userData.age) : f.age
        }));
      }
    } catch (err) {
      console.warn('Could not fetch user data', err);
    }
  };

  const formatDisplayDate = isoDate => {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return '';
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  };

  const handleInput = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const onImageClick = () => fileRef.current?.click();

  const onFileChange = e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      setForm(f => ({ ...f, profilePictureLink: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAccount = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    const userId = user.id || user.userID;

    setDeleteModal(d => ({ ...d, isDeleting: true }));
    try {
      await axios.delete(`/api/auth/account/${userId}`, {
        data: { password: deleteModal.password },
      });
      // Close the confirmation modal and show success
      setDeleteModal({ open: false, password: '', confirmText: '', isDeleting: false });
      setStatusModal({ open: true, success: true, message: 'Your account has been permanently deleted. You will be redirected to the login page.' });
      // Clear session and redirect after the user acknowledges
      setTimeout(() => {
        clearSession();
        navigate('/login');
      }, 3000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete account. Please try again.';
      setDeleteModal(d => ({ ...d, isDeleting: false }));
      setStatusModal({ open: true, success: false, message: msg });
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  // Switch this session between explorer and guide. Same account, no re-authentication
  // needed: the backend already verified the Guide role at login.
  const handleSwitchMode = (mode) => {
    setActiveMode(mode);
    setActiveModeState(mode);
    navigate('/home');
  };

  const handleWithdrawApplication = async () => {
    if (!window.confirm('Cancel your Local Guide application? You can apply again later.')) {
      return;
    }

    setGuideActionError('');
    setIsWithdrawing(true);

    try {
      const user = getStoredUser();
      await withdrawGuideApplication(user?.id || user?.userID);
      setAccountRole('explorer');
      setStatusModal({ open: true, success: true, message: 'Your Local Guide application has been cancelled.' });
    } catch (error) {
      setGuideActionError(messageFromError(error, 'Failed to cancel your application. Please try again.'));
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!form.profilePictureLink) {
      setStatusModal({ open: true, success: false, message: 'Profile picture is required to save your profile.' });
      return;
    }
    if (!form.interests || form.interests.trim() === '') {
      setStatusModal({ open: true, success: false, message: 'Interests are required to save your profile.' });
      return;
    }
    if (!form.description || form.description.trim() === '') {
      setStatusModal({ open: true, success: false, message: 'Bio/Description is required to save your profile.' });
      return;
    }
    if (!form.location || form.location.trim() === '') {
      setStatusModal({ open: true, success: false, message: 'Location is required to save your profile.' });
      return;
    }

    let payload = {
      userID: null,
      profilePictureLink: form.profilePictureLink,
      job: form.job,
      interests: form.interests,
      description: form.description,
      location: form.location,
      createdAt: form.createdAt
    };

    try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        payload.userID = user.id || user.userID || null;
      }
    } catch (e) {
      console.warn('Failed to read user from localStorage', e);
    }

    if (!payload.userID) {
      setStatusModal({ open: true, success: false, message: 'Unable to save profile: user not logged in.' });
      return;
    }

    try {
      await axios.post('/api/profile', payload);

      // Also update the User table with editable user fields
      await axios.put(`/api/profile/user/${payload.userID}`, {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        cellNumber: form.cellNumber,
        age: form.age ? parseInt(form.age, 10) : null
      });

      // Update localStorage so the rest of the app reflects the changes
      try {
        const userJson = localStorage.getItem('user');
        if (userJson) {
          const user = JSON.parse(userJson);
          user.name = form.firstName;
          user.firstName = form.firstName;
          user.surname = form.lastName;
          user.lastName = form.lastName;
          user.email = form.email;
          localStorage.setItem('user', JSON.stringify(user));
        }
      } catch (e) {}

      setStatusModal({ open: true, success: true, message: 'User profile saved successfully.' });
    } catch (err) {
      console.warn('Could not save profile to backend, payload:', payload, err);
      setStatusModal({ open: true, success: false, message: 'Profile was not saved. Please try again.' });
    }
  };

  return (
    <>
      <NavBar />
      <div className="profile-page">

      <main className="page profile-container">
        <h2>User Profile</h2>
        
        <div className="profile-tabs">
          <button 
            className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Profile Info
          </button>
          <button 
            className={`tab-button ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            Bookings
          </button>
          <button 
            className="delete button logout-btn" 
            onClick={handleLogout}
            style={{ marginLeft: 'auto' }}
          >
            Logout
          </button>
        </div>

        {activeTab === 'info' && (
          <div className="profile-card">
            <div className="profile-card-header">
              <div className="profile-image" onClick={onImageClick} role="button" tabIndex={0}>
                {preview ? (
                  <img src={preview} alt="profile" />
                ) : (
                  <div className="image-placeholder" />
                )}
                <div className="profile-photo-text">Change Photo</div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden-file-input" onChange={onFileChange} />
              </div>
            </div>

            <form className="profile-form" onSubmit={handleSubmit}>
              <div className="field-row split">
                <div className="field-group">
                  <label>First name</label>
                  <input name="firstName" value={form.firstName} onChange={handleInput} required />
                </div>
                <div className="field-group">
                  <label>Last name</label>
                  <input name="lastName" value={form.lastName} onChange={handleInput} required />
                </div>
              </div>

              <div className="field-row">
                <div className="field-group full-width">
                  <label>Email</label>
                  <input name="email" value={form.email} onChange={handleInput} type="email" required />
                </div>
              </div>

              <div className="field-row split">
                <div className="field-group">
                  <label>Phone Number</label>
                  <input name="cellNumber" value={form.cellNumber} onChange={handleInput} type="tel" placeholder="e.g. 0812345678" />
                </div>
                <div className="field-group">
                  <label>Age</label>
                  <input name="age" value={form.age} onChange={handleInput} type="number" min="1" max="120" placeholder="e.g. 25" />
                </div>
              </div>

              <div className="field-row">
                <div className="field-group full-width">
                  <label>Interests</label>
                  <input name="interests" value={form.interests} onChange={handleInput} placeholder="e.g. hiking, food, surfing" />
                </div>
              </div>

              <div className="field-row">
                <div className="field-group full-width">
                  <label>Job Title</label>
                  <input name="job" value={form.job} onChange={handleInput} placeholder="e.g. Digital Nomad, Photographer" />
                </div>
              </div>

              <div className="field-row">
                <div className="field-group full-width">
                  <label>Description</label>
                  <textarea name="description" value={form.description} onChange={handleInput} />
                </div>
              </div>

              <div className="field-row split">
                <div className="field-group">
                  <label>Location</label>
                  <input name="location" value={form.location} readOnly className="disabled-field" />
                </div>
                <div className="field-group created-at-group">
                  <label>Created At</label>
                  <input name="createdAtDisplay" value={form.createdAtDisplay} readOnly className="disabled-field" />
                </div>
              </div>

              <div className="actions-row">
                <button
                  type="button"
                  onClick={() => setDeleteModal(d => ({ ...d, open: true, password: '', confirmText: '' }))}
                  className="delete button"
                  style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: '12px', padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Delete Account
                </button>
                <button type="submit" className="save button">Save Profile</button>
              </div>
            </form>

            {/* Verified guides don't see the application button at all: they choose which
                experience to use instead. Pending applicants can withdraw. Everyone else
                gets the call to action. */}
            <div className="apply-guide-section">
              {guideActionError && <p className="guide-action-error">{guideActionError}</p>}

              {isGuideAccount ? (
                <>
                  <p className="mode-switch-caption">
                    You are a verified Local Guide. Choose how you want to use WanderSync.
                  </p>
                  <div className="mode-switch" role="group" aria-label="Choose how to use WanderSync">
                    <button
                      type="button"
                      className={`mode-switch-option ${activeMode === MODE_EXPLORER ? 'active' : ''}`}
                      onClick={() => handleSwitchMode(MODE_EXPLORER)}
                      aria-pressed={activeMode === MODE_EXPLORER}
                    >
                      Login as Explorer
                    </button>
                    <button
                      type="button"
                      className={`mode-switch-option ${activeMode === MODE_GUIDE ? 'active' : ''}`}
                      onClick={() => handleSwitchMode(MODE_GUIDE)}
                      aria-pressed={activeMode === MODE_GUIDE}
                    >
                      Login as Guide
                    </button>
                  </div>
                  <p className="mode-switch-hint">
                    Currently browsing as {activeMode === MODE_GUIDE ? 'a Local Guide' : 'an Explorer'}.
                  </p>
                </>
              ) : isAwaitingGuideApproval ? (
                <>
                  <p className="mode-switch-caption">
                    Your Local Guide application is awaiting review by an admin.
                  </p>
                  <div className="guide-pending-actions">
                    <button
                      type="button"
                      className="apply-guide-button"
                      onClick={() => navigate('/apply-guide')}
                    >
                      View Application
                    </button>
                    <button
                      type="button"
                      className="cancel-application-button"
                      onClick={handleWithdrawApplication}
                      disabled={isWithdrawing}
                    >
                      {isWithdrawing ? 'Cancelling...' : 'Cancel Application'}
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  className="apply-guide-button"
                  onClick={() => navigate('/apply-guide')}
                >
                  Apply to be a Local Guide
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div>
            <h3>Your Reservations</h3>
            {bookings.length === 0 ? (
              <p>You have no bookings yet.</p>
            ) : (
              <div className="bookings-list">
                {bookings.map(booking => {
                  const fallbackImage = 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&q=80&w=400';
                  let imageSrc = fallbackImage;
                  if (booking.pictureURL) {
                    try {
                      imageSrc = booking.pictureURL.startsWith('[') ? JSON.parse(booking.pictureURL)[0] : booking.pictureURL;
                    } catch (e) {
                      imageSrc = fallbackImage;
                    }
                  }
                  const price = booking.price || 0;
                  const guests = booking.numberOfGuests || 1;
                  const total = price * guests;

                  return (
                    <div key={booking.bookingId} className="detailed-booking-card">
                      <div className="detailed-booking-image">
                        <img src={imageSrc} alt={booking.tourTitle} />
                        <span className="detailed-tour-type">{booking.tourType}</span>
                      </div>
                      <div className="detailed-booking-body">
                        <div className="detailed-booking-header">
                          <div>
                            {booking.bookingType && (
                              <span className="detailed-booking-type-tag">{booking.bookingType.toUpperCase()}</span>
                            )}
                            <h4>{booking.tourTitle}</h4>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className={`detailed-status status-${booking.status?.toLowerCase()}`}>
                              {booking.status}
                            </span>
                            {['pending', 'accepted'].includes(booking.status?.toLowerCase()) && (
                              <button
                                className="btn-cancel-booking"
                                onClick={() => handleCancelBooking(booking.bookingId)}
                                disabled={cancellingId === booking.bookingId}
                              >
                                {cancellingId === booking.bookingId ? 'Cancelling...' : '✕ Cancel'}
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {booking.location && (
                          <p className="detailed-booking-location">📍 {booking.location}</p>
                        )}
                        
                        {(() => {
                          if (booking.bookingType?.toLowerCase() === 'itinerary') {
                            try {
                              const timeline = JSON.parse(booking.description);
                              if (Array.isArray(timeline) && timeline.length > 0) {
                                return (
                                  <div className="cool-itinerary-timeline">
                                    {timeline.slice(0, 3).map((item, index) => (
                                      <div 
                                        key={item.id || index} 
                                        className="timeline-node" 
                                        style={{ animationDelay: `${index * 0.15}s` }}
                                      >
                                        <div className="timeline-dot"></div>
                                        <div className="timeline-content">
                                          <div className="timeline-content-top">
                                            <span className="spot-name">{item.name}</span>
                                            {item.type && <span className="spot-type">{item.type}</span>}
                                          </div>
                                          {item.location && <span className="spot-location">📍 {item.location}</span>}
                                        </div>
                                      </div>
                                    ))}
                                    {timeline.length > 3 && (
                                      <div className="timeline-overflow">
                                        + {timeline.length - 3} more spots in this trip
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              return <p className="detailed-booking-desc">Empty itinerary.</p>;
                            } catch (e) {
                              return <p className="detailed-booking-desc">Custom itinerary details unavailable.</p>;
                            }
                          }
                          return (
                            <p className="detailed-booking-desc">
                              {booking.description ? (booking.description.length > 100 ? booking.description.substring(0, 100) + '...' : booking.description) : 'No description provided.'}
                            </p>
                          );
                        })()}
                        
                        <div className="detailed-booking-details">
                          <div className="detail-item">
                            <span className="detail-label">Tour Date</span>
                            <span className="detail-value">{new Date(booking.tourDate).toLocaleDateString()}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Booked On</span>
                            <span className="detail-value">{new Date(booking.bookingDate).toLocaleDateString()} {booking.timeOfBooking}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Guests</span>
                            <span className="detail-value">👥 {guests}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Total Price</span>
                            <span className="detail-value price-value">R {total}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {statusModal.open && (
          <div className="modal-overlay" onClick={() => setStatusModal({ ...statusModal, open: false })}>
            <div className="status-modal" onClick={e => e.stopPropagation()}>
              <img src={logo} alt="WanderSync logo" className="modal-logo" />
              <p className={statusModal.success ? 'modal-success' : 'modal-error'}>{statusModal.message}</p>
              <button onClick={() => setStatusModal({ ...statusModal, open: false })}>Close</button>
            </div>
          </div>
        )}

        {/* ── Delete Account confirmation modal ─────────────────────────── */}
        {deleteModal.open && (
          <div className="modal-overlay" onClick={() => !deleteModal.isDeleting && setDeleteModal(d => ({ ...d, open: false }))}>
            <div className="status-modal" style={{ maxWidth: '460px' }} onClick={e => e.stopPropagation()}>
              <img src={logo} alt="WanderSync logo" className="modal-logo" />

              {/* Warning icon */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>

              <h3 style={{ margin: '0 0 8px', color: '#dc2626', fontSize: '1.1rem', fontWeight: 700 }}>
                Delete Account Permanently
              </h3>
              <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: '0.92rem', lineHeight: '1.55' }}>
                This action <strong>cannot be undone</strong>. All your data — posts, bookings, matches,
                messages, and profile — will be permanently deleted.
              </p>

              {/* Step 1: password */}
              <div style={{ textAlign: 'left', marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Enter your password to confirm:
                </label>
                <input
                  type="password"
                  value={deleteModal.password}
                  onChange={e => setDeleteModal(d => ({ ...d, password: e.target.value }))}
                  placeholder="Your current password"
                  disabled={deleteModal.isDeleting}
                  style={{
                    width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb',
                    borderRadius: '10px', fontSize: '0.92rem', outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Step 2: type DELETE */}
              <div style={{ textAlign: 'left', marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Type <strong style={{ color: '#dc2626' }}>DELETE</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteModal.confirmText}
                  onChange={e => setDeleteModal(d => ({ ...d, confirmText: e.target.value }))}
                  placeholder="DELETE"
                  disabled={deleteModal.isDeleting}
                  style={{
                    width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb',
                    borderRadius: '10px', fontSize: '0.92rem', outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => setDeleteModal(d => ({ ...d, open: false }))}
                  disabled={deleteModal.isDeleting}
                  style={{
                    padding: '10px 22px', borderRadius: '12px', border: '1.5px solid #e5e7eb',
                    background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={
                    deleteModal.isDeleting ||
                    !deleteModal.password.trim() ||
                    deleteModal.confirmText !== 'DELETE'
                  }
                  style={{
                    padding: '10px 22px', borderRadius: '12px', border: 'none',
                    background: deleteModal.confirmText === 'DELETE' && deleteModal.password.trim()
                      ? '#dc2626' : '#fca5a5',
                    color: '#fff', fontWeight: 600,
                    cursor: deleteModal.confirmText === 'DELETE' && deleteModal.password.trim()
                      ? 'pointer' : 'not-allowed',
                    transition: 'background 0.2s'
                  }}
                >
                  {deleteModal.isDeleting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
    </>
  );
}
