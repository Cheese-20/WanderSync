import React, { useState } from 'react';
import ReportedAccounts from './ReportedAccounts';
import ReportedSpots from './ReportedSpots';

export default function Reports() {
  const [activeSection, setActiveSection] = useState('accounts');

  return (
    <div className="reports-section">
      <h2>Reports</h2>
      <p className="section-description">Review reported accounts and spots.</p>

      <div className="reports-sub-tabs">
        <button
          className={`sub-tab-btn ${activeSection === 'accounts' ? 'active' : ''}`}
          onClick={() => setActiveSection('accounts')}
        >
          Reported Accounts
        </button>
        <button
          className={`sub-tab-btn ${activeSection === 'spots' ? 'active' : ''}`}
          onClick={() => setActiveSection('spots')}
        >
          Reported Spots
        </button>
      </div>

      {activeSection === 'accounts' && <ReportedAccounts />}
      {activeSection === 'spots' && <ReportedSpots />}
    </div>
  );
}
