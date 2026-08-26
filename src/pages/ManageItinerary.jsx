import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../components/NavBar';
import '../styles/manage-itinerary.css';

const ACTIVITY_TYPES = [
  { label: '🏛️ Sightseeing', value: 'Sightseeing' },
  { label: '🍽️ Dining', value: 'Dining' },
  { label: '🚗 Transit', value: 'Transit' },
  { label: '🏕️ Outdoor', value: 'Outdoor' },
  { label: '🛍️ Shopping', value: 'Shopping' },
  { label: '🎭 Entertainment', value: 'Entertainment' },
  { label: '🏨 Accommodation', value: 'Accommodation' },
  { label: '📸 Photo Stop', value: 'Photo Stop' },
];

const TYPE_COLORS = {
  'Sightseeing':   '#a8d8ea',
  'Dining':        '#f9c784',
  'Transit':       '#b5b5b5',
  'Outdoor':       '#a6d8b6',
  'Shopping':      '#f2a7bb',
  'Entertainment': '#c4b5f4',
  'Accommodation': '#ffd6a5',
  'Photo Stop':    '#caffbf',
};

const DEFAULT_FORM = { name: '', type: 'Sightseeing', location: '', time: '', duration: '', notes: '' };

export default function ManageItinerary() {
  const { touristId } = useParams();
  const navigate = useNavigate();
  const [tourist, setTourist] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [currentTourId, setCurrentTourId] = useState(null);
  const [activeTab, setActiveTab] = useState('itinerary');
  const [isSaving, setIsSaving] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loadError, setLoadError] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const loggedInUserId = user.id || user.userID;

  useEffect(() => {
    if (!loggedInUserId || !touristId) return;
    axios.get(`http://localhost:5200/api/local-guide/${loggedInUserId}/assigned-tourists`)
      .then(res => {
        const t = res.data.find(u => String(u.userId) === String(touristId));
        if (t) setTourist(t);
      })
      .catch(() => {});
    axios.get(`http://localhost:5200/api/local-guide/${loggedInUserId}/itinerary/${touristId}`)
      .then(res => {
        setCurrentTourId(res.data.tourId);
        let parsed = [];
        if (res.data.timeline) {
          try { parsed = JSON.parse(res.data.timeline); } catch (e) {}
        }
        setTimeline(Array.isArray(parsed) ? parsed : []);
      })
      .catch(err => setLoadError(err?.response?.data?.message || 'Failed to load itinerary.'));
  }, [loggedInUserId, touristId]);

  const parseTimeToMinutes = (t) => {
    if (!t) return 0;
    const [h, m] = t.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const parseDurationToMinutes = (d) => {
    if (!d) return 0;
    let mins = 0;
    const h = d.match(/(\d+)\s*h/i);
    const m = d.match(/(\d+)\s*m/i);
    const n = d.match(/^(\d+)$/);
    if (h) mins += parseInt(h[1]) * 60;
    if (m) mins += parseInt(m[1]);
    if (n) mins += parseInt(n[1]);
    return mins;
  };

  const formatEndTime = (time, duration) => {
    const start = parseTimeToMinutes(time);
    const dur = parseDurationToMinutes(duration);
    if (!dur) return null;
    const end = start + dur;
    const h = Math.floor(end / 60) % 24;
    const m = end % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const handleAddActivity = () => {
    if (!form.name.trim()) { alert('Please enter an activity name.'); return; }
    if (!form.time) { alert('Please set a start time.'); return; }
    if (!form.duration.trim()) { alert('Please enter a duration (e.g. 1h or 30m).'); return; }
    if (parseDurationToMinutes(form.duration) === 0) { alert('Invalid duration. Use formats like "1h", "30m", or "90".'); return; }
    const newStart = parseTimeToMinutes(form.time);
    const newEnd = newStart + parseDurationToMinutes(form.duration);
    const conflict = timeline.find(item => {
      const s = parseTimeToMinutes(item.time);
      const e = s + parseDurationToMinutes(item.duration);
      return newStart < e && newEnd > s;
    });
    if (conflict) { alert(`Time conflict with "${conflict.name}". Choose a different time.`); return; }
    const sorted = [...timeline, { id: Date.now(), ...form }].sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
    setTimeline(sorted);
    setForm(DEFAULT_FORM);
  };

  const removeItem = (id) => setTimeline(prev => prev.filter(t => t.id !== id));
  const updateItem = (id, field, value) => setTimeline(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));

  const handleSave = async () => {
    if (!currentTourId) { alert('Itinerary not loaded yet. Please wait.'); return; }
    setIsSaving(true);
    try {
      await axios.put(`http://localhost:5200/api/local-guide/itinerary/${currentTourId}`, {
        timelineJson: JSON.stringify(timeline)
      });
      alert('Itinerary saved! The tourist has been notified.');
    } catch (e) {
      if (!navigator.onLine || e.code === 'ERR_NETWORK') {
        localStorage.setItem(`pending_itinerary_${currentTourId}`, JSON.stringify(timeline));
        setIsOfflineMode(true);
        alert('No connection. Changes saved locally and will sync when back online.');
      } else {
        alert('Failed to save itinerary. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const totalDuration = timeline.reduce((acc, item) => acc + parseDurationToMinutes(item.duration), 0);
  const totalHours = Math.floor(totalDuration / 60);
  const totalMins = totalDuration % 60;

  return (
    <>
      <NavBar />
      <div className="mi-page">
        {isOfflineMode && (
          <div className="mi-offline-banner">
            📶 Offline Mode — Changes saved locally and will sync when you reconnect.
          </div>
        )}

        <div className="mi-header">
          <button className="mi-back-btn" onClick={() => navigate('/home')}>← Back</button>
          <div className="mi-header-info">
            <div className="mi-avatar">{tourist?.firstName?.[0]?.toUpperCase() || '?'}</div>
            <div>
              <h1 className="mi-title">{tourist ? `${tourist.firstName} ${tourist.lastName}` : 'Loading...'}</h1>
              <p className="mi-subtitle">{tourist?.email || ''} · Custom Trip Itinerary</p>
            </div>
          </div>
          <button className="mi-save-btn" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : '💾 Save & Notify'}
          </button>
        </div>

        <div className="mi-stats-bar">
          <div className="mi-stat"><span className="mi-stat-value">{timeline.length}</span><span className="mi-stat-label">Activities</span></div>
          <div className="mi-stat-divider" />
          <div className="mi-stat">
            <span className="mi-stat-value">{totalHours > 0 ? `${totalHours}h ` : ''}{totalMins > 0 ? `${totalMins}m` : totalHours === 0 ? '—' : ''}</span>
            <span className="mi-stat-label">Total Duration</span>
          </div>
          <div className="mi-stat-divider" />
          <div className="mi-stat"><span className="mi-stat-value">{timeline.length > 0 ? timeline[0].time || '—' : '—'}</span><span className="mi-stat-label">Start Time</span></div>
          <div className="mi-stat-divider" />
          <div className="mi-stat">
            <span className="mi-stat-value">
              {timeline.length > 0 ? formatEndTime(timeline[timeline.length - 1].time, timeline[timeline.length - 1].duration) || '—' : '—'}
            </span>
            <span className="mi-stat-label">End Time</span>
          </div>
        </div>

        <div className="mi-tabs">
          {[{ key: 'overview', label: '📋 Overview' }, { key: 'itinerary', label: '🗓️ Itinerary Builder' }, { key: 'locations', label: '📍 Locations' }].map(tab => (
            <button key={tab.key} className={`mi-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>{tab.label}</button>
          ))}
        </div>

        <div className="mi-content">

          {activeTab === 'overview' && (
            <div className="mi-overview">
              {timeline.length === 0 ? (
                <div className="mi-empty-state">
                  <div className="mi-empty-icon">🗓️</div>
                  <h3>No activities yet</h3>
                  <p>Switch to the <strong>Itinerary Builder</strong> tab to add activities for this tourist.</p>
                  <button className="mi-cta-btn" onClick={() => setActiveTab('itinerary')}>Go to Builder →</button>
                </div>
              ) : (
                <>
                  <h3 className="mi-section-title">📋 Full Itinerary Summary</h3>
                  <div className="mi-overview-list">
                    {timeline.map((item, idx) => {
                      const color = TYPE_COLORS[item.type] || '#e0e0e0';
                      const endTime = formatEndTime(item.time, item.duration);
                      return (
                        <div className="mi-overview-row" key={item.id} style={{ borderLeft: `4px solid ${color}` }}>
                          <div className="mi-ov-index">{idx + 1}</div>
                          <div className="mi-ov-body">
                            <div className="mi-ov-name">{item.name}</div>
                            <div className="mi-ov-meta">
                              <span className="mi-ov-badge" style={{ backgroundColor: color }}>{item.type}</span>
                              {item.location && <span>📍 {item.location}</span>}
                              {item.time && <span>⏰ {item.time}{endTime ? ` – ${endTime}` : ''}</span>}
                              {item.duration && <span>⏱ {item.duration}</span>}
                            </div>
                            {item.notes && <p className="mi-ov-notes">💬 {item.notes}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'itinerary' && (
            <div className="mi-builder">
              <div className="mi-add-form">
                <h3 className="mi-section-title">➕ Add New Activity</h3>
                {loadError && <div className="mi-error-banner">⚠️ {loadError}</div>}
                <div className="mi-form-grid">
                  <div className="mi-form-field">
                    <label>Activity Name *</label>
                    <input type="text" placeholder="e.g. Visit Table Mountain" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="mi-form-field">
                    <label>Type</label>
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                      {ACTIVITY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="mi-form-field">
                    <label>Location</label>
                    <input type="text" placeholder="e.g. Cape Town, WC" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                  </div>
                  <div className="mi-form-field">
                    <label>Start Time *</label>
                    <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
                  </div>
                  <div className="mi-form-field">
                    <label>Duration *</label>
                    <input type="text" placeholder="e.g. 1h, 30m, 90" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
                  </div>
                  <div className="mi-form-field mi-form-full">
                    <label>Notes</label>
                    <textarea rows="2" placeholder="Optional: any details or tips for the tourist..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                  </div>
                </div>
                <button className="mi-add-btn" onClick={handleAddActivity}>+ Add to Timeline</button>
              </div>

              <div className="mi-timeline">
                <h3 className="mi-section-title">🗓️ Day 1 — Timeline</h3>
                {timeline.length === 0 ? (
                  <div className="mi-empty-state">
                    <div className="mi-empty-icon">📌</div>
                    <h3>Timeline is empty</h3>
                    <p>Fill in the form above and click <strong>+ Add to Timeline</strong> to get started.</p>
                  </div>
                ) : (
                  <div className="mi-timeline-list">
                    {timeline.map((item, idx) => {
                      const color = TYPE_COLORS[item.type] || '#e0e0e0';
                      const endTime = formatEndTime(item.time, item.duration);
                      return (
                        <div className="mi-tnode" key={item.id}>
                          <div className="mi-tnode-line" style={{ backgroundColor: color }} />
                          <div className="mi-tnode-dot" style={{ backgroundColor: color }} />
                          <div className="mi-tcard">
                            <div className="mi-tcard-header" style={{ backgroundColor: color }}>
                              <div className="mi-tcard-index">#{idx + 1}</div>
                              <input className="mi-tcard-name" value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)} />
                              <div className="mi-tcard-time">{item.time && <span>{item.time}{endTime ? ` – ${endTime}` : ''}</span>}</div>
                              <button className="mi-tcard-remove" onClick={() => removeItem(item.id)} title="Remove">✕</button>
                            </div>
                            <div className="mi-tcard-body">
                              <div className="mi-tcard-row"><label>Type</label><select value={item.type} onChange={e => updateItem(item.id, 'type', e.target.value)}>{ACTIVITY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
                              <div className="mi-tcard-row"><label>Location</label><input type="text" value={item.location || ''} onChange={e => updateItem(item.id, 'location', e.target.value)} placeholder="Location" /></div>
                              <div className="mi-tcard-row"><label>Time</label><input type="time" value={item.time} onChange={e => updateItem(item.id, 'time', e.target.value)} /></div>
                              <div className="mi-tcard-row"><label>Duration</label><input type="text" value={item.duration} onChange={e => updateItem(item.id, 'duration', e.target.value)} placeholder="e.g. 1h or 30m" /></div>
                              <div className="mi-tcard-row"><label>Notes</label><textarea rows="2" value={item.notes || ''} onChange={e => updateItem(item.id, 'notes', e.target.value)} /></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'locations' && (
            <div className="mi-locations">
              <h3 className="mi-section-title">📍 Activity Locations</h3>
              {timeline.filter(item => item.location).length === 0 ? (
                <div className="mi-empty-state">
                  <div className="mi-empty-icon">📍</div>
                  <h3>No locations added</h3>
                  <p>When you add activities with a location in the <strong>Itinerary Builder</strong>, they will appear here in order.</p>
                  <button className="mi-cta-btn" onClick={() => setActiveTab('itinerary')}>Go to Builder →</button>
                </div>
              ) : (
                <div className="mi-location-list">
                  {timeline.filter(item => item.location).map((item, idx) => {
                    const color = TYPE_COLORS[item.type] || '#e0e0e0';
                    return (
                      <div className="mi-loc-card" key={item.id}>
                        <div className="mi-loc-pin" style={{ backgroundColor: color }}><span>{idx + 1}</span></div>
                        <div className="mi-loc-body">
                          <div className="mi-loc-name">{item.name}</div>
                          <div className="mi-loc-address">📍 {item.location}</div>
                          {item.time && <div className="mi-loc-time">⏰ {item.time}{formatEndTime(item.time, item.duration) ? ` – ${formatEndTime(item.time, item.duration)}` : ''}</div>}
                        </div>
                        <span className="mi-loc-badge" style={{ backgroundColor: color }}>{item.type}</span>
                      </div>
                    );
                  })}
                  <p className="mi-loc-tip">💡 Tip: Visit these in order for the smoothest experience.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
