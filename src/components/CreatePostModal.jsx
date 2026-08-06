import React, { useState, useRef, useEffect } from 'react';
import '../styles/explorer.css'; // Will add modal styles here

export default function CreatePostModal({ isOpen, onClose, onPostCreated, editPost = null }) {
  const [step, setStep] = useState(1);
  const [experienceType, setExperienceType] = useState('');
  const [content, setContent] = useState('');
  const [pictureURL, setPictureURL] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && editPost) {
      setExperienceType(editPost.experienceType || '');
      setContent(editPost.content || '');
      setPictureURL(editPost.pictureURL || '');
      setStep(1);
    } else if (isOpen && !editPost) {
      setExperienceType('');
      setContent('');
      setPictureURL('');
      setStep(1);
    }
  }, [isOpen, editPost]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (experienceType) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userStr = localStorage.getItem('user');
      let userId = 1; // fallback
      if (userStr) {
        const user = JSON.parse(userStr);
        userId = user.id || user.userID || 1;
      }

      const isEdit = !!editPost;
      const url = isEdit 
        ? `http://localhost:5200/api/posts/${editPost.postID}`
        : 'http://localhost:5200/api/posts';

      const payload = {
        userID: userId,
        experienceType,
        content,
        pictureURL
      };

      if (isEdit) {
         payload.postID = editPost.postID;
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
        setPictureURL('');
        onClose();
      } else {
        const errorText = await response.text();
        console.error('Failed to save post:', errorText);
        alert('Failed to save post. Error: ' + response.status);
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Is the backend running?');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPictureURL(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClose = () => {
    setStep(1);
    setExperienceType('');
    setContent('');
    setPictureURL('');
    onClose();
  };

  return (
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
                <label>Add information about your experience:</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your story..."
                  required
                />
              </div>
              <div className="form-group image-upload-group">
                <label>Add a Photo:</label>
                {pictureURL ? (
                  <div className="image-preview-container" onClick={() => fileInputRef.current.click()}>
                    <img src={pictureURL} alt="Preview" className="image-preview" />
                    <div className="image-overlay"><span>Change Photo</span></div>
                  </div>
                ) : (
                  <div className="upload-placeholder" onClick={() => fileInputRef.current.click()}>
                    <div className="upload-icon">+</div>
                    <p>Upload a Photo</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary">Back</button>
                <button type="button" onClick={() => {
                  if (window.confirm('Are you sure you want to discard your changes? All details will be lost.')) {
                    handleClose();
                  }
                }} className="btn-secondary" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', borderColor: '#fca5a5' }}>Discard</button>
                <button type="submit" className="btn-primary">{editPost ? 'Update' : 'Post'}</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
