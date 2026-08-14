import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/nav.css';
import logo from '../assets/images/logo.png';

export default function AdminNavBar() {
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }) => (isActive ? 'active' : undefined);

  return (
    <nav className="ws-nav">
      <div className="ws-brand-wrap" onClick={() => navigate('/admin')}>
        <img src={logo} alt="WanderSync logo" className="brand-logo" />
        <div className="ws-brand">WanderSync</div>
      </div>
      <ul className="ws-nav-list">
        <li><NavLink to="/admin" className={navLinkClass}>Admin</NavLink></li>
      </ul>
    </nav>
  );
}
