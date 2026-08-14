import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../components/NavBar';
import logo from '../assets/images/logo.png';

import '../styles/messages.css';

export default function Messages() {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      const userId = user.id || user.userID || 0;
      setCurrentUserId(userId);
      fetchContacts(userId);
    }
  }, []);

  const fetchContacts = async (userId) => {
    setLoadingContacts(true);
    try {
      const res = await axios.get(`/api/message/contacts/${userId}`);
      if (res.data) {
        setContacts(res.data);
      }
    } catch (err) {
      console.error("Error fetching contacts", err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const fetchMessages = async (matchID) => {
    try {
      const res = await axios.get(`/api/message/chat/${matchID}`);
      if (res.data) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error("Error fetching messages", err);
    }
  };

  const selectContact = (contact) => {
    setActiveContact(contact);
    fetchMessages(contact.matchID);
  };

  // Polling mechanism for "faster" real-time updates
  useEffect(() => {
    let interval;
    if (activeContact) {
      interval = setInterval(() => {
        fetchMessages(activeContact.matchID);
      }, 5000); // poll every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    }
  }, [activeContact]);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || !activeContact || !currentUserId) return;

    // 1. Optimistic UI Update: Show message immediately and clear input
    const optimisticMsg = {
      mID: Date.now(), // Temp ID
      matchID: activeContact.matchID,
      senderID: currentUserId,
      receiverID: activeContact.userID,
      textMessage: text,
      sentAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setInputText('');

    try {
      const payload = {
        matchID: activeContact.matchID,
        senderID: currentUserId,
        receiverID: activeContact.userID,
        textMessage: text
      };
      
      const res = await axios.post('/api/message', payload);
      
      if (res.data) {
        // 2. Replace temporary message with the real server response
        setMessages(prev => prev.map(msg => msg.mID === optimisticMsg.mID ? res.data : msg));
      }
    } catch (err) {
      console.error("Error sending message", err);
      // Optional: If it fails, remove the optimistic message
      setMessages(prev => prev.filter(msg => msg.mID !== optimisticMsg.mID));
    }
  };

  const formatTime = (isoString) => {
    // Ensure the browser knows this is UTC time if the server omitted the 'Z'
    const utcString = isoString.endsWith('Z') ? isoString : `${isoString}Z`;
    const date = new Date(utcString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="messages-page">
      <NavBar />

      
      <div className="messages-layout">
        {/* Contacts Sidebar */}
        <aside className="contacts-sidebar">
          <div className="contacts-header">
            <h2>Connections</h2>
          </div>
          
          <div className="contacts-list">
            {loadingContacts ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '4rem 1rem', height: '100%' }}>
                <img src={logo} alt="Loading" style={{ width: '45px', height: 'auto', animation: 'pulse 1.5s infinite', marginBottom: '12px' }} />
                <span style={{ color: '#10b981', fontSize: '0.95rem', fontWeight: '500' }}>Fetching connections...</span>
              </div>
            ) : contacts.length === 0 ? (
              <div className="no-contacts">
                <p>No connections yet.</p>
                <p>Start matching to chat!</p>
              </div>
            ) : (
              contacts.map(contact => (
                <div 
                  key={contact.userID} 
                  className={`contact-item ${activeContact?.userID === contact.userID ? 'active' : ''}`}
                  onClick={() => selectContact(contact)}
                >
                  <img src={contact.profilePictureLink} alt={contact.firstName} className="contact-avatar" />
                  <div className="contact-info">
                    <span className="contact-name" style={{ display: 'flex', alignItems: 'center' }}>
                      {contact.firstName} {contact.lastName}
                      {(contact.role?.toLowerCase() === 'guide' || contact.role?.toLowerCase() === 'local guide') && (
                        <svg title="Verified Local Guide" style={{ marginLeft: '4px', color: '#10b981', flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12zm-13 5l-4-4 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      )}
                    </span>
                    <span className="contact-job">{contact.job || (contact.role?.toLowerCase() === 'guide' ? 'Local Guide' : contact.role)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Chat Area */}
        <div className="chat-area">
          {!activeContact ? (
            <div className="chat-empty">
              Select a connection to start messaging
            </div>
          ) : (
            <>
              <div className="chat-header">
                <img src={activeContact.profilePictureLink} alt={activeContact.firstName} className="chat-header-avatar" />
                <span 
                  className="chat-header-name clickable-name" 
                  onClick={() => navigate(`/user/${activeContact.userID}`)}
                  title="View profile"
                >
                  {activeContact.firstName} {activeContact.lastName}
                </span>
                <button 
                  className="btn-view-chat-profile" 
                  onClick={() => navigate(`/user/${activeContact.userID}`)}
                >
                  View Profile
                </button>
                <span className="chat-header-name" style={{ display: 'flex', alignItems: 'center' }}>
                  {activeContact.firstName} {activeContact.lastName}
                  {(activeContact.role?.toLowerCase() === 'guide' || activeContact.role?.toLowerCase() === 'local guide') && (
                    <svg title="Verified Local Guide" style={{ marginLeft: '6px', color: '#10b981', flexShrink: 0 }} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12zm-13 5l-4-4 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  )}
                </span>
              </div>
              
              <div className="messages-list">
                <div className="messages-spacer-auto"></div>
                {messages.map(msg => {
                  const isSentByMe = msg.senderID === currentUserId;
                  return (
                    <div key={msg.mID} className={`message-bubble ${isSentByMe ? 'message-sent' : 'message-received'}`}>
                      {msg.textMessage}
                      <span className="message-time">{formatTime(msg.sentAt)}</span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              
              <form className="chat-input-area" onSubmit={handleSendMessage}>
                <div className="input-wrapper">
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <button type="submit" className="chat-send-btn" aria-label="Send message">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
