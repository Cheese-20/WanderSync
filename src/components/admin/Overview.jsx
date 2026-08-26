import React, { useState, useEffect } from 'react';

export default function Overview() {
  const [newProfiles, setNewProfiles] = useState(null);
  const [reportedAccounts, setReportedAccounts] = useState(null);
  const [activeUsers, setActiveUsers] = useState(null);
  const [topExperiences, setTopExperiences] = useState(null);
  const [topGuides, setTopGuides] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeReport, setActiveReport] = useState(null);

  const generateReport = async (reportType) => {
    setLoading(true);
    setActiveReport(reportType);
    try {
      const response = await fetch(`http://localhost:5200/api/admin/reports/${reportType}`);
      if (response.ok) {
        const data = await response.json();
        switch (reportType) {
          case 'new-profiles':
            setNewProfiles(data);
            break;
          case 'reported-accounts':
            setReportedAccounts(data);
            break;
          case 'active-users':
            setActiveUsers(data);
            break;
          case 'top-experiences':
            setTopExperiences(data);
            break;
          case 'top-guides':
            setTopGuides(data);
            break;
        }
      }
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setLoading(false);
    }
  };

  const reportCards = [
    { key: 'new-profiles', title: 'Number of New Profiles Created', icon: '👤' },
    { key: 'reported-accounts', title: 'Reported Accounts', icon: '⚠️' },
    { key: 'active-users', title: 'Number of Active Users', icon: '✅' },
    { key: 'top-experiences', title: 'Top Rated Experiences', icon: '⭐' },
    { key: 'top-guides', title: 'Top Rated Local Guides', icon: '🏆' },
  ];

  const renderReportResult = () => {
    if (loading) return <p className="report-loading">Generating report...</p>;

    switch (activeReport) {
      case 'new-profiles':
        return newProfiles && (
          <div className="report-result">
            <h3>{newProfiles.reportType}</h3>
            <p className="report-stat">{newProfiles.count}</p>
            <span className="report-period">{newProfiles.period}</span>
            {newProfiles.data && newProfiles.data.length > 0 && (
              <ul className="report-list" style={{ marginTop: '16px' }}>
                {newProfiles.data.map((profile) => (
                  <li key={profile.userID} className="report-list-item">
                    <strong>{profile.firstName} {profile.lastName}</strong>
                    <span className="report-tag">{profile.role}</span>
                    <p>{profile.email} {profile.location ? `• ${profile.location}` : ''}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      case 'reported-accounts':
        return reportedAccounts && (
          <div className="report-result">
            <h3>{reportedAccounts.reportType}</h3>
            <p className="report-stat">{reportedAccounts.total}</p>
            <span className="report-period">Pending: {reportedAccounts.pending}</span>
          </div>
        );
      case 'active-users':
        return activeUsers && (
          <div className="report-result">
            <h3>{activeUsers.reportType}</h3>
            <p className="report-stat">{activeUsers.count}</p>
            {activeUsers.data && activeUsers.data.length > 0 && (
              <ul className="report-list" style={{ marginTop: '16px' }}>
                {activeUsers.data.map((user) => (
                  <li key={user.userID} className="report-list-item">
                    <strong>{user.firstName} {user.lastName}</strong>
                    <span className="report-tag">{user.role}</span>
                    <p>{user.email}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      case 'top-experiences':
        return topExperiences && (
          <div className="report-result">
            <h3>{topExperiences.reportType}</h3>
            <ul className="report-list">
              {topExperiences.data.map((exp) => (
                <li key={exp.tourId} className="report-list-item">
                  <strong>{exp.title}</strong>
                  <span className="report-tag">{exp.type}</span>
                  <p>{exp.description}</p>
                </li>
              ))}
              {topExperiences.data.length === 0 && <li>No experiences found.</li>}
            </ul>
          </div>
        );
      case 'top-guides':
        return topGuides && (
          <div className="report-result">
            <h3>{topGuides.reportType}</h3>
            <ul className="report-list">
              {topGuides.data.map((guide) => (
                <li key={guide.userID} className="report-list-item">
                  <strong>{guide.firstName} {guide.lastName}</strong>
                  <span className="report-tag">{guide.location || 'No location'}</span>
                  <p>{guide.email}</p>
                  <p style={{ fontSize: '0.85rem', color: '#666' }}>{guide.description || 'No description'}</p>
                </li>
              ))}
              {topGuides.data.length === 0 && <li>No guides found.</li>}
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="overview-section">
      <h2>System Activity Reports</h2>
      <p className="overview-description">Select a report to generate:</p>

      <div className="report-cards">
        {reportCards.map((card) => (
          <button
            key={card.key}
            className={`report-card ${activeReport === card.key ? 'active' : ''}`}
            onClick={() => generateReport(card.key)}
          >
            <span className="report-card-icon">{card.icon}</span>
            <span className="report-card-title">{card.title}</span>
          </button>
        ))}
      </div>

      <div className="report-output">
        {renderReportResult()}
        {!activeReport && <p className="report-placeholder">Click a report card above to generate a report.</p>}
      </div>
    </div>
  );
}
