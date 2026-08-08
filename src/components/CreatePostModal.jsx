import React, { useState, useRef, useEffect } from 'react';
import '../styles/explorer.css'; // Will add modal styles here

export default function CreatePostModal({ isOpen, onClose, onPostCreated, editPost = null }) {
  const [step, setStep] = useState(1);
  const [experienceType, setExperienceType] = useState('');
  const [content, setContent] = useState('');
  const [pictures, setPictures] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && editPost) {
      setExperienceType(editPost.experienceType || '');
      setContent(editPost.content || '');

      let parsedPictures = [];
      if (editPost.pictureURL) {
        try {
          parsedPictures = JSON.parse(editPost.pictureURL);
          if (!Array.isArray(parsedPictures)) {
            parsedPictures = [editPost.pictureURL];
          }
        } catch (e) {
          parsedPictures = [editPost.pictureURL];
        }
      }
      setPictures(parsedPictures);
      setStep(1);
    } else if (isOpen && !editPost) {
      setExperienceType('');
      setContent('');
      setPictures([]);
      setStep(1);
    }
  }, [isOpen, editPost]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (experienceType) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const userStr = localStorage.getItem('user');
      let userId = 1; // fallback
      if (userStr) {
        const user = JSON.parse(userStr);
        userId = user.id || user.userID || 1;
      }

      const isEdit = !!editPost;
      const url = isEdit
        ? `http://localhost:5200/api/posts/${editPost.postID || editPost.postId}` // fallback for id casing
        : 'http://localhost:5200/api/posts';

      const payload = {
        userID: userId,
        experienceType,
        content,
        pictureURL: pictures.length > 0 ? JSON.stringify(pictures) : ""
      };

      if (isEdit) {
        payload.postID = editPost.postID || editPost.postId;
      }

      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const resultPost = await response.json();
        onPostCreated(resultPost, isEdit);
        setStep(1);
        setExperienceType('');
        setContent('');
        setPictures([]);
        onClose();
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
      alert(`You can only upload up to 7 photos. You tried to add ${files.length} more to your existing ${pictures.length} photos.`);
      return;
    }

    const newPictures = [];
    let processed = 0;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPictures.push(reader.result);
        processed++;
        if (processed === files.length) {
          setPictures(prev => [...prev, ...newPictures]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePicture = (index) => {
    setPictures(prev => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    setStep(1);
    setExperienceType('');
    setContent('');
    setPictures([]);
    onClose();
  };

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
        {step === 1 ? (
          <div className="step-1">
            <h2>{editPost ? 'Edit Experience' : 'Post Experience'}</h2>
            <p>Is this post for an individual experience or group experience?</p>
            <div className="experience-options">
              <button
                className={experienceType === 'Individual' ? 'selected' : ''}
                onClick={() => setExperienceType('Individual')}
              >
                Individual
              </button>
              <button
                className={experienceType === 'Group' ? 'selected' : ''}
                onClick={() => setExperienceType('Group')}
              >
                Group
              </button>
            </div>
            <button className="btn-primary" onClick={handleNext} disabled={!experienceType}>
              Next
            </button>
          </div>
        ) : (
          <div className="step-2">
            <h2>{editPost ? 'Edit Details' : 'Experience Details'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Drop your caption or hashtags:</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your story..."
                  required
                />
              </div>

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
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                  value=""
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary">Back</button>
                <button type="button" onClick={() => {
                  if (window.confirm('Are you sure you want to discard your changes? All details will be lost.')) {
                    handleClose();
                  }
                }} className="btn-secondary" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', borderColor: '#fca5a5' }}>Discard</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {editPost ? (isSubmitting ? 'Updating...' : 'Update') : (isSubmitting ? 'Posting...' : 'Post')}
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
