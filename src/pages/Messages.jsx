import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import NavBar from '../components/NavBar';
import '../styles/messages.css';

export default function Messages() {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  
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

  const selectContact = async (contact) => {
    setActiveContact(contact);
    try {
      // Fetch messages for this match
      const res = await axios.get(`/api/message/chat/${contact.matchID}`);
      if (res.data) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error("Error fetching messages", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeContact || !currentUserId) return;

    try {
      const payload = {
        matchID: activeContact.matchID,
        senderID: currentUserId,
        receiverID: activeContact.userID,
        textMessage: inputText.trim()
      };
      
      const res = await axios.post('/api/message', payload);
      
      if (res.data) {
        // Because messages are sorted DESC (newest first), we prepend the new message to the top of the array
        setMessages(prev => [res.data, ...prev]);
        setInputText('');
      }
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
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
                {messages.map(msg => {
                  const isSentByMe = msg.senderID === currentUserId;
                  return (
                    <div key={msg.mID} className={`message-bubble ${isSentByMe ? 'message-sent' : 'message-received'}`}>
                      {msg.textMessage}
                      <span className="message-time">{formatTime(msg.sentAt)}</span>
                    </div>
                  );
                })}
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
