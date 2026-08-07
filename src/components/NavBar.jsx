import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/nav.css';
import logo from '../assets/images/logo.png';

export default function NavBar() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      const userId = user.id || user.userID;
      if (userId) {
        try {
          const res = await axios.get(`/api/notification/${userId}`);
          setNotifications(res.data);
        } catch (e) {
          console.error("Error fetching notifications", e);
        }
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await axios.put(`/api/notification/read/${notif.notificationID}`);
        setNotifications(prev => prev.map(n => n.notificationID === notif.notificationID ? { ...n, isRead: true } : n));
      } catch (e) {
        console.error("Error marking read", e);
      }
    }
    setShowDropdown(false);
    
    if (notif.type === "NewMessage") {
      navigate('/messages');
    } else if (notif.type === "MatchRequest" || notif.type === "MatchAccepted") {
      navigate('/match');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const navLinkClass = ({ isActive }) => (isActive ? 'active' : undefined);

  return (
    <nav className="ws-nav">
      <div className="ws-brand-wrap" onClick={() => navigate('/home')}>
        <img src={logo} alt="WanderSync logo" className="brand-logo" />
        <div className="ws-brand">WanderSync</div>
      </div>
      <ul className="ws-nav-list">
        <li><NavLink to="/explore" className={navLinkClass}>Explore</NavLink></li>
        <li><NavLink to="/match" className={navLinkClass}>Match</NavLink></li>
        <li><NavLink to="/messages" className={navLinkClass}>Messages</NavLink></li>
        <li><NavLink to="/profile" className={navLinkClass}>Profile</NavLink></li>
        
        <li className="notification-container" ref={dropdownRef}>
          <div className="notification-bell" onClick={() => setShowDropdown(!showDropdown)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </div>
          
          {showDropdown && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h4>Notifications</h4>
              </div>
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="notification-empty">No notifications</div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.notificationID} 
                      className={`notification-item ${!n.isRead ? 'unread' : ''}`}
                      onClick={() => handleNotificationClick(n)}
                    >
                      <p>{n.message}</p>
                      <span className="notification-time">{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
}
