import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import '../styles/profile.css';
import axios from 'axios';
import logo from '../assets/images/logo.png';

export default function Profile() {
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
      <main className="page" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h2>User Profile</h2>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
          <button 
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: activeTab === 'info' ? 'bold' : 'normal',
              color: activeTab === 'info' ? '#007BFF' : '#333'
            }}
            onClick={() => setActiveTab('info')}
          >
            Profile Info
          </button>
          <button 
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: activeTab === 'bookings' ? 'bold' : 'normal',
              color: activeTab === 'bookings' ? '#007BFF' : '#333'
            }}
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
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChange} />
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
          </div>
        )}

        {activeTab === 'bookings' && (
          <div>
            <h3>Your Reservations</h3>
            {bookings.length === 0 ? (
              <p>You have no bookings yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {bookings.map(booking => (
                  <div 
                    key={booking.bookingID} 
                    onClick={() => setSelectedBooking(booking)}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '1.5rem',
                      cursor: 'pointer',
                      transition: 'box-shadow 0.2s',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: '0' }}>Booking #{booking.bookingID}</h4>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px', 
                        backgroundColor: booking.status === 'Confirmed' ? '#d4edda' : '#fff3cd',
                        color: booking.status === 'Confirmed' ? '#155724' : '#856404',
                        fontSize: '0.9rem'
                      }}>
                        {booking.status}
                      </span>
                    </div>
                    <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>Type: {booking.bookingType}</p>
                    <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
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
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{ 
              background: '#fff', 
              padding: '2rem', 
              borderRadius: '12px', 
              width: '90%', 
              maxWidth: '500px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Booking Details</h3>
                <button 
                  onClick={() => setSelectedBooking(null)} 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    fontSize: '1.5rem', 
                    cursor: 'pointer',
                    lineHeight: 1 
                  }}
                >
                  &times;
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                  <strong style={{ color: '#555' }}>Booking ID:</strong>
                  <span>{selectedBooking.bookingID}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                  <strong style={{ color: '#555' }}>Status:</strong>
                  <span style={{ fontWeight: 'bold', color: selectedBooking.status === 'Confirmed' ? '#28a745' : '#ffc107' }}>
                    {selectedBooking.status}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                  <strong style={{ color: '#555' }}>Type:</strong>
                  <span>{selectedBooking.bookingType}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                  <strong style={{ color: '#555' }}>Date:</strong>
                  <span>{new Date(selectedBooking.bookingDate).toLocaleString()}</span>
                </div>
                {selectedBooking.tourID !== 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                    <strong style={{ color: '#555' }}>Tour ID:</strong>
                    <span>{selectedBooking.tourID}</span>
                  </div>
                )}
                {selectedBooking.curatedSpotID !== 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                    <strong style={{ color: '#555' }}>Curated Spot ID:</strong>
                    <span>{selectedBooking.curatedSpotID}</span>
                  </div>
                )}
              </div>
              
              <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                <button 
                  onClick={() => setSelectedBooking(null)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#007BFF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
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
