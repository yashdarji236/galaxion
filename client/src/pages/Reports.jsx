import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { API_BASE_URL } from '../config';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [craters, setCraters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportsAndCraters = async () => {
      try {
        const [reportsRes, cratersRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/reports`),
          axios.get(`${API_BASE_URL}/api/craters`)
        ]);
        setReports(reportsRes.data);
        setCraters(cratersRes.data);
      } catch (err) {
        console.error('Error fetching historical mission logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportsAndCraters();
  }, []);

  const handleDownloadReport = (report) => {
    const payload = {
      mission: 'Galaxion Saved Mission Log',
      reportId: report._id,
      timestamp: report.timestamp,
      crater: report.craterId,
      parameters: {
        cpr_threshold: report.cpr_used,
        dop_threshold: report.dop_used
      },
      metrics: {
        iceVolume_m3: report.iceVolume_m3,
        confidence_margin_m3: report.confidence_interval,
        landingScore: report.landingScore,
        terrainSafety: report.terrainSafety
      },
      status: report.status,
      compiler: 'ISRO BAH 2026 - PS08 - Team Galaxion'
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `galaxion-saved-report-${report._id.substring(18)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="app-page-layout">
      <Navbar />

      <div className="main-viewport">
        {/* Render standard Sidebar */}
        <Sidebar craters={craters} />

        <main className="center-content-panel full-width-page">
          <div className="page-header-card">
            <h2 className="page-title">Saved Mission Reports & Run Logs</h2>
            <p className="page-subtitle">Historical records of simulated lunar radar classifications and landing site scorings.</p>
          </div>

          {loading ? (
            <div className="panel-loading-wrapper">
              <span className="spinner-icon large"></span>
              <p>Syncing report database logs...</p>
            </div>
          ) : (
            <div className="reports-gallery-grid">
              {reports.length > 0 ? (
                reports.map((report) => {
                  const dateStr = new Date(report.timestamp).toLocaleString();
                  const isSafe = report.terrainSafety?.overallStatus === 'SAFE FOR LANDING';
                  return (
                    <div key={report._id} className="report-log-card">
                      <div className="report-card-header">
                        <div className="report-header-text">
                          <h3>{report.craterId?.name || 'Unknown Crater Target'}</h3>
                          <span className="report-date-tag">{dateStr}</span>
                        </div>
                        <span className="status-badge badge-safe">
                          {report.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="report-card-body">
                        <div className="report-parameter-subgrid">
                          <div className="param-item">
                            <span className="label">CPR Threshold:</span>
                            <span className="val">{report.cpr_used.toFixed(2)}</span>
                          </div>
                          <div className="param-item">
                            <span className="label">DOP Threshold:</span>
                            <span className="val">{report.dop_used.toFixed(3)}</span>
                          </div>
                        </div>

                        <div className="report-divider"></div>

                        <div className="report-metrics-subgrid">
                          <div className="metric-box">
                            <span className="label">ICE VOLUME</span>
                            <span className="val font-large">{(report.iceVolume_m3 / 1000000).toFixed(2)}M m³</span>
                          </div>
                          <div className="metric-box">
                            <span className="label">LANDING SCORE</span>
                            <span className="val font-large orange-highlight">{report.landingScore.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="report-divider"></div>

                        <div className="report-terrain-summary">
                          <h4>TERRAIN SUMMARY</h4>
                          <ul>
                            <li>Slope: <strong className="green-highlight">{report.terrainSafety?.slope}°</strong></li>
                            <li>Boulders: <strong className="green-highlight">{report.terrainSafety?.boulderDensity}</strong></li>
                            <li>Roughness: <strong className="orange-highlight">{report.terrainSafety?.surfaceRoughness}</strong></li>
                            <li>Overall: <strong className={isSafe ? 'green-highlight' : 'red-highlight'}>{report.terrainSafety?.overallStatus}</strong></li>
                          </ul>
                        </div>
                      </div>

                      <div className="report-card-footer">
                        <button
                          className="action-btn report-download-btn"
                          onClick={() => handleDownloadReport(report)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="btn-icon">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          Download JSON Report
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="reports-empty-state">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="empty-icon">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  <h3>No Mission Runs Found</h3>
                  <p>You have not logged any radar classifier analyses yet. Run and log an analysis from the main dashboard console.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <footer className="galaxion-console-footer">
        Built for ISRO BAH 2026 · PS-08 · Team Galaxion
      </footer>
    </div>
  );
}
