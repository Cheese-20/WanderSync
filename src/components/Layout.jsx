import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import axios from 'axios';
import NavBar from './NavBar';
import SetupProfileModal from './SetupProfileModal';

export default function Layout() {
  const [needsSetup, setNeedsSetup] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const checkProfile = async () => {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        try {
          const user = JSON.parse(userJson);
          const uid = user.id || user.userID;
          if (uid) {
            setUserId(uid);
            await axios.get(`/api/profile/${uid}`);
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            setNeedsSetup(true);
          }
        }
      }
    };
    checkProfile();
  }, []);

  return (
    <div className="ws-layout">
      <NavBar />
      <main className="ws-layout-content">
        <Outlet />
      </main>
      {needsSetup && userId && (
        <SetupProfileModal 
          userId={userId} 
          onComplete={() => setNeedsSetup(false)} 
        />
      )}
    </div>
  );
}
