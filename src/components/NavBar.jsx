import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/nav.css';
import logo from '../assets/images/logo.png';

export default function NavBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) => (isActive ? 'active' : undefined);

  return (
    <nav className="ws-nav">
      <div className="ws-brand-wrap" onClick={() => navigate('/home')}>
        <img src={logo} alt="WanderSync logo" className="brand-logo" />
        <div className="ws-brand">WanderSync</div>
      </div>
      <ul className="ws-nav-list">
        <li><NavLink to="/match" className={navLinkClass}>Match</NavLink></li>
        <li><NavLink to="/explore" className={navLinkClass}>Explore</NavLink></li>
        <li><NavLink to="/messages" className={navLinkClass}>Messages</NavLink></li>
        <li><NavLink to="/profile" className={navLinkClass}>Profile</NavLink></li>
        <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>
      </ul>
    </nav>
  );
}
