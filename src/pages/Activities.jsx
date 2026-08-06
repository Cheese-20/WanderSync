import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import '../styles/guide.css';

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    let userId = 1; 
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        userId = user.userId || user.id || 1;
      } catch (e) {}
    }

    fetch(`http://localhost:5200/api/tours/guide/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setActivities(data);
        }
      })
      .catch(err => console.error('Error fetching activities:', err));
  }, []);

  const handleEdit = (tourId) => {
    navigate(`/edit-activity/${tourId}`);
  };

  const handleDelete = (tourId) => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      fetch(`http://localhost:5200/api/tours/${tourId}`, {
        method: 'DELETE',
      })
      .then(res => {
        if (res.ok) {
          window.alert("Deletion Successful");
          setActivities(activities.filter(a => a.tourId !== tourId));
        } else {
          window.alert("Failed to delete activity.");
        }
      })
      .catch(err => {
        console.error('Error deleting activity:', err);
        window.alert("An error occurred while deleting the activity.");
      });
    }
  };

  return (
    <div className="guide-page">

      <header className="guide-hero">
        <h1>Your Activities</h1>
        <p>Manage the tours you offer</p>
      </header>
      
      <section className="activities-list-container">
        {activities.length === 0 ? (
          <p>No activities found.</p>
        ) : (
          activities.map(activity => (
            <div key={activity.tourId} className="panel activity-item">
              <div className="activity-details">
                <h3>{activity.title}</h3>
                <p>{activity.type} - {new Date(activity.date).toLocaleDateString()}</p>
                <p>Max People: {activity.maxPeople}</p>
              </div>
              <div className="activity-actions">
                <button 
                  onClick={() => handleEdit(activity.tourId)}
                  className="btn-edit">
                  Edit Activity
                </button>
                <button 
                  onClick={() => handleDelete(activity.tourId)}
                  className="btn-delete">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
