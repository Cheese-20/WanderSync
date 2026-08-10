import React, { useState, useEffect } from 'react';
import ApplicationDetail from './ApplicationDetail';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('http://localhost:5200/api/admin/applications');
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationProcessed = (applicationId) => {
    setApplications((prev) => prev.filter((app) => app.applicationID !== applicationId));
    setSelectedApp(null);
  };

  const handleBack = () => {
    setSelectedApp(null);
  };

  if (loading) {
    return <div className="admin-loading">Loading applications...</div>;
  }

  if (selectedApp) {
    return (
      <ApplicationDetail
        application={selectedApp}
        onBack={handleBack}
        onProcessed={handleApplicationProcessed}
      />
    );
  }

  if (applications.length === 0) {
    return (
      <div className="admin-empty-state">
        <span className="empty-icon">📋</span>
        <p>No pending applications.</p>
      </div>
    );
  }

  return (
    <div className="applications-section">
      <h2>Guide Applications</h2>
      <p className="section-description">Review users who have applied to become local guides.</p>

      <div className="applications-list">
        {applications.map((app) => (
          <div key={app.applicationID} className="application-card">
            <div className="application-header">
              <div className="applicant-info">
                <h3>{app.userName}</h3>
                <span className="applicant-email">{app.email}</span>
              </div>
            </div>

            <div className="application-summary">
              <span className="summary-item">Location: {app.location || 'Not specified'}</span>
            </div>

            <div className="application-actions">
              <button
                className="btn-view"
                onClick={() => setSelectedApp(app)}
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
