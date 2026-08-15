import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthForm from './pages/AuthForm.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ExplorerHome from './pages/ExplorerHome.jsx';
import Dashboard from './pages/Dashboard.jsx';
import GuideHome from './pages/GuideHome.jsx';
import Discover from './pages/Discover.jsx';
import Match from './pages/Match.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import Messages from './pages/Messages.jsx';
import Profile from './pages/Profile.jsx';
import Activities from './pages/Activities.jsx';
import EditActivity from './pages/EditActivity.jsx';
import AdminHome from './pages/AdminHome.jsx';
import ReportForm from './pages/ReportForm.jsx';
import LocalGuideApplication from './pages/LocalGuideApplication.jsx';
import SetupProfileModal from './components/SetupProfileModal.jsx';

function AuthWrapper({ children }) {
  const [needsSetup, setNeedsSetup] = useState(false);
  const [userId, setUserId] = useState(null);
  const location = useLocation();

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
  }, [location.pathname]);

  return (
    <>
      {children}
      {needsSetup && userId && (
        <SetupProfileModal 
          userId={userId} 
          onComplete={() => setNeedsSetup(false)} 
        />
      )}
    </>
  );
}

function HomeRouter() {
  const userJson = localStorage.getItem('user');
  if (!userJson) return <Navigate to="/login" />;
  let user = {};
  try { user = JSON.parse(userJson); } catch (e) { }
  const role = (user.role || '').toLowerCase();
  if (role.includes('admin')) return <Navigate to="/admin" />;
  if (role.includes('guide')) return <GuideHome />;
  return <ExplorerHome />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/login" element={<AuthForm />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/home" element={<AuthWrapper><HomeRouter /></AuthWrapper>} />
        <Route path="/dashboard" element={<AuthWrapper><Dashboard /></AuthWrapper>} />
        <Route path="/discover" element={<AuthWrapper><Discover /></AuthWrapper>} />
        <Route path="/match" element={<AuthWrapper><Match /></AuthWrapper>} />
        <Route path="/explore" element={<AuthWrapper><ExplorePage /></AuthWrapper>} />
        <Route path="/messages" element={<AuthWrapper><Messages /></AuthWrapper>} />
        <Route path="/profile" element={<AuthWrapper><Profile /></AuthWrapper>} />
        <Route path="/activities" element={<AuthWrapper><Activities /></AuthWrapper>} />
        <Route path="/edit-activity/:id" element={<AuthWrapper><EditActivity /></AuthWrapper>} />
        <Route path="/admin" element={<AuthWrapper><AdminHome /></AuthWrapper>} />
        <Route path="/report" element={<AuthWrapper><ReportForm /></AuthWrapper>} />
        <Route path="/local-guide-application" element={<AuthWrapper><LocalGuideApplication /></AuthWrapper>} />
        <Route path="/apply-guide" element={<AuthWrapper><LocalGuideApplication /></AuthWrapper>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
