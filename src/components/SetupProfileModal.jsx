import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './SetupProfileModal.css';

export default function SetupProfileModal({ userId, onComplete }) {
  const [form, setForm] = useState({
    profilePictureLink: '',
    interests: '',
    job: '',
    description: '',
    location: '',
    createdAt: new Date().toISOString().slice(0, 10)
  });
  const [error, setError] = useState('');
  const [missingFields, setMissingFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    // Attempt to pre-fill location using reverse geocoding
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async pos => {
          try {
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=en`);
            const data = await response.json();
            const city = data.city || data.locality || '';
            const country = data.countryName || '';
            const locationStr = [city, country].filter(Boolean).join(', ');
            if (locationStr) {
              setForm(f => ({ ...f, location: locationStr }));
            }
          } catch (err) {
            console.warn('Reverse geocode error', err);
          }
        },
        err => console.warn('Geolocation error', err),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const handleInput = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const onFileChange = e => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (upload) => {
        setForm(f => ({ ...f, profilePictureLink: upload.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setMissingFields([]);
    
    const missing = [];
    if (!form.profilePictureLink) missing.push('profilePictureLink');
    if (!form.interests.trim()) missing.push('interests');
    if (!form.description.trim()) missing.push('description');
    if (!form.location.trim()) missing.push('location');

    if (missing.length > 0) {
      setMissingFields(missing);
      setError('Please fill out all required fields.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/profile', {
        userID: userId,
        profilePictureLink: form.profilePictureLink,
        interests: form.interests,
        description: form.description,
        location: form.location,
        job: form.job,
        createdAt: form.createdAt
      });
      onComplete();
    } catch (err) {
      console.error("Error saving profile", err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-modal-overlay">
      <div className="setup-modal-container">
        <h2 className="setup-modal-title">Set up your profile</h2>
        <p className="setup-modal-subtitle">
          Let's get to know you better! This helps others connect with you.
        </p>

        <div className="setup-modal-form">
          <div className="setup-photo-section">
            <span className={`setup-photo-label ${missingFields.includes('profilePictureLink') ? 'error-label' : ''}`}>Profile Photo</span>
            <div className={`setup-photo-circle ${missingFields.includes('profilePictureLink') ? 'error-border' : ''}`} onClick={() => fileRef.current?.click()}>
              {form.profilePictureLink ? (
                <img src={form.profilePictureLink} alt="Profile" className="setup-photo-img" />
              ) : (
                <div className="setup-photo-placeholder">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              )}
              <div className="setup-camera-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
              </div>
            </div>
            <input 
              ref={fileRef} 
              type="file" 
              accept="image/*" 
              className="setup-hidden-file-input" 
              onChange={onFileChange} 
            />
          </div>

          <div className="setup-form-grid">
            <div className="setup-input-group">
              <label className={missingFields.includes('interests') ? 'error-label' : ''}>Interests *</label>
              <div className={`setup-input-wrapper no-icon ${missingFields.includes('interests') ? 'error-border' : ''}`}>
                <input 
                  name="interests" 
                  value={form.interests} 
                  onChange={handleInput} 
                  placeholder="e.g. hiking, food, surfing" 
                />
              </div>
            </div>

            <div className="setup-input-group">
              <label>Job Title</label>
              <div className="setup-input-wrapper no-icon">
                <input 
                  name="job" 
                  value={form.job} 
                  onChange={handleInput} 
                  placeholder="e.g. Digital Nomad" 
                />
              </div>
            </div>

            <div className="setup-input-group full-width">
              <label className={missingFields.includes('description') ? 'error-label' : ''}>Description *</label>
              <div className={`setup-input-wrapper no-icon ${missingFields.includes('description') ? 'error-border' : ''}`}>
                <textarea 
                  name="description" 
                  value={form.description} 
                  onChange={handleInput} 
                  placeholder="Tell us about yourself..." 
                  rows="3"
                  className="setup-textarea"
                />
              </div>
            </div>

            <div className="setup-input-group full-width">
              <label className={missingFields.includes('location') ? 'error-label' : ''}>Location *</label>
              <div className={`setup-input-wrapper ${missingFields.includes('location') ? 'error-border' : ''}`}>
                <span className="setup-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </span>
                <input 
                  name="location" 
                  value={form.location} 
                  onChange={handleInput} 
                  placeholder="City, Country" 
                />
              </div>
            </div>
          </div>



          {error && <p className="setup-error-text">{error}</p>}

          <button 
            className="setup-continue-btn" 
            onClick={handleSubmit} 
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Continue'}
            {!loading && <span className="setup-arrow">&rarr;</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
