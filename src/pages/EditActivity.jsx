import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
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
      <NavBar />
      <header className="guide-hero">
        <h1>Edit Activity</h1>
      </header>
      
      <section style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        {message && <div style={{ padding: '1rem', background: '#d4edda', color: '#155724', marginBottom: '1rem' }}>{message}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label>Title</label><br />
            <input type="text" name="title" value={formData.title} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }} />
          </div>
          <div>
            <label>Type</label><br />
            <input type="text" name="type" value={formData.type} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }} />
          </div>
          <div>
            <label>Description</label><br />
            <textarea name="description" value={formData.description} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', minHeight: '100px' }}></textarea>
          </div>
          <div>
            <label>Date</label><br />
            <input type="date" name="date" value={formData.date} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }} />
          </div>
          <div>
            <label>Max People</label><br />
            <input type="number" name="maxPeople" value={formData.maxPeople} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }} />
          </div>
          <button type="submit" style={{ padding: '0.75rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}>
            Save Changes
          </button>
        </form>
      </section>
    </div>
  );
}
