import React, { useState } from 'react';
import {
  UserIcon,
  CheckCircleIcon,
  StarIcon,
  TrophyIcon,
} from '../icons/AdminIcons.jsx';

/** Blank rather than "0" when a window function has no value to report. */
const pct = (value) => (value === null || value === undefined ? '—' : `${value}%`);

const money = (value) =>
  value === null || value === undefined
    ? '—'
    : `R ${Number(value).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Overview() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeReport, setActiveReport] = useState(null);
  const [error, setError] = useState('');

  const generateReport = async (reportType) => {
    setLoading(true);
    setActiveReport(reportType);
    setError('');
    try {
      const response = await fetch(`/api/admin/reports/${reportType}`);
      if (!response.ok) throw new Error(`Report failed (${response.status})`);
      const data = await response.json();
      setResults((prev) => ({ ...prev, [reportType]: data }));
    } catch (err) {
      console.error('Error generating report:', err);
      setError(err.message || 'Could not generate this report.');
    } finally {
      setLoading(false);
    }
  };

  // `accent` tints the icon via CSS `color`, which the SVG picks up through
  // `currentColor`. Muted tones keep the cards scannable without clashing with
  // the green project palette.
  const reportCards = [
    { key: 'new-profiles', title: 'Number of New Profiles Created', Icon: UserIcon, accent: '#3d5a3e' },
    { key: 'active-users', title: 'Number of Active Users', Icon: CheckCircleIcon, accent: '#2e7d32' },
    { key: 'top-experiences', title: 'Top Rated Experiences', Icon: StarIcon, accent: '#a67c1a' },
    { key: 'guide-leaderboard', title: 'Guide Performance Leaderboard', Icon: TrophyIcon, accent: '#8a6a34' },
  ];

  // ===== Renderers =====

  const renderNewProfiles = (r) => (
    <>
      <p className="report-stat">{r.count}</p>
      <span className="report-period">{r.period}</span>
      {r.data?.length > 0 && (
        <ul className="report-list" style={{ marginTop: '16px' }}>
          {r.data.map((p) => (
            <li key={p.userID} className="report-list-item">
              <strong>{p.firstName} {p.lastName}</strong>
              <span className="report-tag">{p.role}</span>
              <p>{p.email}{p.location ? ` • ${p.location}` : ''}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );

  const renderActiveUsers = (r) => (
    <>
      <p className="report-stat">{r.count}</p>
      {r.data?.length > 0 && (
        <ul className="report-list" style={{ marginTop: '16px' }}>
          {r.data.map((u) => (
            <li key={u.userID} className="report-list-item">
              <strong>{u.firstName} {u.lastName}</strong>
              <span className="report-tag">{u.role}</span>
              <p>{u.email}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );

  const renderTopExperiences = (r) => (
    <ul className="report-list">
      {r.data?.map((e) => (
        <li key={e.tourId} className="report-list-item">
          <strong>{e.title}</strong>
          <span className="report-tag">{e.type}</span>
          <p>{e.description}</p>
        </li>
      ))}
      {r.data?.length === 0 && <li>No experiences found.</li>}
    </ul>
  );

  /** Guide performance leaderboard. */
  const renderLeaderboard = (r) => (
    <>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Guide</th>
              <th>Location</th>
              <th className="num">Weighted<br />rating</th>
              <th className="num">Reviews</th>
              <th className="num">Tours</th>
              <th className="num">Bookings</th>
              <th className="num">Accepted</th>
              <th className="num">Guests</th>
              <th className="num">Confirmed revenue</th>
              <th className="num">Revenue<br />share</th>
              <th className="num">Reports</th>
            </tr>
          </thead>
          <tbody>
            {r.data?.map((g) => (
              <tr key={g.userID}>
                <td className="rank-cell">{g.rankPosition}</td>
                <td>
                  <strong>{g.firstName} {g.lastName}</strong>
                  <span className="cell-sub">{g.email}</span>
                </td>
                <td>{g.location || '—'}</td>
                <td className="num"><strong>{g.weightedRating}</strong></td>
                <td className="num">{g.reviewCount}{g.avgRating ? ` (${g.avgRating})` : ''}</td>
                <td className="num">{g.tourCount}</td>
                <td className="num">{g.bookingCount}</td>
                <td className="num">{g.acceptedBookings}</td>
                <td className="num">{g.totalGuests}</td>
                <td className="num">{money(g.confirmedRevenue)}</td>
                <td className="num">{pct(g.revenueSharePct)}</td>
                <td className="num">
                  {g.pendingReports > 0
                    ? <span className="cell-flag">{g.pendingReports}</span>
                    : '0'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {r.data?.length === 0 && <p className="report-placeholder">No guides found.</p>}
      {r.data?.length > 0 && (
        <p className="report-footnote">
          Platform average weighted rating: <strong>{r.data[0].platformAvgRating}</strong> across{' '}
          <strong>{r.data[0].platformBookings}</strong> bookings. Ratings are shrunk toward the
          platform mean so a guide with very few reviews cannot top the table on a single score.
        </p>
      )}
    </>
  );

  const renderReportResult = () => {
    if (loading) return <p className="report-loading">Generating report...</p>;
    if (error) return <p className="detail-error">{error}</p>;

    const r = results[activeReport];
    if (!r) return null;

    const body = {
      'new-profiles': renderNewProfiles,
      'active-users': renderActiveUsers,
      'top-experiences': renderTopExperiences,
      'guide-leaderboard': renderLeaderboard,
    }[activeReport];

    return (
      <div className="report-result">
        <h3>{r.reportType}</h3>
        {body ? body(r) : null}
      </div>
    );
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
            <span className="report-card-icon" style={{ color: card.accent }}>
              <card.Icon size={28} />
            </span>
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
