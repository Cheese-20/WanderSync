import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../components/NavBar';
import Layout from '../components/Layout';
import '../styles/manage-itinerary.css'; // We will create this

export default function ManageItinerary() {
  const { touristId } = useParams();
  const navigate = useNavigate();
  const [tourist, setTourist] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [currentTourId, setCurrentTourId] = useState(null);
  const [activeTab, setActiveTab] = useState('Add Activity');
  const [isSaving, setIsSaving] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const loggedInUserId = user.id || user.userID;

  useEffect(() => {
    if (!loggedInUserId || !touristId) return;

    // Fetch tourist details
    axios.get(`http://localhost:5200/api/local-guide/${loggedInUserId}/assigned-tourists`)
      .then(res => {
        const t = res.data.find(u => String(u.userId) === String(touristId));
        if (t) setTourist(t);
      })
      .catch(err => console.error(err));

    // Fetch itinerary
    axios.get(`http://localhost:5200/api/local-guide/${loggedInUserId}/itinerary/${touristId}`)
      .then(res => {
        setCurrentTourId(res.data.tourId);
        let parsedTimeline = [];
        if (res.data.timeline) {
          try { parsedTimeline = JSON.parse(res.data.timeline); } catch (e) {}
        }
        setTimeline(Array.isArray(parsedTimeline) ? parsedTimeline : []);
      })
      .catch(err => {
        console.error(err);
        alert('Failed to load itinerary.');
      });
  }, [loggedInUserId, touristId]);

  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const parseDurationToMinutes = (durStr) => {
    if (!durStr) return 0;
    let mins = 0;
    const hMatch = durStr.match(/(\d+)\s*h/i);
    const mMatch = durStr.match(/(\d+)\s*m/i);
    const numOnly = durStr.match(/^(\d+)$/);
    if (hMatch) mins += parseInt(hMatch[1]) * 60;
    if (mMatch) mins += parseInt(mMatch[1]);
    if (numOnly) mins += parseInt(numOnly[1]);
    return mins;
  };

  const handleSaveItinerary = async () => {
    // Validation: Missing or invalid fields
    const missingFields = timeline.find(t => !t.name || !t.time || !t.duration);
    if (missingFields) {
      alert('Validation Error: All activities must have a title, time, and duration.');
      return;
    }

    const invalidDuration = timeline.find(t => parseDurationToMinutes(t.duration) === 0);
    if (invalidDuration) {
      alert(`Validation Error: Invalid duration format for "${invalidDuration.name}". Use formats like '1h', '30m', or '60'.`);
      return;
    }

    // Validation: Overlapping times
    const sortedTimeline = [...timeline].sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
    for (let i = 0; i < sortedTimeline.length - 1; i++) {
      const current = sortedTimeline[i];
      const next = sortedTimeline[i + 1];
      const currentEnd = parseTimeToMinutes(current.time) + parseDurationToMinutes(current.duration);
      const nextStart = parseTimeToMinutes(next.time);
      if (currentEnd > nextStart) {
        alert(`Validation Error: Time conflict! "${current.name}" overlaps with "${next.name}".`);
        return;
      }
    }

    setIsSaving(true);
    setIsOfflineMode(false);
    try {
      if (!navigator.onLine) {
        throw new Error('Network Error');
      }
      await axios.put(`http://localhost:5200/api/local-guide/itinerary/${currentTourId}`, {
        timelineJson: JSON.stringify(timeline)
      });
      alert('Itinerary saved and notification sent!');
    } catch (e) {
      console.error(e);
      if (e.message === 'Network Error' || e.code === 'ERR_NETWORK') {
        localStorage.setItem(`pending_itinerary_${currentTourId}`, JSON.stringify(timeline));
        setIsOfflineMode(true);
        alert('Network connectivity lost. Itinerary saved locally.');
      } else {
        alert('Failed to save itinerary.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPreSaved = (title) => {
    setTimeline([...timeline, { id: Date.now(), type: 'activity', name: title, time: '', duration: '', notes: '' }]);
  };

  const handleDragStart = (e, title) => {
    e.dataTransfer.setData('text/plain', title);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const title = e.dataTransfer.getData('text/plain');
    if (title) {
      handleAddPreSaved(title);
    }
  };

  const updateItem = (id, field, value) => {
    setTimeline(timeline.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id) => {
    setTimeline(timeline.filter(t => t.id !== id));
  };

  const preSavedActivities = [
    { title: 'Pre-saved activity', color: '#c4d7cd' },
    { title: 'Booked Hosted Activities', color: '#fff' },
    { title: 'Pre-saved Families & Parks', color: '#fff' },
    { title: 'Pre-saved Activities', color: '#fff' },
    { title: 'Booked Info Activity', color: '#fff' }
  ];

  return (
    <Layout>
      <div className="manage-itinerary-page">
        {isOfflineMode && (
          <div className="offline-banner">
            ⚠️ Pending Sync / Offline Mode - Changes cached locally and will sync when reconnected.
          </div>
        )}
        
        {isSaving && (
          <div className="global-loading-overlay">
             <div className="global-loading-popup">
               <div className="global-loading-text">Saving Itinerary...</div>
             </div>
          </div>
        )}
        
        {/* Top Page Tabs */}
        <div className="page-tabs-container">
          <div className="page-tabs">
            <button className="ptab">Overview</button>
            <button className="ptab">Map View</button>
            <button className="ptab active">Itinerary Management</button>
          </div>
        </div>

        <div className="itinerary-header">
          <h2>Manage Client: {tourist ? `${tourist.firstName} ${tourist.lastName}` : '...'} - Custom Trip</h2>
        </div>

        <div className="sub-tabs">
          <button className={`stab ${activeTab === 'Overview' ? 'active' : ''}`} onClick={() => setActiveTab('Overview')}>Overview</button>
          <button className={`stab ${activeTab === 'Map View' ? 'active' : ''}`} onClick={() => setActiveTab('Map View')}>Map View</button>
          <button className={`stab ${activeTab === 'Add Activity' ? 'active' : ''}`} onClick={() => setActiveTab('Add Activity')}>Add Activity</button>
        </div>

        <div className="itinerary-content">
          {/* Left Sidebar */}
          <div className="sidebar">
            <p className="drag-hint">Drag and drop or click on pre-saved writing extra swathes.</p>
            <div className="presaved-list">
              {preSavedActivities.map((act, idx) => (
                <div 
                  key={idx} 
                  className="presaved-item" 
                  style={{ backgroundColor: act.color }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, act.title)}
                  onClick={() => handleAddPreSaved(act.title)}
                >
                  <div className="ps-title">{act.title}</div>
                  <div className="ps-sub">Drag booked</div>
                </div>
              ))}
            </div>
            
            <div className="finalize-box">
              <button className="btn-finalize" onClick={handleSaveItinerary}>Finalize Itinerary</button>
              <p className="notify-hint">A notification to the Tourist will be sent.</p>
            </div>
          </div>

          {/* Right Area: Timeline */}
          <div className="timeline-area" onDragOver={handleDragOver} onDrop={handleDrop}>
            <div className="timeline-header">
              <h3>Itinerary Management</h3>
              <select className="activity-dropdown"><option>Activity</option><option>Transit</option></select>
            </div>
            <div className="day-header">Day 1</div>

            <div className="timeline-container">
              {timeline.length === 0 ? (
                <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>Drag or click activities from the left to start building the itinerary.</p>
              ) : (
                timeline.map((item, index) => (
                  <div className="timeline-node" key={item.id}>
                    <div className="timeline-line"></div>
                    <div className="timeline-dot"></div>
                    
                    <div className="timeline-card">
                      <div className="tcard-header">
                        <input 
                          type="text" 
                          className="tcard-title-input" 
                          value={item.name} 
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                        />
                        <button className="tcard-options" onClick={() => removeItem(item.id)}>...</button>
                      </div>
                      <div className="tcard-body">
                        <div className="tcard-row">
                          <label>Time</label>
                          <input type="time" value={item.time} onChange={(e) => updateItem(item.id, 'time', e.target.value)} />
                        </div>
                        <div className="tcard-row">
                          <label>Duration</label>
                          <input type="text" placeholder="00 min" value={item.duration} onChange={(e) => updateItem(item.id, 'duration', e.target.value)} />
                        </div>
                        <div className="tcard-row">
                          <label>Notes</label>
                          <textarea rows="2" value={item.notes || ''} onChange={(e) => updateItem(item.id, 'notes', e.target.value)}></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
