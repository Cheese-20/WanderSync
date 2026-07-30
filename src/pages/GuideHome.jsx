import React from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import '../styles/guide.css';

export default function GuideHome() {
  return (
    <div className="guide-page">
      <NavBar />
      <header className="guide-hero">
        <h1>Welcome back, Guide</h1>
        <p>Overview of your dashboard</p>
      </header>

      <section className="guide-actions">
        <div className="panel">Upcoming Bookings</div>
        <div className="panel">Quick Actions</div>
        <Link to="/activities" className="panel" style={{ textDecoration: 'none', color: 'inherit', display: 'block', textAlign: 'center', background: '#007bff', color: 'white' }}>
          Manage Activities
        </Link>
      </section>
    </div>
  );
}
