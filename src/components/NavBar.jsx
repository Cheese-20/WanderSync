import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/nav.css';

export default function NavBar() {
  return (
    <nav className="ws-nav">
      <div className="ws-brand">WanderSync</div>
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
