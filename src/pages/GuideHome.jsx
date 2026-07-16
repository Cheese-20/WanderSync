import React from 'react';
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
      </section>
    </div>
  );
}
