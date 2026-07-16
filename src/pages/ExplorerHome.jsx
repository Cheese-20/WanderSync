import React from 'react';
import NavBar from '../components/NavBar';
import '../styles/explorer.css';

export default function ExplorerHome() {
  return (
    <div className="explorer-page">
      <NavBar />
      <header className="explorer-hero">
        <h1>Happening Today</h1>
        <p>Discover activities around you</p>
      </header>

      <section className="explorer-grid">
        <article className="card">Sunset Hike</article>
        <article className="card">Coffee Tour</article>
        <article className="card">Paddleboard Yoga</article>
      </section>

      <section className="community-feed">
        <h2>Live from the Community</h2>
        <div className="post">Example community post</div>
      </section>
    </div>
  );
}
