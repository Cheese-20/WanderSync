import React, { useState, useRef } from 'react';
import './CreateExperienceModal.css';

const TOUR_TYPES = [
  'Adventure',
  'Cultural',
  'Food & Drink',
  'Nature',
  'Historical',
  'Nightlife',
  'Photography',
  'Wellness',
  'Other'
];

export default function CreateExperienceModal({ guideId, onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    type: '',
    description: '',
    date: '',
    maxPeople: '',
    price: '',
    location: '',
    pictureURL: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const today = new Date().toISOString().slice(0, 10);

  const handleInput = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // Cover photos are stored as base64 data URLs, so a raw phone photo would be
  // several megabytes. Downscale and re-encode before putting it in state.
  const downscaleImage = (file, maxDimension = 1200, quality = 0.8) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Could not read the selected file.'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('That file could not be read as an image.'));
        img.onload = () => {
          const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });

  const onFileChange = async e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }

    try {
      const resized = await downscaleImage(file);
      setForm(f => ({ ...f, pictureURL: resized }));
      setError('');
    } catch (err) {
      console.error('Error processing image', err);
      setError(err.message || 'Could not process that image. Try a different file.');
    }
  };

  const validate = () => {
    if (!form.title.trim()) return 'Title is required.';
    if (form.title.trim().length > 100) return 'Title must be 100 characters or fewer.';
    if (!form.type) return 'Please choose an activity type.';
    if (!form.description.trim()) return 'Description is required.';
    if (!form.date) return 'Date is required.';
    if (form.date < today) return 'Date cannot be in the past.';
    const people = parseInt(form.maxPeople, 10);
    if (!form.maxPeople || Number.isNaN(people) || people < 1) return 'Max people must be at least 1.';
    const price = parseFloat(form.price);
    if (form.price === '' || Number.isNaN(price) || price < 0) return 'Please enter a valid price (0 or more).';
    return '';
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!guideId) {
      setError('Unable to add activity: you are not logged in as a guide.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/tours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guideID: guideId,
          title: form.title.trim(),
          type: form.type,
          description: form.description.trim(),
          date: form.date,
          maxPeople: parseInt(form.maxPeople, 10),
          price: parseFloat(form.price),
          location: form.location.trim() || null,
          pictureURL: form.pictureURL || null
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.message || 'Failed to add activity. Please try again.');
        return;
      }

      onCreated?.(data);
      onClose?.();
    } catch (err) {
      console.error('Error adding activity', err);
      setError('Failed to add activity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ce-modal-overlay" onClick={onClose}>
      <div
        className="ce-modal-container"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ce-modal-title"
      >
        <div className="ce-modal-header">
          <h2 id="ce-modal-title" className="ce-modal-title">Create Experience</h2>
          <button
            type="button"
            className="ce-modal-close"
            onClick={onClose}
            aria-label="Close create experience form"
          >
            &times;
          </button>
        </div>
        <p className="ce-modal-subtitle">
          Add a new activity that travellers can book with you.
        </p>

        <form className="ce-modal-form" onSubmit={handleSubmit}>
          <div className="ce-photo-section">
            <span className="ce-field-label">Cover Photo</span>
            <div
              className="ce-photo-box"
              onClick={() => fileRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileRef.current?.click();
                }
              }}
              aria-label="Upload a cover photo for this experience"
            >
              {form.pictureURL ? (
                <img src={form.pictureURL} alt="Experience cover preview" className="ce-photo-img" />
              ) : (
                <div className="ce-photo-placeholder">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8a8a8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  <span>Click to upload</span>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="ce-hidden-file-input"
              onChange={onFileChange}
            />
          </div>

          <div className="ce-field-group">
            <label htmlFor="ce-title" className="ce-field-label">Title *</label>
            <input
              id="ce-title"
              name="title"
              value={form.title}
              onChange={handleInput}
              placeholder="e.g. Sunrise Photo Walk"
              maxLength="100"
            />
          </div>

          <div className="ce-field-group">
            <label htmlFor="ce-type" className="ce-field-label">Type *</label>
            <select id="ce-type" name="type" value={form.type} onChange={handleInput}>
              <option value="">Select a type</option>
              {TOUR_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="ce-field-group">
            <label htmlFor="ce-description" className="ce-field-label">Description *</label>
            <textarea
              id="ce-description"
              name="description"
              value={form.description}
              onChange={handleInput}
              placeholder="What will travellers do on this experience?"
              rows="3"
            />
          </div>

          <div className="ce-field-row">
            <div className="ce-field-group">
              <label htmlFor="ce-date" className="ce-field-label">Date *</label>
              <input
                id="ce-date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleInput}
                min={today}
              />
            </div>
            <div className="ce-field-group">
              <label htmlFor="ce-maxPeople" className="ce-field-label">Max People *</label>
              <input
                id="ce-maxPeople"
                name="maxPeople"
                type="number"
                min="1"
                value={form.maxPeople}
                onChange={handleInput}
                placeholder="e.g. 10"
              />
            </div>
          </div>

          <div className="ce-field-row">
            <div className="ce-field-group">
              <label htmlFor="ce-price" className="ce-field-label">Price (R) *</label>
              <input
                id="ce-price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleInput}
                placeholder="e.g. 250"
              />
            </div>
            <div className="ce-field-group">
              <label htmlFor="ce-location" className="ce-field-label">Location</label>
              <input
                id="ce-location"
                name="location"
                value={form.location}
                onChange={handleInput}
                placeholder="e.g. Cape Town"
              />
            </div>
          </div>

          {error && <p className="ce-error-text" role="alert">{error}</p>}

          <div className="ce-modal-actions">
            <button type="button" className="ce-btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="ce-btn-submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
