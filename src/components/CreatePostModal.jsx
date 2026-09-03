import React, { useState, useRef, useEffect } from 'react';
import '../styles/explorer.css';

// ── Inline SVG icons (no external library) ────────────────────────────────────
const IconUsers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconPerson = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

export default function CreatePostModal({ isOpen, onClose, onPostCreated, editPost = null }) {
  const [step, setStep] = useState(1);
  const [experienceType, setExperienceType] = useState('');
  const [content, setContent] = useState('');
  const [pictures, setPictures] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tagging state (Group only)
  const [matches, setMatches] = useState([]);          // accepted matches for this user
  const [taggedIds, setTaggedIds] = useState([]);      // selected user IDs to tag
  const [loadingMatches, setLoadingMatches] = useState(false);

  const fileInputRef = useRef(null);

  // ── populate from editPost or reset ──────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    if (editPost) {
      setExperienceType(editPost.experienceType || '');
      setContent(editPost.content || '');

      let parsedPictures = [];
      if (editPost.pictureURL) {
        try {
          parsedPictures = JSON.parse(editPost.pictureURL);
          if (!Array.isArray(parsedPictures)) parsedPictures = [editPost.pictureURL];
        } catch { parsedPictures = [editPost.pictureURL]; }
      }
      setPictures(parsedPictures);

      // pre-populate existing tags
      try {
        const ids = editPost.taggedUsers ? JSON.parse(editPost.taggedUsers) : [];
        setTaggedIds(Array.isArray(ids) ? ids : []);
      } catch { setTaggedIds([]); }

      setStep(1);
    } else {
      setExperienceType('');
      setContent('');
      setPictures([]);
      setTaggedIds([]);
      setStep(1);
    }
  }, [isOpen, editPost]);

  // ── fetch matches when Group is selected on step 2 ───────────────────────────
  useEffect(() => {
    if (experienceType !== 'Group' || step !== 2) return;
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    const userId = user.id || user.userID;
    setLoadingMatches(true);
    fetch(`http://localhost:5200/api/posts/matches/${userId}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setMatches(Array.isArray(data) ? data : []))
      .catch(() => setMatches([]))
      .finally(() => setLoadingMatches(false));
  }, [experienceType, step]);

  if (!isOpen) return null;

  // ── handlers ─────────────────────────────────────────────────────────────────
  const handleNext = () => { if (experienceType) setStep(2); };

  const toggleTag = (userId) => {
    setTaggedIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const userStr = localStorage.getItem('user');
      let userId = 1;
      if (userStr) {
        const user = JSON.parse(userStr);
        userId = user.id || user.userID || 1;
      }

      const isEdit = !!editPost;
      const url = isEdit
        ? `http://localhost:5200/api/posts/${editPost.postID || editPost.postId}`
        : 'http://localhost:5200/api/posts';

      const payload = {
        userID: userId,
        experienceType,
        content,
        pictureURL: pictures.length > 0 ? JSON.stringify(pictures) : '',
        taggedUsers: experienceType === 'Group' && taggedIds.length > 0
          ? JSON.stringify(taggedIds)
          : null,
      };

      if (isEdit) payload.postID = editPost.postID || editPost.postId;

      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const resultPost = await response.json();
        onPostCreated(resultPost, isEdit);
        handleClose();
      } else {
        const errorText = await response.text();
        console.error('Failed to save post:', errorText);
        alert('Failed to save post. Error: ' + response.status);
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Is the backend running?');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (pictures.length + files.length > 7) {
      alert(`You can only upload up to 7 photos. You have ${pictures.length} already.`);
      return;
    }
    const newPictures = [];
    let processed = 0;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPictures.push(reader.result);
        processed++;
        if (processed === files.length) setPictures(prev => [...prev, ...newPictures]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePicture = (index) => setPictures(prev => prev.filter((_, i) => i !== index));

  const handleClose = () => {
    setStep(1);
    setExperienceType('');
    setContent('');
    setPictures([]);
    setTaggedIds([]);
    onClose();
  };

  // ── render ────────────────────────────────────────────────────────────────────
  return (
    <>
      {isSubmitting && (
        <div className="global-loading-overlay">
          <div className="global-spinner"></div>
          <div className="global-loading-text">{editPost ? 'Updating post...' : 'Sharing post...'}</div>
        </div>
      )}
      <div className="modal-overlay">
        <div className="modal-content">
          <button className="close-btn" onClick={handleClose}>&times;</button>

          {/* ── Step 1: choose type ─────────────────────────────────────────── */}
          {step === 1 ? (
            <div className="step-1">
              <h2>{editPost ? 'Edit Experience' : 'Post Experience'}</h2>
              <p>Is this post for an individual experience or group experience?</p>
              <div className="experience-options">
                <button
                  className={`experience-option-btn${experienceType === 'Individual' ? ' selected' : ''}`}
                  onClick={() => setExperienceType('Individual')}
                >
                  <IconPerson />
                  <span>Individual</span>
                </button>
                <button
                  className={`experience-option-btn${experienceType === 'Group' ? ' selected' : ''}`}
                  onClick={() => setExperienceType('Group')}
                >
                  <IconUsers />
                  <span>Group</span>
                </button>
              </div>
              <button className="btn-primary" onClick={handleNext} disabled={!experienceType}>
                Next
              </button>
            </div>

          ) : (
            /* ── Step 2: content + (Group) tag picker ───────────────────────── */
            <div className="step-2">
              <h2>{editPost ? 'Edit Details' : 'Experience Details'}</h2>
              <form onSubmit={handleSubmit}>
                {/* Tag picker — Group posts only */}
                {experienceType === 'Group' && (
                  <div className="form-group tag-picker-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconUsers />
                      Tag your travel crew
                    </label>
                    {loadingMatches ? (
                      <p style={{ color: '#888', fontSize: '0.85rem' }}>Loading matches...</p>
                    ) : matches.length === 0 ? (
                      <p style={{ color: '#aaa', fontSize: '0.85rem' }}>
                        No accepted matches yet — connect with other travellers first.
                      </p>
                    ) : (
                      <div className="tag-picker-list">
                        {matches.map(m => {
                          const isTagged = taggedIds.includes(m.userId);
                          return (
                            <button
                              key={m.userId}
                              type="button"
                              className={`tag-chip${isTagged ? ' tagged' : ''}`}
                              onClick={() => toggleTag(m.userId)}
                            >
                              <div
                                className="tag-chip-avatar"
                                style={{
                                  backgroundImage: m.avatar ? `url(${m.avatar})` : 'none',
                                }}
                              >
                                {!m.avatar && (m.firstName?.[0] || '?').toUpperCase()}
                              </div>
                              <span>{m.firstName} {m.lastName}</span>
                              {isTagged && <span className="tag-check"><IconCheck /></span>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {taggedIds.length > 0 && (
                      <p style={{ fontSize: '0.8rem', color: '#1a8f66', marginTop: '4px' }}>
                        {taggedIds.length} person{taggedIds.length > 1 ? 's' : ''} tagged — they can also edit this post.
                      </p>
                    )}
                  </div>
                )}

                {/* Caption */}
                <div className="form-group">
                  <label>Drop your caption or hashtags:</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share your story..."
                    required
                  />
                </div>

                {/* Photos */}
                <div className="form-group image-upload-group">
                  <label>Add Photos (Max 7):</label>
                  <div className="image-preview-grid">
                    {pictures.map((pic, idx) => (
                      <div key={idx} className="preview-thumbnail-container">
                        <img src={pic} alt={`Preview ${idx + 1}`} className="preview-thumbnail" />
                        <button type="button" className="remove-pic-btn" onClick={() => removePicture(idx)}>&times;</button>
                      </div>
                    ))}
                    {pictures.length < 7 && (
                      <div className="upload-placeholder-small" onClick={() => fileInputRef.current.click()}>
                        <div className="upload-icon">+</div>
                        <p>Add</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={fileInputRef}
                    className="hidden-file-input"
                    onChange={handleImageUpload}
                    value=""
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary">Back</button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Discard your changes?')) handleClose();
                    }}
                    className="btn-secondary"
                    style={{ backgroundColor: '#fee2e2', color: '#b91c1c', borderColor: '#fca5a5' }}
                  >
                    Discard
                  </button>
                  <button type="submit" className="btn-primary" disabled={isSubmitting}>
                    {editPost
                      ? (isSubmitting ? 'Updating...' : 'Update')
                      : (isSubmitting ? 'Posting...'  : 'Post')}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
