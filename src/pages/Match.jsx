import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import '../styles/match.css';

export default function Match() {
  const [matches, setMatches] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [animatingDir, setAnimatingDir] = useState(null); // 'left' or 'right'
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserInterests, setCurrentUserInterests] = useState([]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const userJson = localStorage.getItem('user');
        let userId = 0;
        if (userJson) {
          const user = JSON.parse(userJson);
          userId = user.id || user.userID || 0;
          setCurrentUserId(userId);
        }

        if (userId) {
          // Fetch current user profile to get their interests for comparison
          try {
            const profileRes = await axios.get(`/api/profile/${userId}`);
            const p = profileRes.data;
            if (!p || !p.profilePictureLink || !p.interests || !p.description || !p.location) {
              navigate('/profile', { state: { message: "You must complete your profile before matching! All fields except Job are required." } });
              return;
            }
            if (p.interests) {
              const userInterests = p.interests.split(',').map(i => i.trim().toLowerCase());
              setCurrentUserInterests(userInterests);
            }
          } catch (e) {
            console.warn("Could not fetch user profile for interests");
            if (e.response && e.response.status === 404) {
              navigate('/profile', { state: { message: "You must complete your profile before matching! All fields except Job are required." } });
              return;
            }
          }

          // Fetch matches
          const response = await axios.get(`/api/profile/matches/${userId}`);
          if (response.data) {
            setMatches(response.data);
          } else {
            setMatches([]);
          }
        } else {
          setMatches([]);
        }
      } catch (err) {
        console.warn('Could not fetch matches', err);
        setMatches([]);
      }
    };

    const fetchPending = async () => {
      try {
        const userJson = localStorage.getItem('user');
        if (userJson) {
          const user = JSON.parse(userJson);
          const userId = user.id || user.userID || 0;
          if (userId) {
            const res = await axios.get(`/api/profile/pending/${userId}`);
            if (res.data) {
              setPendingRequests(res.data);
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch pending requests', err);
      }
    };

    fetchMatches();
    fetchPending();
  }, []);


  const handleAction = async (direction) => {
    if (currentIndex >= matches.length) return;

    const currentMatch = matches[currentIndex];
    setAnimatingDir(direction);

    // Fire off API request to log the swipe
    if (currentUserId && currentMatch) {
      try {
        await axios.post('/api/profile/swipe', {
          requesterID: currentUserId,
          receiverID: currentMatch.userID,
          status: direction === 'right' ? 'accepted' : 'rejected',
          commonInterests: currentMatch.interests
        });
      } catch (err) {
        console.error("Error saving swipe action:", err);
      }
    }

    // Wait for animation to finish before moving to next card
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setAnimatingDir(null);
    }, 400); // 400ms matches the CSS transition
  };

  const handleReject = () => handleAction('left');
  const handleAccept = () => handleAction('right');

  const currentMatch = matches[currentIndex];

  const handleAcceptPending = async (e, req) => {
    e.stopPropagation();
    if (!currentUserId) return;
    try {
      await axios.post('/api/profile/swipe', {
        requesterID: currentUserId,
        receiverID: req.id,
        status: 'accepted',
        commonInterests: req.commonInterests
      });
      setPendingRequests(prev => prev.filter(p => p.id !== req.id));
    } catch (err) {
      console.error("Error accepting pending request", err);
    }
  };

  const handleRejectPending = async (e, req) => {
    e.stopPropagation();
    if (!currentUserId) return;
    try {
      await axios.post('/api/profile/swipe', {
        requesterID: currentUserId,
        receiverID: req.id,
        status: 'rejected',
        commonInterests: req.commonInterests
      });
      setPendingRequests(prev => prev.filter(p => p.id !== req.id));
    } catch (err) {
      console.error("Error rejecting pending request", err);
    }
  };

  const handleViewPending = (id) => {
    const targetIdx = matches.findIndex(m => m.userID === id);
    if (targetIdx !== -1) {
      setCurrentIndex(targetIdx);
    }
  };

  // Calculate shared interests
  let currentMatchInterests = [];
  let sharedInterestsCount = 0;
  if (currentMatch) {
    currentMatchInterests = currentMatch.interests ? currentMatch.interests.split(',').map(i => i.trim()) : ['Travel'];
    sharedInterestsCount = currentMatchInterests.filter(i => currentUserInterests.includes(i.toLowerCase())).length;
  }

  return (
    <div className="match-page">


      <main className="match-page-content">
        <div className="swipe-header">
          <h2>Find Your Travel Buddy</h2>
          <p>Connect with travelers and locals who share your interests</p>
        </div>

        <div className="match-container">
          {/* Pending Requests Sidebar */}
          <aside className="pending-sidebar">
            <h3>Pending Requests</h3>
            <div className="pending-list">
              {pendingRequests.map(req => (
                <div key={req.id} className="pending-item" onClick={() => handleViewPending(req.id)} style={{cursor: 'pointer'}}>
                  <img src={req.image} alt={req.name} className="pending-img" />
                  <span className="pending-name">{req.name}</span>
                  <button className="pending-btn accept" onClick={(e) => handleAcceptPending(e, req)}>✓</button>
                  <button className="pending-btn reject" onClick={(e) => handleRejectPending(e, req)}>✕</button>
                </div>
              ))}
              {pendingRequests.length === 0 && <p className="no-pending">No pending requests</p>}
            </div>
          </aside>

          {/* Main Card Swiping Area */}
          <div className="swipe-area">
            <div className="card-container">
              {currentMatch ? (
                <div className={`match-card ${animatingDir ? `swipe-${animatingDir}` : ''}`}>
                  <div className="card-image-section" style={{ backgroundImage: `url(${currentMatch.profilePictureLink || 'https://via.placeholder.com/400x500'})` }}>
                    <div className="shared-interests-badge">
                      {sharedInterestsCount} Shared interests
                    </div>
                    <div className="card-overlay">
                      <h2>{currentMatch.firstName} {currentMatch.lastName}, {currentMatch.age}</h2>
                      <span className="user-role-badge">{currentMatch.job || 'Explorer'}</span>
                    </div>
                  </div>

                  <div className="card-details-section">
                    <p className="bio-text">{currentMatch.description || "No description provided."}</p>

                    <div className="interests-section">
                      <h4>Interests</h4>
                      <div className="interests-tags">
                        {currentMatchInterests.map((interest, idx) => {
                          const isShared = currentUserInterests.includes(interest.toLowerCase());
                          return (
                            <span key={idx} className={`interest-tag ${isShared ? 'shared' : 'unshared'}`}>
                              {interest}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <button 
                      className="btn-view-profile" 
                      onClick={() => navigate(`/user/${currentMatch.userID}`)}
                    >
                      View Full Profile
                    </button>
                  </div>
                </div>
              ) : (
                <div className="no-more-matches">
                  <h3>No more matches available right now!</h3>
                  <p>Check back later or update your preferences.</p>
                </div>
              )}
            </div>

            {currentMatch && (
              <div className="action-buttons">
                <button className="action-btn reject-btn" onClick={handleReject} disabled={!!animatingDir}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>

                <button className="action-btn accept-btn" onClick={handleAccept} disabled={!!animatingDir}>
                  <svg width="45" height="45" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
