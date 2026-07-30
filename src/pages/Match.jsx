import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavBar from '../components/NavBar';
import '../styles/match.css';

export default function Match() {
  const [matches, setMatches] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pendingRequests, setPendingRequests] = useState([
    // Mock pending requests since we don't have this in the DB yet
    { id: 101, name: 'Alice, 26', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop' },
    { id: 102, name: 'David, 31', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop' }
  ]);
  const [animatingDir, setAnimatingDir] = useState(null); // 'left' or 'right'

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const userJson = localStorage.getItem('user');
        let currentUserId = 0;
        if (userJson) {
          const user = JSON.parse(userJson);
          currentUserId = user.id || user.userID || 0;
        }
        
        if (currentUserId) {
          const response = await axios.get(`/api/profile/matches/${currentUserId}`);
          if (response.data && response.data.length > 0) {
            setMatches(response.data);
          } else {
            setMatches(getMockMatches());
          }
        } else {
           setMatches(getMockMatches());
        }
      } catch (err) {
        console.warn('Could not fetch matches, falling back to mock data', err);
        setMatches(getMockMatches());
      }
    };
    
    fetchMatches();
  }, []);

  const getMockMatches = () => [
    {
      userID: 1,
      firstName: 'Bob Joe',
      lastName: '',
      age: 28,
      job: 'Digital Nomad',
      description: 'Love exploring hidden cafes and street art. Always up for a spontaneous hike!',
      interests: 'Photography, Coffee Shops, Hiking, Street Art, Beaches',
      profilePictureLink: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop'
    },
    {
      userID: 2,
      firstName: 'Sarah',
      lastName: 'Smith',
      age: 25,
      job: 'Travel Photographer',
      description: 'Foodie and sunset lover. Let\'s find the best local eats!',
      interests: 'Food, Sunset, Culture',
      profilePictureLink: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop'
    }
  ];

  const handleAction = (direction) => {
    if (currentIndex >= matches.length) return;
    
    setAnimatingDir(direction);
    
    // Wait for animation to finish before moving to next card
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setAnimatingDir(null);
    }, 400); // 400ms matches the CSS transition
  };

  const handleReject = () => handleAction('left');
  const handleAccept = () => handleAction('right');

  const currentMatch = matches[currentIndex];

  return (
    <div className="match-page">
      <NavBar />
      
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
                <div key={req.id} className="pending-item">
                  <img src={req.image} alt={req.name} className="pending-img" />
                  <span className="pending-name">{req.name}</span>
                  <button className="pending-btn accept">✓</button>
                  <button className="pending-btn reject">✕</button>
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
                      {Math.floor(Math.random() * 3) + 1} Shared interests
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
                        {(currentMatch.interests ? currentMatch.interests.split(',') : ['Travel']).map((interest, idx) => (
                          <span key={idx} className={`interest-tag ${idx < 2 ? 'primary' : 'secondary'}`}>
                            {interest.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
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
