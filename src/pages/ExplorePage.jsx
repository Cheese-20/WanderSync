import React, { useState, useEffect } from 'react';
import '../styles/explore.css';

export default function ExplorePage() {
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ activityName: '', activityType: '', description: '', location: '' });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setUserRole((user.role || '').toLowerCase());
        setUserId(user.id);
      } catch (e) {
        console.error("Error parsing user from local storage", e);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.activityName || !formData.activityType || !formData.description || !formData.location) {
      setErrorMessage('Please fill in all mandatory fields.');
      return;
    }

    try {
      const payload = {
        activityName: formData.activityName,
        activityType: formData.activityType,
        description: formData.description,
        location: formData.location
      };

      const res = await fetch('/api/curatedspots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Failed to submit location');
      }

      setSuccessMessage('Submission Received! Your new spot is pending verification.');
      setFormData({ activityName: '', activityType: '', description: '', location: '' });
      setTimeout(() => {
        setShowModal(false);
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setErrorMessage('An error occurred while saving the record. Please try again.');
    }
  };

  return (
    <div className="explore-page-container">
      <div className="explore-header">
        <h1 className="explore-title">Explore Dashboard</h1>
        {userRole.includes('guide') && (
          <button 
            className="submit-spot-btn"
            onClick={() => setShowModal(true)}
          >
            + Submit New Spot
          </button>
        )}
      </div>

      <main className="page">
        <p>Discover beautiful locations around the world! (Feed implementation coming soon)</p>
        
        {/* Spot List will go here in the future */}
      </main>

      {showModal && (
        <div className="spot-form-modal-overlay">
          <div className="spot-form-modal">
            <h2>Recommend New Location</h2>
            
            {successMessage && <div className="success-message">{successMessage}</div>}
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="activityName">Activity Name *</label>
                <input 
                  type="text" 
                  id="activityName" 
                  name="activityName" 
                  value={formData.activityName}
                  onChange={handleInputChange}
                  placeholder="e.g., Secret Waterfall"
                />
              </div>

              <div className="form-group">
                <label htmlFor="activityType">Activity Type *</label>
                <input 
                  type="text" 
                  id="activityType" 
                  name="activityType" 
                  value={formData.activityType}
                  onChange={handleInputChange}
                  placeholder="e.g., Jazz, Adventure, Festival"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea 
                  id="description" 
                  name="description" 
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Describe what makes this spot special..."
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="location">Address / Location *</label>
                <input 
                  type="text" 
                  id="location" 
                  name="location" 
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., 123 Forest Trail, Portland"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="submit-btn">Submit for Review</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
