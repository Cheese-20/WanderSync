import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from '../components/NavBar';
import '../styles/profile.css';
import axios from 'axios';
import logo from '../assets/images/logo.png';

export default function Profile() {
  const locationHook = useLocation();
  const [activeTab, setActiveTab] = useState('info');
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
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
          fetchProfile(user.id || user.userID);
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
            const response = await axios.get(`/api/bookings/user/${user.id || user.userID}`);
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

  const handleDeleteProfile = () => {
    alert('Delete profile functionality is disabled for now.');
  }

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
      setStatusModal({ open: true, success: true, message: 'User profile saved successfully.' });
    } catch (err) {
      console.warn('Could not save profile to backend, payload:', payload, err);
      setStatusModal({ open: true, success: false, message: 'Profile was not saved. Please try again.' });
    }
  };

  return (
    <div className="profile-page">
      <NavBar />
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
                <button type="button" onClick={handleDeleteProfile} className="delete button">Delete Profile</button>
                <button type="submit" className="save button">Save Profile</button>
              </div>
            </form>

            <div className="apply-guide-section">
              <button
                type="button"
                className="apply-guide-button"
                onClick={() => navigate('/apply-guide')}
              >
                Apply to be a Local Guide
              </button>
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
                {bookings.map(booking => (
                  <div 
                    key={booking.bookingID} 
                    onClick={() => setSelectedBooking(booking)}
                    className="booking-item"
                  >
                    <div className="booking-header">
                      <h4 className="booking-title">Booking #{booking.bookingID}</h4>
                      <span className={`booking-status ${booking.status === 'Confirmed' ? 'status-confirmed' : 'status-pending'}`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="booking-detail-text">Type: {booking.bookingType}</p>
                    <p className="booking-detail-text">
                      Date: {new Date(booking.bookingDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal for detailed booking view */}
        {selectedBooking && (
          <div className="booking-modal-overlay">
            <div className="booking-modal-content">
              <div className="booking-modal-header">
                <h3 className="booking-modal-title">Booking Details</h3>
                <button 
                  onClick={() => setSelectedBooking(null)} 
                  className="booking-modal-close"
                >
                  &times;
                </button>
              </div>
              
              <div className="booking-modal-body">
                <div className="booking-modal-row">
                  <strong className="booking-modal-label">Booking ID:</strong>
                  <span>{selectedBooking.bookingID}</span>
                </div>
                <div className="booking-modal-row">
                  <strong className="booking-modal-label">Status:</strong>
                  <span className={`booking-status ${selectedBooking.status === 'Confirmed' ? 'status-confirmed' : 'status-pending'}`}>
                    {selectedBooking.status}
                  </span>
                </div>
                <div className="booking-modal-row">
                  <strong className="booking-modal-label">Type:</strong>
                  <span>{selectedBooking.bookingType}</span>
                </div>
                <div className="booking-modal-row">
                  <strong className="booking-modal-label">Date:</strong>
                  <span>{new Date(selectedBooking.bookingDate).toLocaleString()}</span>
                </div>
                {selectedBooking.tourID !== 0 && (
                  <div className="booking-modal-row">
                    <strong className="booking-modal-label">Tour ID:</strong>
                    <span>{selectedBooking.tourID}</span>
                  </div>
                )}
                {selectedBooking.curatedSpotID !== 0 && (
                  <div className="booking-modal-row">
                    <strong className="booking-modal-label">Curated Spot ID:</strong>
                    <span>{selectedBooking.curatedSpotID}</span>
                  </div>
                )}
              </div>
              
              <div className="booking-modal-footer">
                <button 
                  onClick={() => setSelectedBooking(null)}
                  className="booking-modal-btn"
                >
                  Close
                </button>
              </div>
            </div>
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

      </main>
    </div>
  );
}
