import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import logo from '../assets/images/logo.png';

// ── Pin icons ──
const verifiedIcon = L.divIcon({
  className: 'custom-gradient-pin',
  html: `<div class="pin-body"></div>`,
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [0, -38]
});

const pendingIcon = L.divIcon({
  className: 'custom-gradient-pin pending-pin',
  html: `<div class="pin-body pending"></div>`,
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [0, -38]
});

const tempIcon = L.divIcon({
  className: 'custom-gradient-pin temp-pin',
  html: `<div class="pin-body temp"></div>`,
  iconSize: [34, 46],
  iconAnchor: [17, 46],
  popupAnchor: [0, -42]
});

// ── Helper: center map ──
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 13);
  }, [center, map]);
  return null;
}

// ── Helper: listen for map clicks ──
function MapClickHandler({ active, onMapClick }) {
  useMapEvents({
    click(e) {
      if (active) onMapClick(e.latlng);
    }
  });
  return null;
}

// ── Star rating component ──
function StarRating({ rating }) {
  const stars = [];
  const rounded = Math.round(rating * 2) / 2;
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rounded)) {
      stars.push(
        <svg key={i} className="popup-star filled" width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    } else if (i === Math.ceil(rounded) && rounded % 1 !== 0) {
      stars.push(
        <svg key={i} className="popup-star half" width="14" height="14" viewBox="0 0 24 24">
          <defs><linearGradient id={`half-${i}`}><stop offset="50%" stopColor="#f59e0b" /><stop offset="50%" stopColor="#e2e8f0" /></linearGradient></defs>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={`url(#half-${i})`} />
        </svg>
      );
    } else {
      stars.push(
        <svg key={i} className="popup-star empty" width="14" height="14" viewBox="0 0 24 24" fill="#e2e8f0" stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    }
  }
  return <div className="popup-stars-row">{stars}</div>;
}

const ACTIVITY_TYPES = ['Adventure', 'Cultural', 'Food', 'Nature', 'Wildlife', 'History', 'Leisure', 'Event', 'Other'];

