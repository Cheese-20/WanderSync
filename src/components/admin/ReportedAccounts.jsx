import React, { useState, useEffect } from 'react';
import ReportDetail from './ReportDetail';

export default function ReportedAccounts() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('http://localhost:5200/api/admin/reported-accounts');
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (err) {
      console.error('Error fetching reported accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReportProcessed = (reportId) => {
    setReports((prev) => prev.filter((report) => report.reportID !== reportId));
    setSelectedReport(null);
  };

  const handleBack = () => {
    setSelectedReport(null);
  };

  if (loading) {
    return <div className="admin-loading">Loading reported accounts...</div>;
  }

  if (selectedReport) {
    return (
      <ReportDetail
        report={selectedReport}
        onBack={handleBack}
        onProcessed={handleReportProcessed}
      />
    );
  }

  if (reports.length === 0) {
    return (
      <div className="admin-empty-state">
        <span className="empty-icon">🛡️</span>
        <p>No reported accounts.</p>
      </div>
    );
  }

  return (
    <div className="reported-accounts-list">
      <div className="reports-list">
        {reports.map((report) => (
          <div key={report.reportID} className="report-card">
            <div className="report-header">
              <div className="reported-user-info">
                <h3>{report.reportedUserName}</h3>
                <span className="reported-email">{report.reportedUserEmail}</span>
              </div>
              <span className={`status-badge status-${report.status.toLowerCase()}`}>
                {report.status}
              </span>
            </div>

            <div className="application-summary">
              <span className="summary-item">Reason: {report.reason}</span>
              <span className="summary-item"> | Reported: {report.sentAt ? new Date(report.sentAt).toLocaleDateString() : 'N/A'}</span>
            </div>

            {report.status === 'Pending' && (
              <div className="application-actions">
                <button
                  className="btn-view"
                  onClick={() => setSelectedReport(report)}
                >
                  View
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
