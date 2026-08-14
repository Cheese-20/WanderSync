import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import CreatePostModal from '../components/CreatePostModal';
import logo from '../assets/images/logo.png';
import '../styles/explorer.css';

export default function ExplorerHome() {
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [tours, setTours] = useState([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [requestedTourIds, setRequestedTourIds] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  const [bookingStatus, setBookingStatus] = useState('idle');
  const [guestCount, setGuestCount] = useState(1);
  const [spots, setSpots] = useState([]);
  const [selectedLocalSpot, setSelectedLocalSpot] = useState(null);
  const [isLocalSpotModalOpen, setIsLocalSpotModalOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [visibleToursCount, setVisibleToursCount] = useState(4);
  const [visibleSpotsCount, setVisibleSpotsCount] = useState(4);
  const [visiblePostsCount, setVisiblePostsCount] = useState(3);
  const scrollRef = useRef(null);
  const spotsScrollRef = useRef(null);
  
  const handleLoadMoreTours = () => {
    setVisibleToursCount(prev => Math.min(prev + 4, 12, tours.length));
  };

  const handleLoadMoreSpots = () => {
    setVisibleSpotsCount(prev => Math.min(prev + 4, 12, spots.length));
  };

  const handleLoadMorePosts = () => {
    setVisiblePostsCount(prev => Math.min(prev + 3, posts.length));
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
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

    const fetchTours = async () => {
      try {
        const response = await axios.get('/api/tours');
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const upcomingTours = response.data.filter(tour => new Date(tour.date) >= now);
        setTours(upcomingTours);
      } catch (error) {
        console.error("Error fetching tours:", error);
      }
    };

    fetchPosts();
    fetchTours();

    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setLoggedInUserId(user.id || user.userID);
        setUserRole(user.role || user.Role);
      }
      
      // Fetch verified spots for everyone
      axios.get('http://localhost:5200/api/spots/verified')
        .then(res => setSpots(res.data))
        .catch(err => console.error(err));
    } catch (e) {
      console.warn('Failed to parse user from local storage', e);
    }
  }, []);

  const handlePostCreated = (newOrUpdatedPost, isEdit) => {
    // Normalize casing for postID/userID from backend POST/PUT requests
    const normalizedPost = {
      ...newOrUpdatedPost,
      postID: newOrUpdatedPost.postID || newOrUpdatedPost.postId,
      userID: newOrUpdatedPost.userID || newOrUpdatedPost.userId,
    };

    // Inject user's name if missing (e.g. for newly created/updated posts)
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

  return (
    <div className="explorer-page" style={{ paddingTop: '20px' }}>
      <section className="happening-lately-section">
        <div className="section-header">
          <h2>Tours happening lately</h2>
        </div>
        <div className="tours-grid" ref={scrollRef} style={{ display: 'flex', overflowX: 'auto', gap: '20px', paddingBottom: '20px' }}>
          {tours.slice(0, visibleToursCount).map(tour => (
            <article key={tour.tourId || tour.tourID} className="tour-card" style={{ minWidth: '300px', flexShrink: 0 }}>
              <div className="tour-image-placeholder">
                <img src={tour.pictureURL || tour.imageURL || 'https://via.placeholder.com/260x140'} alt="Tour" />
              </div>
              <div className="tour-card-body">
                <h3 className="tour-title" style={{ marginBottom: '4px' }}>{tour.title}</h3>
                <span style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '8px' }}>{tour.type}</span>
                <div className="tour-meta">
                  <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    {tour.location}
                  </span>
                  <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    {new Date(tour.date).toLocaleDateString()} at {new Date(tour.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span style={{ fontStyle: 'italic', color: '#666', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>Hosted by: {tour.guideName}</span>
                </div>
                <div className="tour-footer">
                  <div className="tour-going" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#666', fontSize: '0.85rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    <span>{tour.confirmedBookingsCount || 0}/{tour.maxPeople} going</span>
                  </div>
                  <button 
                    className="mint-btn" 
                    disabled={requestedTourIds.includes(tour.tourId || tour.tourID)}
                    style={{ opacity: requestedTourIds.includes(tour.tourId || tour.tourID) ? 0.6 : 1, cursor: requestedTourIds.includes(tour.tourId || tour.tourID) ? 'not-allowed' : 'pointer' }}
                    onClick={() => { setSelectedTour(tour); setIsBookingModalOpen(true); }}
                  >
                    {requestedTourIds.includes(tour.tourId || tour.tourID) ? 'Requested' : 'Join'}
                  </button>
                </div>
              </div>
            </article>
          ))}
          
          {tours.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px', flexShrink: 0 }}>
              <button 
                onClick={() => {
                  handleLoadMoreTours();
                  if (scrollRef.current) {
                    setTimeout(() => {
                      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
                    }, 100);
                  }
                }} 
                style={{
                  width: '50px', height: '50px', borderRadius: '50%', 
                  backgroundColor: (visibleToursCount >= 12 || visibleToursCount >= tours.length) ? '#ccc' : '#007bff', 
                  color: '#fff', border: 'none', fontSize: '1.5rem', 
                  cursor: (visibleToursCount >= 12 || visibleToursCount >= tours.length) ? 'default' : 'pointer', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
                disabled={visibleToursCount >= 12 || visibleToursCount >= tours.length}
                title="Load more tours"
              >
                &#8594;
              </button>
            </div>
          )}

          {tours.length === 0 && <p>No tours available today.</p>}
        </div>
      </section>

      <section className="local-favs-section">
        <div className="section-header">
          <h2>Local Favourites</h2>
        </div>
        <div className="tours-grid" ref={spotsScrollRef} style={{ display: 'flex', overflowX: 'auto', gap: '20px', paddingBottom: '20px' }}>
          {spots.slice(0, visibleSpotsCount).map(spot => (
            <article key={spot.spotID || spot.spotId} className="tour-card" style={{ minWidth: '300px', flexShrink: 0 }}>
              <div className="tour-image-placeholder">
                <img src={spot.pictureURL || 'https://via.placeholder.com/260x140'} alt="Spot" />
                <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'rgba(255,255,255,0.9)', color: '#1a8f66', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>✓ Verified</span>
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
                  handleLoadMoreSpots();
                  if (spotsScrollRef.current) {
                    setTimeout(() => {
                      spotsScrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
                    }, 100);
                  }
                }} 
                style={{
                  width: '50px', height: '50px', borderRadius: '50%', 
                  backgroundColor: (visibleSpotsCount >= 12 || visibleSpotsCount >= spots.length) ? '#ccc' : '#007bff', 
                  color: '#fff', border: 'none', fontSize: '1.5rem', 
                  cursor: (visibleSpotsCount >= 12 || visibleSpotsCount >= spots.length) ? 'default' : 'pointer', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
                disabled={visibleSpotsCount >= 12 || visibleSpotsCount >= spots.length}
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


        <div className="posts-container">
          {posts.map(post => (
            <div key={post.postID || Math.random()} className="post">
              <div className="post-header">
                <div className="post-user-info">
                  <div className="post-avatar"></div>
                  <span 
                    className="post-username clickable-username" 
                    onClick={() => navigate(`/user/${post.userID}`)}
                    title="View profile"
                  >
                    {post.firstName ? `${post.firstName} ${post.lastName}` : `Explorer ${post.userID}`}
                  </span>
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


              <div className="post-body">
                <div className="post-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span className="action-icon" title="Like">❤️</span>
                  <span className="action-icon" title="Comment">💬</span>
                  <span className="action-icon" title="Share">↗️</span>
                  {loggedInUserId === post.userID && (
                    <>
                      <span 
                        className="action-icon edit-icon" 
                        title="Edit Post" 
                        onClick={() => handleEditClick(post)} 
                        style={{ marginLeft: 'auto', cursor: 'pointer', fontSize: '1.2rem' }}
                      >
                        ✏️
                      </span>
                      <span 
                        className="action-icon delete-icon" 
                        title="Delete Post" 
                        onClick={() => handleDeleteClick(post)} 
                        style={{ cursor: 'pointer', fontSize: '1.2rem' }}
                      >
                        🗑️
                      </span>
                    </>
                  )}
                </div>
                <p className="post-content">
                  <strong 
                    className="clickable-username" 
                    onClick={() => navigate(`/user/${post.userID}`)}
                  >
                    {post.firstName ? `${post.firstName} ${post.lastName}` : `Explorer ${post.userID}`}
                  </strong> {post.content}
                </p>
                <span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span>
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


      {isBookingModalOpen && selectedTour && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center', position: 'relative' }}>
            <button className="close-btn" onClick={() => setIsBookingModalOpen(false)}>&times;</button>
            <div style={{ marginBottom: '20px' }}>
              <img src={logo} alt="WanderSync" style={{ width: '60px', height: 'auto', margin: '0 auto 15px auto', display: 'block' }} />
              <h2 style={{ margin: '0', fontSize: '1.2rem', color: '#1a1a1a' }}>How many people are going?</h2>
            </div>

            {bookingStatus === 'idle' ? (
              <>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <input
                    type="number"
                    min="1"
                    max={selectedTour.maxPeople - (selectedTour.confirmedBookingsCount || 0)}
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    style={{ width: '100%', padding: '14px', border: '2px solid #e0e0e0', borderRadius: '16px', fontSize: '1.1rem', textAlign: 'center', backgroundColor: '#fff', color: '#000', outline: 'none' }}
                  />
                </div>

                <div className="modal-actions" style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn-secondary" onClick={() => setIsBookingModalOpen(false)} style={{ flex: 1, borderRadius: '24px', padding: '14px', fontWeight: 'bold' }}>Cancel</button>
                  <button className="btn-primary" style={{ flex: 1, borderRadius: '24px', padding: '14px', fontWeight: 'bold' }} onClick={async () => {
                    try {
                      await axios.post('http://localhost:5200/api/bookings', {
                        userID: loggedInUserId,
                        tourID: selectedTour.tourId || selectedTour.tourID,
                        bookingDate: selectedTour.date,
                        timeOfBooking: new Date(selectedTour.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        numberOfGuests: guestCount,
                        bookingType: "Standard"
                      });
                      setRequestedTourIds([...requestedTourIds, selectedTour.tourId || selectedTour.tourID]);
                      setBookingStatus('success');
                    } catch (e) {
                      console.error(e);
                      alert('Error creating booking');
                    }
                  }}>Submit Request</button>
                </div>
              </>
            ) : (
              <div>
                <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1a8f66', marginBottom: '20px' }}>
                  Success, sending request to guide
                </p>
                <div className="modal-actions" style={{ display: 'flex', justifyContent: 'center' }}>
                  <button className="btn-primary" onClick={() => setIsBookingModalOpen(false)} style={{ width: '100%' }}>OK</button>
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
              <h2 style={{ margin: '0 0 15px 0', fontSize: '1.4rem', color: '#1a1a1a' }}>Verified Local Favourite</h2>
              
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

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onPostCreated={handlePostCreated}
        editPost={editingPost}
      />
    </div>
  );
}
