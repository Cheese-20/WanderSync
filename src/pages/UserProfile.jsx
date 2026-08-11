import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/userprofile.css';

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPublicProfile();
  }, [userId]);

  const fetchPublicProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/profile/public/${userId}`);
      setProfile(res.data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      if (err.response?.status === 404) {
        setError('User profile not found.');
      } else {
        setError('Unable to load profile. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleMessage = () => {
    navigate('/messages');
  };

  if (loading) {
    return (
      <div className="user-profile-page">
        <div className="user-profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-profile-page">
        <div className="user-profile-error">
          <p>{error}</p>
          <button className="btn-back" onClick={handleBack}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile-page">
      <section className="user-profile-container">
        <button className="btn-back" onClick={handleBack}>
          &larr; Back
        </button>

        <div className="user-profile-header">
          <div className="user-profile-avatar">
            {profile.profilePictureLink ? (
              <img src={profile.profilePictureLink} alt={`${profile.firstName} ${profile.lastName}`} />
            ) : (
              <div className="user-profile-avatar-placeholder">
                {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
              </div>
            )}
          </div>
          <div className="user-profile-info">
            <h1>{profile.firstName} {profile.lastName}</h1>
            {profile.job && <p className="user-profile-job">{profile.job}</p>}
            {profile.location && (
              <p className="user-profile-location">
                <span className="location-icon">&#x1F4CD;</span> {profile.location}
              </p>
            )}
            {profile.age > 0 && <p className="user-profile-age">{profile.age} years old</p>}
          </div>
          <div className="user-profile-actions">
            <button className="btn-message" onClick={handleMessage}>
              Message
            </button>
          </div>
        </div>

        {profile.description && (
          <div className="user-profile-section">
            <h2>About</h2>
            <p>{profile.description}</p>
          </div>
        )}

        {profile.interests && (
          <div className="user-profile-section">
            <h2>Interests</h2>
            <div className="user-profile-interests">
              {profile.interests.split(',').map((interest, idx) => (
                <span key={idx} className="interest-tag">{interest.trim()}</span>
              ))}
            </div>
          </div>
        )}

        {profile.createdAt && (
          <div className="user-profile-section">
            <h2>Member Since</h2>
            <p>{new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
        )}
      </section>
    </div>
  );
}
