import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthForm from './pages/AuthForm.jsx';
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
        <Route path="/login" element={<AuthForm />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/home" element={<HomeRouter />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/match" element={<Match />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/edit-activity/:id" element={<EditActivity />} />
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/report" element={<ReportForm />} />
        <Route path="/local-guide-application" element={<LocalGuideApplication />} />
        <Route path="/apply-guide" element={<LocalGuideApplication />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
