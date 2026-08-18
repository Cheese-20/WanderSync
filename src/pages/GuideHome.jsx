import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import CreatePostModal from '../components/CreatePostModal';
import logo from '../assets/images/logo.png';
import '../styles/explorer.css';
import '../styles/guide.css';

export default function GuideHome() {
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [pendingSpots, setPendingSpots] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('idle');
  const [spots, setSpots] = useState([]); // For Local Favourites
  const [selectedLocalSpot, setSelectedLocalSpot] = useState(null);
  const [isLocalSpotModalOpen, setIsLocalSpotModalOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isReportSpotModalOpen, setIsReportSpotModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Inaccurate Information');
  const [reportComment, setReportComment] = useState('');
  const [reportStatus, setReportStatus] = useState('idle');

  // Manage Itinerary state
  const [assignedTourists, setAssignedTourists] = useState([]);
  
  const [visibleSpotsCount, setVisibleSpotsCount] = useState(4);
  const [visibleLocalSpotsCount, setVisibleLocalSpotsCount] = useState(4);
  const [visiblePostsCount, setVisiblePostsCount] = useState(3);
  const scrollRef = useRef(null);
  const localSpotsScrollRef = useRef(null);
  
  const handleLoadMoreSpots = () => {
    setVisibleSpotsCount(prev => Math.min(prev + 4, 12, pendingSpots.length));
  };

  const handleLoadMoreLocalSpots = () => {
    setVisibleLocalSpotsCount(prev => Math.min(prev + 4, 12, spots.length));
  };

  const handleLoadMorePosts = () => {
    setVisiblePostsCount(prev => Math.min(prev + 3, posts.length));
  };

  const handleOpenReportModal = () => {
    setIsLocalSpotModalOpen(false);
    setReportReason('Inaccurate Information');
    setReportComment('');
    setReportStatus('idle');
    setIsReportSpotModalOpen(true);
  };

  const handleSubmitReport = async () => {
    try {
      const fullReason = reportComment ? `${reportReason} - ${reportComment}` : reportReason;
      await axios.post(`http://localhost:5200/api/spots/${selectedLocalSpot.spotID || selectedLocalSpot.spotId}/report`, {
        reporterId: loggedInUserId,
        reason: fullReason
      });
      setReportStatus('success');
    } catch (e) {
      console.error(e);
      alert('Failed to submit report. Please try again.');
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('http://localhost:5200/api/posts');
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
      }
    };

    fetchPosts();

    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const userId = user.id || user.userID;
        setLoggedInUserId(userId);
        setUserRole(user.role || user.Role);
        
        // Fetch Pending Spots for the top carousel
        axios.get(`http://localhost:5200/api/spots/pending/${userId}`)
          .then(res => setPendingSpots(res.data))
          .catch(err => console.error(err));

        // Fetch assigned tourists for Itinerary Management
        axios.get(`http://localhost:5200/api/local-guide/${userId}/assigned-tourists`)
          .then(res => setAssignedTourists(res.data))
          .catch(err => console.error('Error fetching assigned tourists:', err));
      }
      
      // Fetch verified spots for Local Favourites
      axios.get('http://localhost:5200/api/spots/verified')
        .then(res => setSpots(res.data))
        .catch(err => console.error(err));
    } catch (e) {
      console.warn('Failed to parse user from local storage', e);
    }
  }, []);

  const handlePostCreated = (newOrUpdatedPost, isEdit) => {
    const normalizedPost = {
      ...newOrUpdatedPost,
      postID: newOrUpdatedPost.postID || newOrUpdatedPost.postId,
      userID: newOrUpdatedPost.userID || newOrUpdatedPost.userId,
    };

    if (!normalizedPost.firstName) {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          normalizedPost.firstName = user.firstName || user.FirstName || '';
          normalizedPost.lastName = user.lastName || user.LastName || '';
        }
      } catch (e) { }
    }

    if (isEdit) {
      setPosts(posts.map(p => p.postID === normalizedPost.postID ? { ...p, ...normalizedPost } : p));
    } else {
      setPosts([normalizedPost, ...posts]);
    }
    setEditingPost(null);
  };

  const handleEditClick = (post) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (post) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        const response = await fetch(`http://localhost:5200/api/posts/${post.postID}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setPosts(posts.filter(p => p.postID !== post.postID));
          alert('Post Successfully Deleted');
        } else {
          alert('Failed to delete post. Error: ' + response.status);
        }
      } catch (err) {
        console.error(err);
        alert('Network error. Is the backend running?');
      }
    }
  };

  const handleOpenNewPostModal = () => {
    setEditingPost(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
  };

  const handleReviewVote = async (voteType) => {
    try {
      await axios.post(`http://localhost:5200/api/spots/${selectedSpot.spotID || selectedSpot.spotId}/vote`, {
        guideId: loggedInUserId,
        voteType: voteType
      });
      // Remove from list
      setPendingSpots(pendingSpots.filter(s => (s.spotID || s.spotId) !== (selectedSpot.spotID || selectedSpot.spotId)));
      setReviewStatus('success');
    } catch (e) {
      console.error(e);
      alert('Error recording vote.');
    }
  };

  return (
    <div className="explorer-page guide-page" style={{ paddingTop: '20px' }}>
      <section className="assigned-tourists-section" style={{ marginBottom: '30px' }}>
        <div className="section-header">
          <h2>Assigned Tourists & Itineraries</h2>
        </div>
        {assignedTourists.length > 0 ? (
          <div className="tours-grid" style={{ display: 'flex', overflowX: 'auto', gap: '20px', paddingBottom: '20px' }}>
            {assignedTourists.map(tourist => (
              <article key={tourist.userId} className="tour-card" style={{ minWidth: '250px', flexShrink: 0, padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#007bff', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '10px' }}>
                  {tourist.firstName ? tourist.firstName[0].toUpperCase() : 'T'}
                </div>
                <h3 style={{ margin: '0 0 5px 0' }}>{tourist.firstName} {tourist.lastName}</h3>
                <span style={{ fontSize: '0.85rem', color: '#666', marginBottom: '15px' }}>{tourist.email}</span>
                <button className="mint-btn" onClick={() => navigate(`/manage-itinerary/${tourist.userId}`)}>Manage Itinerary</button>
              </article>
            ))}
          </div>
        ) : (
          <p style={{ padding: '0 20px' }}>You have no assigned tourists currently.</p>
        )}
      </section>

      <section className="happening-lately-section">
        <div className="section-header">
          <h2>Spots to be verified</h2>
        </div>
        <div className="tours-grid" ref={scrollRef} style={{ display: 'flex', overflowX: 'auto', gap: '20px', paddingBottom: '20px' }}>
          {pendingSpots.slice(0, visibleSpotsCount).map(spot => (
            <article key={spot.spotID || spot.spotId} className="tour-card" style={{ minWidth: '300px', flexShrink: 0 }}>
              <div className="tour-image-placeholder">
                <img src={spot.pictureURL || 'https://via.placeholder.com/260x140'} alt="Spot" />
              </div>
              <div className="tour-card-body">
                <h3 className="tour-title" style={{ marginBottom: '4px' }}>{spot.activityName || spot.name || 'Unnamed Spot'}</h3>
                <span style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '8px' }}>{spot.activityType || 'Experience'}</span>
                <div className="tour-meta">
                  <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    {spot.location || 'Unknown Location'}
                  </span>
                  <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    Submitted: {new Date(spot.submittedAt).toLocaleDateString()}
                  </span>
                  <span style={{ fontStyle: 'italic', color: '#666', fontSize: '0.8rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#d4c28c', backgroundImage: `url(${spot.submitterAvatar || ''})`, backgroundSize: 'cover' }}></div>
                    By: {spot.submitterName || 'Explorer'}
                  </span>
                </div>
                <div className="tour-footer">
                  <div style={{ flex: 1 }}></div>
                  <button 
                    className="mint-btn" 
                    onClick={() => { setSelectedSpot(spot); setReviewStatus('idle'); setIsReviewModalOpen(true); }}
                  >
                    Review
                  </button>
                </div>
              </div>
            </article>
          ))}
          
          {pendingSpots.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px', flexShrink: 0 }}>
              <button 
                onClick={() => {
                  handleLoadMoreSpots();
                  if (scrollRef.current) {
                    setTimeout(() => {
                      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
                    }, 100);
                  }
                }} 
                style={{
                  width: '50px', height: '50px', borderRadius: '50%', 
                  backgroundColor: (visibleSpotsCount >= 12 || visibleSpotsCount >= pendingSpots.length) ? '#ccc' : '#007bff', 
                  color: '#fff', border: 'none', fontSize: '1.5rem', 
                  cursor: (visibleSpotsCount >= 12 || visibleSpotsCount >= pendingSpots.length) ? 'default' : 'pointer', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
                disabled={visibleSpotsCount >= 12 || visibleSpotsCount >= pendingSpots.length}
                title="Load more spots"
              >
                &#8594;
              </button>
            </div>
          )}

          {pendingSpots.length === 0 && <p style={{ padding: '20px' }}>No spots pending verification right now.</p>}
        </div>
      </section>

      <section className="local-favs-section">
        <div className="section-header">
          <h2>Local Favourites</h2>
        </div>
        <div className="tours-grid" ref={localSpotsScrollRef} style={{ display: 'flex', overflowX: 'auto', gap: '20px', paddingBottom: '20px' }}>
          {spots.slice(0, visibleLocalSpotsCount).map(spot => (
            <article key={spot.spotID || spot.spotId} className="tour-card" style={{ minWidth: '300px', flexShrink: 0 }}>
              <div className="tour-image-placeholder">
                <img src={spot.pictureURL || 'https://via.placeholder.com/260x140'} alt="Spot" />
              </div>
              <div className="tour-card-body">
                <h3 className="tour-title" style={{ marginBottom: '4px' }}>{spot.activityName || spot.name || 'Unnamed Spot'}</h3>
                <span style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '8px' }}>{spot.activityType || spot.category || 'Experience'}</span>
                <div className="tour-meta">
                  <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    {spot.location || 'Unknown Location'}
                  </span>
                </div>
                <div className="tour-footer">
                  <div style={{ flex: 1 }}></div>
                  <button 
                    className="mint-btn" 
                    onClick={() => { setSelectedLocalSpot(spot); setIsLocalSpotModalOpen(true); }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </article>
          ))}
          
          {spots.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px', flexShrink: 0 }}>
              <button 
                onClick={() => {
                  handleLoadMoreLocalSpots();
                  if (localSpotsScrollRef.current) {
                    setTimeout(() => {
                      localSpotsScrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
                    }, 100);
                  }
                }} 
                style={{
                  width: '50px', height: '50px', borderRadius: '50%', 
                  backgroundColor: (visibleLocalSpotsCount >= 12 || visibleLocalSpotsCount >= spots.length) ? '#ccc' : '#007bff', 
                  color: '#fff', border: 'none', fontSize: '1.5rem', 
                  cursor: (visibleLocalSpotsCount >= 12 || visibleLocalSpotsCount >= spots.length) ? 'default' : 'pointer', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
                disabled={visibleLocalSpotsCount >= 12 || visibleLocalSpotsCount >= spots.length}
                title="Load more spots"
              >
                &#8594;
              </button>
            </div>
          )}

          {spots.length === 0 && <p style={{ padding: '20px' }}>No verified local favourites yet.</p>}
        </div>
      </section>

      <section className="community-feed-section">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Live from Community</h2>
          <button className="mint-btn" style={{ padding: '6px 20px', borderRadius: '20px', backgroundColor: '#a6d8b6', color: '#fff', border: 'none', fontSize: '0.9rem' }} onClick={handleOpenNewPostModal}>
            Create a post
          </button>
        </div>

        <div className="community-feed-list">
          {posts.slice(0, visiblePostsCount).map(post => (
            <div key={post.postID || Math.random()} className="community-post-card">
              <div className="c-post-header">
                <div className="c-post-avatar" style={{ backgroundColor: '#d4c28c', backgroundImage: `url(${post.userAvatar || ''})`, backgroundSize: 'cover', width: '40px', height: '40px', borderRadius: '50%' }}></div>
                <div className="c-post-info">
                  <span className="c-post-name" style={{ fontWeight: 'bold' }}>
                    {post.firstName ? `${post.firstName} ${post.lastName}` : `Explorer ${post.userID}`}
                    <span className="experience-badge" style={{ marginLeft: '8px' }}>{post.experienceType}</span>
                  </span>
                  <span className="c-post-time" style={{ color: '#888', fontSize: '0.85rem' }}>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <p className="c-post-text" style={{ marginTop: '10px' }}>{post.content}</p>

              {(() => {
                if (!post.pictureURL) return null;
                let images = [];
                try {
                  images = JSON.parse(post.pictureURL);
                  if (!Array.isArray(images)) images = [post.pictureURL];
                } catch (e) {
                  images = [post.pictureURL];
                }

                if (images.length === 1) {
                  return (
                    <div className="c-post-img-wrapper">
                      <img src={images[0]} alt="Experience" className="c-post-img" />
                    </div>
                  );
                }

                return (
                  <div className="post-images-carousel">
                    {images.map((imgSrc, idx) => (
                      <img key={idx} src={imgSrc} alt={`Experience ${idx + 1}`} className="carousel-image" />
                    ))}
                  </div>
                );
              })()}

              <div className="post-actions" style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                {loggedInUserId === post.userID && (
                  <>
                    <span
                      className="action-icon edit-icon"
                      onClick={() => handleEditClick(post)}
                      style={{ marginLeft: 'auto', cursor: 'pointer', fontSize: '0.9rem', color: '#007bff' }}
                    >
                      Edit
                    </span>
                    <span
                      className="action-icon delete-icon"
                      onClick={() => handleDeleteClick(post)}
                      style={{ cursor: 'pointer', fontSize: '0.9rem', color: '#dc3545' }}
                    >
                      Delete
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
          {posts.length === 0 && <p>No posts yet. Be the first to share an experience!</p>}
        </div>
        
        {posts.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginBottom: '40px' }}>
            <button 
              className="mint-btn" 
              style={{ 
                padding: '8px 30px', 
                borderRadius: '20px', 
                backgroundColor: visiblePostsCount >= posts.length ? '#ccc' : '#a6d8b6', 
                color: '#fff', 
                border: 'none',
                cursor: visiblePostsCount >= posts.length ? 'default' : 'pointer'
              }} 
              onClick={handleLoadMorePosts}
              disabled={visiblePostsCount >= posts.length}
            >
              See more
            </button>
          </div>
        )}
      </section>

      {isReviewModalOpen && selectedSpot && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px', textAlign: 'center', position: 'relative' }}>
            <button className="close-btn" onClick={() => setIsReviewModalOpen(false)}>&times;</button>
            <div style={{ marginBottom: '20px' }}>
              <img src={logo} alt="WanderSync" style={{ width: '60px', height: 'auto', margin: '0 auto 15px auto', display: 'block' }} />
              <h2 style={{ margin: '0 0 15px 0', fontSize: '1.4rem', color: '#1a1a1a' }}>Review Pending Spot</h2>
              
              <div style={{ textAlign: 'left', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>{selectedSpot.activityName}</h3>
                <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem' }}>{selectedSpot.activityType} • {selectedSpot.location}</p>
                
                {selectedSpot.pictureURL && (
                  <img src={selectedSpot.pictureURL} alt="Spot" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} />
                )}
                
                <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem' }}>Description:</h4>
                <p style={{ margin: '0 0 15px 0', fontSize: '0.95rem', lineHeight: '1.4' }}>{selectedSpot.description}</p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid #e0e0e0', paddingTop: '10px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#d4c28c', backgroundImage: `url(${selectedSpot.submitterAvatar || ''})`, backgroundSize: 'cover' }}></div>
                  <span style={{ fontSize: '0.85rem', color: '#555' }}>Submitted by {selectedSpot.submitterName}</span>
                </div>
              </div>
            </div>

            {reviewStatus === 'idle' ? (
              <div className="modal-actions" style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-secondary" onClick={() => handleReviewVote('reject')} style={{ flex: 1, borderRadius: '24px', padding: '14px', fontWeight: 'bold', backgroundColor: '#fff', border: '2px solid #dc3545', color: '#dc3545' }}>Reject</button>
                <button className="btn-primary" onClick={() => handleReviewVote('approve')} style={{ flex: 1, borderRadius: '24px', padding: '14px', fontWeight: 'bold', backgroundColor: '#28a745', border: 'none' }}>Approve</button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#28a745', marginBottom: '20px' }}>
                  Vote Successfully Recorded!
                </p>
                <div className="modal-actions" style={{ display: 'flex', justifyContent: 'center' }}>
                  <button className="btn-primary" onClick={() => setIsReviewModalOpen(false)} style={{ width: '100%', borderRadius: '24px', padding: '14px' }}>OK</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isLocalSpotModalOpen && selectedLocalSpot && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px', textAlign: 'center', position: 'relative' }}>
            <button className="close-btn" onClick={() => setIsLocalSpotModalOpen(false)}>&times;</button>
            <div style={{ marginBottom: '20px' }}>
              <img src={logo} alt="WanderSync" style={{ width: '60px', height: 'auto', margin: '0 auto 15px auto', display: 'block' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ margin: '0', fontSize: '1.4rem', color: '#1a1a1a' }}>Verified Local Favourite</h2>
                <button 
                  onClick={handleOpenReportModal}
                  style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', fontWeight: 'bold' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
                  Report
                </button>
              </div>
              
              <div style={{ textAlign: 'left', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>{selectedLocalSpot.activityName || selectedLocalSpot.name}</h3>
                <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem' }}>{selectedLocalSpot.activityType || selectedLocalSpot.category} • {selectedLocalSpot.location}</p>
                
                {selectedLocalSpot.pictureURL && (
                  <img src={selectedLocalSpot.pictureURL} alt="Spot" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} />
                )}
                
                <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem' }}>Description:</h4>
                <p style={{ margin: '0 0 15px 0', fontSize: '0.95rem', lineHeight: '1.4' }}>{selectedLocalSpot.description}</p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid #e0e0e0', paddingTop: '10px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#d4c28c', backgroundImage: `url(${selectedLocalSpot.submitterAvatar || ''})`, backgroundSize: 'cover' }}></div>
                  <span style={{ fontSize: '0.85rem', color: '#555' }}>Submitted by {selectedLocalSpot.submitterName || 'Explorer'}</span>
                </div>
              </div>
            </div>

            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'center' }}>
              <button className="btn-primary" onClick={() => setIsLocalSpotModalOpen(false)} style={{ width: '100%', borderRadius: '24px', padding: '14px', fontWeight: 'bold' }}>Awesome!</button>
            </div>
          </div>
        </div>
      )}

      {isReportSpotModalOpen && selectedLocalSpot && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px', textAlign: 'center', position: 'relative' }}>
            <button className="close-btn" onClick={() => setIsReportSpotModalOpen(false)}>&times;</button>
            <div style={{ marginBottom: '20px' }}>
              <img src={logo} alt="WanderSync" style={{ width: '60px', height: 'auto', margin: '0 auto 15px auto', display: 'block' }} />
              <h2 style={{ margin: '0 0 15px 0', fontSize: '1.4rem', color: '#1a1a1a' }}>Report Spot</h2>
              
              {reportStatus === 'idle' ? (
                <div style={{ textAlign: 'left', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '12px' }}>
                  <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '0.95rem' }}>
                    Why are you reporting <strong>{selectedLocalSpot.activityName || selectedLocalSpot.name}</strong>?
                  </p>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>Reason</label>
                    <select 
                      value={reportReason} 
                      onChange={(e) => setReportReason(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem' }}
                    >
                      <option value="Inaccurate Information">Inaccurate Information</option>
                      <option value="Offensive Content">Offensive Content</option>
                      <option value="Spam">Spam</option>
                      <option value="Does Not Exist">Spot Does Not Exist</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>Additional Comments (Optional)</label>
                    <textarea 
                      value={reportComment}
                      onChange={(e) => setReportComment(e.target.value)}
                      rows="3"
                      placeholder="Provide more details..."
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', resize: 'vertical' }}
                    ></textarea>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-secondary btn-rounded" onClick={() => setIsReportSpotModalOpen(false)} style={{ flex: 1, fontWeight: 'bold' }}>Cancel</button>
                    <button className="btn-danger btn-rounded" onClick={handleSubmitReport} style={{ flex: 1, fontWeight: 'bold' }}>Submit Report</button>
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#28a745', marginBottom: '20px' }}>
                    Report Submitted Successfully!
                  </p>
                  <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>
                    Thank you for keeping WanderSync safe. Our admin team will review this spot shortly.
                  </p>
                  <button className="btn-primary btn-rounded" onClick={() => setIsReportSpotModalOpen(false)} style={{ width: '100%', fontWeight: 'bold' }}>Close</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onPostCreated={handlePostCreated}
        editPost={editingPost}
      />
    </div>
  );
}

