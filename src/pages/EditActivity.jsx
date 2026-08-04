import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import '../styles/guide.css';

export default function EditActivity() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    description: '',
    date: '',
    maxPeople: 0
  });
  const [message, setMessage] = useState('');
  const [originalTour, setOriginalTour] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5200/api/tours/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(data => {
        setOriginalTour(data);
        setFormData({
          title: data.title || '',
          type: data.type || '',
          description: data.description || '',
          date: data.date ? data.date.split('T')[0] : '',
          maxPeople: data.maxPeople || 0
        });
      })
      .catch(err => console.error('Error fetching activity:', err));
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!originalTour) return;

    const updatedTour = {
      ...originalTour,
      ...formData,
      maxPeople: parseInt(formData.maxPeople, 10) || 0
    };

    fetch(`http://localhost:5200/api/tours/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedTour)
    })
      .then(res => {
        if (res.ok) {
          setMessage('Activity updated successfully!');
          setTimeout(() => navigate('/activities'), 2000);
        } else {
          setMessage('Failed to update activity.');
        }
      })
      .catch(err => {
        console.error(err);
        setMessage('Error updating activity.');
      });
  };

  return (
    <div className="guide-page">

      <header className="guide-hero">
        <h1>Edit Activity</h1>
      </header>
      
      <section className="edit-activity-container">
        {message && <div className="alert-success">{message}</div>}
        <form onSubmit={handleSubmit} className="edit-activity-form">
          <div>
            <label>Title</label><br />
            <input type="text" name="title" value={formData.title} onChange={handleChange} required className="form-input" />
          </div>
          <div>
            <label>Type</label><br />
            <input type="text" name="type" value={formData.type} onChange={handleChange} className="form-input" />
          </div>
          <div>
            <label>Description</label><br />
            <textarea name="description" value={formData.description} onChange={handleChange} className="form-input"></textarea>
          </div>
          <div>
            <label>Date</label><br />
            <input type="date" name="date" value={formData.date} onChange={handleChange} required className="form-input" />
          </div>
          <div>
            <label>Max People</label><br />
            <input type="number" name="maxPeople" value={formData.maxPeople} onChange={handleChange} required className="form-input" />
          </div>
          <button type="submit" className="btn-submit">
            Save Changes
          </button>
        </form>
      </section>
    </div>
  );
}
