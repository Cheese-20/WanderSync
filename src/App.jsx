import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthForm from './pages/AuthForm.jsx';
import ExplorerHome from './pages/ExplorerHome.jsx';
import GuideHome from './pages/GuideHome.jsx';
import AdminHome from './pages/AdminHome.jsx';
import Match from './pages/Match.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import Messages from './pages/Messages.jsx';
import Profile from './pages/Profile.jsx';
import LocalGuideApplication from './pages/LocalGuideApplication.jsx';
import Activities from './pages/Activities.jsx';
import EditActivity from './pages/EditActivity.jsx';
import Dashboard from './pages/Dashboard.jsx';
import GuideDetail from './pages/GuideDetail.jsx';
import Discover from './pages/Discover.jsx';
import Layout from './components/Layout.jsx';

function HomeRouter() {
  const userJson = localStorage.getItem('user');
  if (!userJson) return <Navigate to="/login" />;
  let user = {};
  try { user = JSON.parse(userJson); } catch (e) { }
  const role = (user.role || '').toLowerCase();
  if (role === 'admin') return <AdminHome />;
  if (role.includes('guide')) return <GuideHome />;
  return <ExplorerHome />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthForm />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route element={<Layout />}>
          <Route path="/home" element={<HomeRouter />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/match" element={<Match />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/edit-activity/:id" element={<EditActivity />} />
          <Route path="/apply-guide" element={<LocalGuideApplication />} />
          <Route path="/guide/:guideId" element={<GuideDetail />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
