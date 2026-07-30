import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
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

  return (
    <div className="guide-page">
      <NavBar />
      <header className="guide-hero">
        <h1>Your Activities</h1>
        <p>Manage the tours you offer</p>
      </header>
      
      <section className="activities-list" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        {activities.length === 0 ? (
          <p>No activities found.</p>
        ) : (
          activities.map(activity => (
            <div key={activity.tourId} className="panel" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3>{activity.title}</h3>
                <p>{activity.type} - {new Date(activity.date).toLocaleDateString()}</p>
                <p>Max People: {activity.maxPeople}</p>
              </div>
              <button 
                onClick={() => handleEdit(activity.tourId)}
                style={{ padding: '0.5rem 1rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Edit Activity
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
