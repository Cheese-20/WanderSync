import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/nav.css';
import logo from '../assets/images/logo.png';

export default function NavBar() {
  const navigate = useNavigate();

  return (
    <nav className="ws-nav">
      <div className="ws-brand-wrap" onClick={() => navigate('/home')}>
        <img src={logo} alt="WanderSync logo" className="brand-logo" />
        <div className="ws-brand">WanderSync</div>
      </div>
      <ul className="ws-nav-list">
        <li><NavLink to="/discover">Discover</NavLink></li>
        <li><NavLink to="/match">Match</NavLink></li>
        <li><NavLink to="/explore">Explore</NavLink></li>
        <li><NavLink to="/messages">Messages</NavLink></li>
        <li><NavLink to="/profile">Profile</NavLink></li>
      </ul>
    </nav>
  );
}
