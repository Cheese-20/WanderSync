import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import logo from '../assets/images/logo.png';

// Custom Gradient Pin for Spots
const gradientIcon = L.divIcon({
  className: 'custom-gradient-pin',
  html: `<div class="pin-body"></div>`,
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [0, -38]
});

// Helper component to center map on user location if it changes
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [center, map]);
  return null;
}

export default function MapModal({ isOpen, onClose, spots }) {
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation([position.coords.latitude, position.coords.longitude]);
          },
          (error) => {
            console.error("Error getting location", error);
            // Default to Cape Town if blocked or unavailable, as dummy data is there
            setUserLocation([-33.9249, 18.4241]); 
          }
        );
      } else {
        setUserLocation([-33.9249, 18.4241]);
      }
    } else {
        setUserLocation(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="map-modal-overlay" onClick={onClose}>
      <div className="map-modal-content" onClick={e => e.stopPropagation()}>
        <button className="map-modal-close" onClick={onClose}>&times;</button>
        {userLocation ? (
          <MapContainer center={userLocation} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '12px' }}>
            <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, background: 'white', padding: '4px 8px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', fontSize: '12px', fontWeight: 'bold' }}>
              Spots loaded: {spots ? spots.length : 0}
            </div>
            <ChangeView center={userLocation} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {spots && spots.map(spot => {
              if (spot.latitude && spot.longitude) {
                return (
                  <Marker key={spot.spotID || spot.spotId} position={[spot.latitude, spot.longitude]} icon={gradientIcon}>
                    <Popup className="custom-spot-popup">
                      <div className="spot-popup-header">
                        <img src={logo} alt="WanderSync logo" className="spot-popup-logo" />
                      </div>
                      <h3 className="spot-popup-title">{spot.activityName}</h3>
                      
                      <div className="spot-popup-rating">
                        <span className="star-icon">★</span>
                        <span>{spot.averageRating ? spot.averageRating.toFixed(1) : 'New'}</span>
                        <span className="review-count">({spot.totalRatings || 0} reviews)</span>
                      </div>
                      
                      <p className="spot-popup-desc">{spot.description}</p>
                      
                      <div className="spot-popup-meta">
                        <div className="meta-item">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                          <span>{spot.location}</span>
                        </div>
                        <div className="meta-item added-by">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                          <span>Added by {spot.submittedByName || 'WanderSync Member'}</span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              }
              return null;
            })}
          </MapContainer>
        ) : (
          <div className="map-loading">
            <div className="explorer-spinner"></div>
            <p>Locating you...</p>
          </div>
        )}
      </div>
    </div>
  );
}
