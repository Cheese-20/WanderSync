import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './SetupProfileModal.css';

export default function SetupProfileModal({ userId, onComplete }) {
  const [form, setForm] = useState({
    profilePictureLink: 'https://via.placeholder.com/150',
    interests: '',
    job: '',
    description: '',
    location: '',
    createdAt: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    // Automatically set createdAt
    const date = new Date();
    setForm(f => ({ ...f, createdAt: date.toISOString().slice(0, 10) }));

    // Automatically set location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async pos => {
          try {
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=en`);
            const data = await response.json();
            const city = data.city || data.locality || data.principalSubdivision || 'Unknown Location';
            setForm(f => ({ ...f, location: city }));
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
    setForm({ ...form, [name]: value });
  };

  const onFileChange = e => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (upload) => {
        setForm({ ...form, profilePictureLink: upload.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.interests.trim()) {
      setError('Please provide at least one interest.');
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
      onComplete(); // Profile saved, close modal
    } catch (err) {
      console.error("Error saving profile", err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-modal-overlay">
      <div className="setup-modal-content">
        <h2>Set up your profile</h2>
        <p className="subtitle">Let's get to know you better! This helps others connect with you.</p>

        <div className="setup-form">
          <div className="photo-section">
            <span className="field-label">Profile Photo</span>
            <div className="photo-circle" onClick={() => fileRef.current?.click()}>
              {form.profilePictureLink && form.profilePictureLink !== 'https://via.placeholder.com/150' ? (
                <img src={form.profilePictureLink} alt="Profile" />
              ) : (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              )}
              <div className="camera-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden-file-input" onChange={onFileChange} style={{display: 'none'}} />
          </div>

          <div className="input-group">
            <label>Interests *</label>
            <input 
              name="interests" 
              value={form.interests} 
              onChange={handleInput} 
              placeholder="e.g. hiking, food, surfing" 
            />
          </div>

          <div className="input-group">
            <label>Job Title</label>
            <input 
              name="job" 
              value={form.job} 
              onChange={handleInput} 
              placeholder="e.g. Digital Nomad" 
            />
          </div>

          <div className="input-group">
            <label>Description</label>
            <textarea 
              name="description" 
              value={form.description} 
              onChange={handleInput} 
              placeholder="Tell us about yourself..." 
              rows="3"
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button 
            className="continue-btn" 
            onClick={handleSubmit} 
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Continue'}
            {!loading && <span>&rarr;</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