export default function MapModal({ isOpen, onClose, spots, pendingSpots = [], userId, userRole, onSpotAdded }) {
  const [userLocation, setUserLocation] = useState(null);
  const [imgErrors, setImgErrors] = useState({});

  // ── Pin-drop state ──
  const [isPinDropMode, setIsPinDropMode] = useState(false);
  const [droppedPin, setDroppedPin] = useState(null); // { lat, lng }
  const [formData, setFormData] = useState({
    activityName: '', activityType: '', description: '', location: '', pictureURL: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState(null); // { type: 'success'|'error', msg }
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setImgErrors({});
      setIsPinDropMode(false);
      setDroppedPin(null);
      setSubmitFeedback(null);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
          () => setUserLocation([-33.9249, 18.4241])
        );
      } else {
        setUserLocation([-33.9249, 18.4241]);
      }
    } else {
      setUserLocation(null);
    }
  }, [isOpen]);

  // ── Reverse geocode ──
  const reverseGeocode = useCallback(async (lat, lng) => {
    setIsReverseGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const data = await res.json();
      if (data?.display_name) {
        // Extract a concise address
        const parts = [];
        const addr = data.address || {};
        if (addr.road) parts.push(addr.road);
        if (addr.suburb) parts.push(addr.suburb);
        if (addr.city || addr.town || addr.village) parts.push(addr.city || addr.town || addr.village);
        if (addr.state) parts.push(addr.state);
        const concise = parts.length > 0 ? parts.join(', ') : data.display_name.split(',').slice(0, 3).join(',');
        setFormData(prev => ({ ...prev, location: concise }));
      }
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
    } finally {
      setIsReverseGeocoding(false);
    }
  }, []);

  // ── Map click handler ──
  const handleMapClick = useCallback((latlng) => {
    setDroppedPin({ lat: latlng.lat, lng: latlng.lng });
    setFormData(prev => ({ ...prev, location: '' }));
    reverseGeocode(latlng.lat, latlng.lng);
  }, [reverseGeocode]);

  // ── Toggle pin-drop mode ──
  const enterPinDropMode = () => {
    setIsPinDropMode(true);
    setDroppedPin(null);
    setFormData({ activityName: '', activityType: '', description: '', location: '', pictureURL: '' });
    setSubmitFeedback(null);
  };

  const cancelPinDrop = () => {
    setIsPinDropMode(false);
    setDroppedPin(null);
    setSubmitFeedback(null);
  };

  // ── Image upload handler ──
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSubmitFeedback({ type: 'error', msg: 'Image size should be less than 5MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (upload) => {
        setFormData(prev => ({ ...prev, pictureURL: upload.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // ── Submit new spot ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!droppedPin || !formData.activityName.trim() || !formData.activityType || !formData.pictureURL) {
      setSubmitFeedback({ type: 'error', msg: 'Please fill in all required fields including a photo.' });
      return;
    }

    setIsSubmitting(true);
    setSubmitFeedback(null);
    try {
      const userStr = localStorage.getItem('user');
      let submittedByName = 'Anonymous';
      if (userStr) {
        const user = JSON.parse(userStr);
        submittedByName = `${user.firstName || user.FirstName || ''} ${user.lastName || user.LastName || ''}`.trim() || 'Anonymous';
      }

      await axios.post('/api/curatedspots', {
        activityName: formData.activityName.trim(),
        activityType: formData.activityType,
        description: formData.description.trim(),
        location: formData.location.trim(),
        pictureURL: formData.pictureURL.trim(),
        latitude: droppedPin.lat,
        longitude: droppedPin.lng,
        isVerified: 'pending',
        submittedByUserID: userId,
        submittedAt: new Date().toISOString(),
        submittedByName: submittedByName
      });

      setSubmitFeedback({ type: 'success', msg: 'Spot submitted! It will appear on the map once verified by local guides.' });
      setTimeout(() => {
        cancelPinDrop();
        if (onSpotAdded) onSpotAdded();
      }, 2500);
    } catch (err) {
      console.error('Failed to submit spot:', err);
      setSubmitFeedback({ type: 'error', msg: 'Failed to submit spot. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isGuide = (userRole || '').toLowerCase() === 'guide';

  return (
    <div className="map-modal-overlay" onClick={onClose}>
      <div className={`map-modal-content ${isPinDropMode ? 'pin-drop-active' : ''}`} onClick={e => e.stopPropagation()}>
        <button className="map-modal-close" onClick={onClose}>&times;</button>

        {userLocation ? (
          <MapContainer center={userLocation} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '12px' }}>

            {/* ── Map overlay controls ── */}
            <div className="map-overlay-controls">
              <div className="map-spot-counter">
                Spots loaded: {spots ? spots.length : 0}
                {isGuide && pendingSpots.length > 0 && (
                  <span className="pending-count-badge">{pendingSpots.length} pending</span>
                )}
              </div>
              {!isPinDropMode ? (
                <button className="map-add-spot-btn" onClick={enterPinDropMode}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add New Spot
                </button>
              ) : (
                <div className="pin-drop-banner">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>{droppedPin ? 'Pin placed! Fill in the details below.' : 'Tap the map to drop a pin'}</span>
                  <button className="pin-drop-cancel-btn" onClick={cancelPinDrop}>Cancel</button>
                </div>
              )}
            </div>

            <ChangeView center={userLocation} />
            <MapClickHandler active={isPinDropMode} onMapClick={handleMapClick} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* ── Verified spots ── */}
            {spots && spots.map(spot => {
              if (!spot.latitude || !spot.longitude) return null;
              const spotId = spot.spotID || spot.spotId;
              const hasImage = spot.pictureURL && !imgErrors[spotId];
              return (
                <Marker key={`v-${spotId}`} position={[spot.latitude, spot.longitude]} icon={verifiedIcon}>
                  <Popup className="custom-spot-popup" maxWidth={300} minWidth={280}>
                    <div className="popup-card">
                      <div className={`popup-card-visual ${hasImage ? '' : 'no-image'}`}>
                        {hasImage ? (
                          <img src={spot.pictureURL} alt={spot.activityName} className="popup-card-img"
                            onError={() => setImgErrors(prev => ({ ...prev, [spotId]: true }))} />
                        ) : (
                          <div className="popup-card-img-placeholder">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>
                            </svg>
                          </div>
                        )}
                        {spot.activityType && <span className="popup-card-type-badge">{spot.activityType}</span>}
                      </div>
                      <div className="popup-card-body">
                        <h3 className="popup-card-name">{spot.activityName}</h3>
                        <div className="popup-card-rating-row">
                          <StarRating rating={spot.averageRating || 0} />
                          <span className="popup-card-rating-value">{(spot.averageRating || 0).toFixed(1)}</span>
                        </div>
                        {spot.description && <p className="popup-card-desc">{spot.description}</p>}
                      </div>
                      <div className="popup-card-footer">
                        {spot.location && (
                          <div className="popup-footer-row popup-address-row">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <span>{spot.location}</span>
                          </div>
                        )}
                        <div className="popup-footer-row popup-submitter-row">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
                          </svg>
                          <span>Added by <strong>{spot.submittedByName || 'WanderSync Member'}</strong></span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* ── Pending spots (guides only) ── */}
            {isGuide && pendingSpots && pendingSpots.map(spot => {
              if (!spot.latitude || !spot.longitude) return null;
              const spotId = spot.spotID || spot.spotId;
              const hasImage = spot.pictureURL && !imgErrors['p-'+spotId];
              return (
                <Marker key={`p-${spotId}`} position={[spot.latitude, spot.longitude]} icon={pendingIcon}>
                  <Popup className="custom-spot-popup pending-popup" maxWidth={300} minWidth={280}>
                    <div className="popup-card">
                      <div className={`popup-card-visual ${hasImage ? '' : 'no-image'} pending-visual`}>
                        {hasImage ? (
                          <img src={spot.pictureURL} alt={spot.activityName} className="popup-card-img"
                            onError={() => setImgErrors(prev => ({ ...prev, ['p-'+spotId]: true }))} />
                        ) : (
                          <div className="popup-card-img-placeholder">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                            </svg>
                          </div>
                        )}
                        <span className="popup-card-type-badge pending-badge">Pending Verification</span>
                      </div>
                      <div className="popup-card-body">
                        <h3 className="popup-card-name">{spot.activityName}</h3>
                        {spot.activityType && (
                          <span className="popup-pending-type-label">{spot.activityType}</span>
                        )}
                        {spot.description && <p className="popup-card-desc">{spot.description}</p>}
                        <p className="popup-pending-note">This spot is awaiting approval from local guides. It will become visible to all users after verification.</p>
                      </div>
                      <div className="popup-card-footer">
                        {spot.location && (
                          <div className="popup-footer-row popup-address-row">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <span>{spot.location}</span>
                          </div>
                        )}
                        <div className="popup-footer-row popup-submitter-row">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
                          </svg>
                          <span>Submitted by <strong>{spot.submitterName || 'WanderSync Member'}</strong></span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* ── Temporary dropped pin ── */}
            {droppedPin && (
              <Marker position={[droppedPin.lat, droppedPin.lng]} icon={tempIcon} />
            )}
          </MapContainer>
        ) : (
          <div className="map-loading">
            <div className="explorer-spinner"></div>
            <p>Locating you...</p>
          </div>
        )}

        {/* ── Slide-up form panel ── */}
        {isPinDropMode && droppedPin && (
          <div className="map-slideup-form">
            <div className="slideup-handle"></div>
            <h3 className="slideup-title">Add a New Spot</h3>
            <p className="slideup-coords">
              📍 {droppedPin.lat.toFixed(5)}, {droppedPin.lng.toFixed(5)}
            </p>

            {submitFeedback && (
              <div className={`slideup-feedback ${submitFeedback.type}`}>
                {submitFeedback.type === 'success' ? '✅' : '❌'} {submitFeedback.msg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="slideup-form-body">
              <div className="slideup-field">
                <label>Spot Name *</label>
                <input
                  type="text" placeholder="e.g. Sardinia Bay Beach"
                  value={formData.activityName}
                  onChange={e => setFormData(p => ({ ...p, activityName: e.target.value }))}
                  required
                />
              </div>
              <div className="slideup-field">
                <label>Activity Type *</label>
                <select
                  value={formData.activityType}
                  onChange={e => setFormData(p => ({ ...p, activityType: e.target.value }))}
                  required
                >
                  <option value="">Select type...</option>
                  {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="slideup-field">
                <label>Address {isReverseGeocoding && <span className="geocoding-spinner">detecting...</span>}</label>
                <input
                  type="text" placeholder="Address will be auto-detected"
                  value={formData.location}
                  onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                />
              </div>
              <div className="slideup-field">
                <label>Description</label>
                <textarea
                  placeholder="Tell us about this spot..."
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="slideup-field">
                <label>Photo *</label>
                <div 
                  className={`cool-image-upload-zone ${formData.pictureURL ? 'has-image' : ''}`}
                  onClick={() => document.getElementById('mapSpotImageUpload').click()}
                >
                  <input 
                    type="file" 
                    id="mapSpotImageUpload"
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    style={{ display: 'none' }}
                  />
                  {formData.pictureURL ? (
                    <img src={formData.pictureURL} alt="Spot preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <svg className="upload-icon-large" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      <span>Click to upload photo</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="slideup-actions">
                <button type="button" className="slideup-cancel-btn" onClick={cancelPinDrop}>Cancel</button>
                <button
                  type="submit"
                  className="slideup-submit-btn"
                  disabled={isSubmitting || !formData.activityName.trim() || !formData.activityType || !formData.pictureURL}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Spot'}
                </button>
              </div>
            </form>
          </div>
        )}
        {/* Success Modal */}
        {submitFeedback && submitFeedback.type === 'success' && (
          <div className="modal-overlay" style={{ zIndex: 9999 }}>
            <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center', padding: '30px' }}>
              <img src={logo} alt="WanderSync" style={{ width: '80px', height: 'auto', margin: '0 auto 20px auto', display: 'block' }} />
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#e6f4ea', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#19b575" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h2 style={{ margin: '0 0 10px 0', fontSize: '1.5rem', color: '#1a1a1a' }}>Spot Submitted!</h2>
              <p style={{ margin: '0 0 0 0', color: '#666', fontSize: '1rem', lineHeight: '1.5' }}>
                {submitFeedback.msg}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
