import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

import '../styles/messages.css';

export default function Messages() {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  
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
    try {
      const res = await axios.get(`/api/message/contacts/${userId}`);
      if (res.data) {
        setContacts(res.data);
      }
    } catch (err) {
      console.error("Error fetching contacts", err);
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

      
      <div className="messages-layout">
        {/* Contacts Sidebar */}
        <aside className="contacts-sidebar">
          <div className="contacts-header">
            <h2>Connections</h2>
          </div>
          
          <div className="contacts-list">
            {contacts.length === 0 ? (
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
                    <span className="contact-name">{contact.firstName} {contact.lastName}</span>
                    <span className="contact-job">{contact.job || 'Explorer'}</span>
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
                <span className="chat-header-name">{activeContact.firstName} {activeContact.lastName}</span>
              </div>
              
              <div className="messages-list">
                <div style={{ marginTop: 'auto' }}></div>
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
