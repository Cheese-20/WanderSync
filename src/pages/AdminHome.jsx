import React, { useState } from 'react';
import AdminNavBar from '../components/AdminNavBar';
import Overview from '../components/admin/Overview';
import Applications from '../components/admin/Applications';
import Reports from '../components/admin/Reports';
import '../styles/admin.css';

export default function AdminHome() {
  const [activeTab, setActiveTab] = useState('overview');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'applications':
        return <Applications />;
      case 'reports':
        return <Reports />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="admin-page">
      <AdminNavBar />
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
      </header>

      <nav className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          Applications
        </button>
        <button
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </button>
      </nav>

      <main className="admin-content">
        {renderTabContent()}
      </main>
    </div>
  );
}
