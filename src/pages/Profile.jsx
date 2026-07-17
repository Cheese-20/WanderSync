import React, { useState, useRef, useEffect } from 'react';
import NavBar from '../components/NavBar';
import '../styles/profile.css';
import axios from 'axios';

export default function Profile() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    interests: '',
    description: '',
    profilePictureLi: '', // will store data URL or uploaded URL
    latitude: '',
    longitude: '',
    createdAt: ''
  });

  const [preview, setPreview] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    // set createdAt once when component mounts
    setForm(f => ({ ...f, createdAt: new Date().toISOString() }));
    // attempt to capture geolocation immediately
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setForm(f => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude })),
        err => console.warn('Geolocation error', err),
        { enableHighAccuracy: true }
      );
    }
    // populate email/ids from logged-in user if available
    try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        setForm(f => ({ ...f, email: user.email || f.email }));
      }
    } catch (e) {}
  }, []);

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
      setForm(f => ({ ...f, profilePictureLi: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported by this browser');
    navigator.geolocation.getCurrentPosition(
      pos => setForm(f => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude })),
      err => alert('Unable to get location: ' + (err.message || err))
    );
  };

  const handleSubmit = async e => {
    e.preventDefault();
    // Attach userID if available
    let payload = { ...form };
    try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        payload.userID = user.id || user.userID || null;
      }
    } catch (e) {}

    // Send to backend profile endpoint (create or update)
    try {
      await axios.post('/api/profile', payload);
      alert('Profile saved');
    } catch (err) {
      console.warn('Could not save profile to backend, payload:', payload, err);
      // fallback: store locally
      localStorage.setItem('localProfileDraft', JSON.stringify(payload));
      alert('Profile saved locally (backend unavailable)');
    }
  };

  return (
    <div className="profile-page">
      <NavBar />
      <div className="profile-card">
        <div className="profile-image" onClick={onImageClick} role="button" tabIndex={0}>
          {preview ? <img src={preview} alt="profile" /> : <div className="placeholder">Click to upload image</div>}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChange} />
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="row">
            <label>First name</label>
            <input name="firstName" value={form.firstName} onChange={handleInput} required />
            <label>Last name</label>
            <input name="lastName" value={form.lastName} onChange={handleInput} required />
          </div>

          <div className="row">
            <label>Email</label>
            <input name="email" value={form.email} onChange={handleInput} type="email" required />
          </div>

          <div className="row">
            <label>Interests</label>
            <input name="interests" value={form.interests} onChange={handleInput} placeholder="e.g. hiking, food" />
          </div>

          <div className="row">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleInput} />
          </div>

          <div className="row small">
            <div>
              <label>Latitude</label>
              <input name="latitude" value={form.latitude} readOnly />
            </div>
            <div>
              <label>Longitude</label>
              <input name="longitude" value={form.longitude} readOnly />
            </div>
            <div>
              <label>Created At</label>
              <input name="createdAt" value={form.createdAt} readOnly />
            </div>
          </div>

          <div className="row actions">
            <button type="button" onClick={handleUseLocation}>Capture Location</button>
            <button type="submit">Save Profile</button>
          </div>
        </form>
      </div>
    </div>
  );
}
