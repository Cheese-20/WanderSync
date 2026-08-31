import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthForm from './pages/AuthForm.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ExplorerHome from './pages/ExplorerHome.jsx';
import Dashboard from './pages/Dashboard.jsx';
import GuideHome from './pages/GuideHome.jsx';
import GuideDetail from './pages/GuideDetail.jsx';
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
import ManageItinerary from './pages/ManageItinerary.jsx';
import MyActivities from './pages/MyActivities.jsx';
import SetupProfileModal from './components/SetupProfileModal.jsx';
import { getActiveMode, isLoggedIn, isVerifiedGuide, MODE_ADMIN, MODE_GUIDE } from './utils/session';

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
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  const mode = getActiveMode();
  if (mode === MODE_ADMIN) return <Navigate to="/admin" replace />;
  if (mode === MODE_GUIDE) return <GuideHome />;
  return <ExplorerHome />;
}

/**
 * Restricts a route to a single mode. A verified guide browsing in explorer mode is
 * bounced off guide-only pages just like a plain explorer would be.
 */
function RequireMode({ mode, children }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  const active = getActiveMode();
  if (active === mode) return children;
  if (active === MODE_ADMIN) return <Navigate to="/admin" replace />;
  return <Navigate to="/home" replace />;
}

/** Already-approved guides have nothing to apply for. */
function ApplyGuideRoute() {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  if (isVerifiedGuide()) return <Navigate to="/profile" replace />;
  return <LocalGuideApplication />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/login" element={<AuthForm />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/home" element={<AuthWrapper><HomeRouter /></AuthWrapper>} />

        {/* Shared */}
        <Route path="/messages" element={<AuthWrapper><Messages /></AuthWrapper>} />
        <Route path="/profile" element={<AuthWrapper><Profile /></AuthWrapper>} />
        <Route path="/match" element={<AuthWrapper><Match /></AuthWrapper>} />
        <Route path="/report" element={<AuthWrapper><ReportForm /></AuthWrapper>} />

        {/* Explorer pages */}
        <Route path="/discover" element={<AuthWrapper><Discover /></AuthWrapper>} />
        <Route path="/explore" element={<AuthWrapper><ExplorePage /></AuthWrapper>} />
        <Route path="/guide/:guideId" element={<AuthWrapper><GuideDetail /></AuthWrapper>} />
        <Route path="/my-activities" element={<AuthWrapper><MyActivities /></AuthWrapper>} />
        <Route path="/local-guide-application" element={<AuthWrapper><ApplyGuideRoute /></AuthWrapper>} />
        <Route path="/apply-guide" element={<AuthWrapper><ApplyGuideRoute /></AuthWrapper>} />

        {/* Guide-only pages: hidden from explorer mode */}
        <Route path="/dashboard" element={<AuthWrapper><RequireMode mode={MODE_GUIDE}><Dashboard /></RequireMode></AuthWrapper>} />
        <Route path="/activities" element={<AuthWrapper><RequireMode mode={MODE_GUIDE}><Activities /></RequireMode></AuthWrapper>} />
        <Route path="/edit-activity/:id" element={<AuthWrapper><RequireMode mode={MODE_GUIDE}><EditActivity /></RequireMode></AuthWrapper>} />
        <Route path="/manage-itinerary/:touristId" element={<AuthWrapper><RequireMode mode={MODE_GUIDE}><ManageItinerary /></RequireMode></AuthWrapper>} />

        {/* Admin only */}
        <Route path="/admin" element={<AuthWrapper><RequireMode mode={MODE_ADMIN}><AdminHome /></RequireMode></AuthWrapper>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
