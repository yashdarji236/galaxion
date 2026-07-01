import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { API_BASE_URL } from '../config';

export default function Craters() {
  const [craters, setCraters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCraters = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/craters`);
        setCraters(response.data);
      } catch (err) {
        console.error('Error fetching craters list:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCraters();
  }, []);

  const handleAnalyze = (craterId) => {
    navigate('/dashboard', { state: { craterId } });
  };

  const filteredCraters = craters.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-page-layout">
      <Navbar />

      <div className="main-viewport">
        {/* Render standard Sidebar (can pass empty handlers or standard navigations) */}
        <Sidebar craters={craters} />

        <main className="center-content-panel full-width-page">
          <div className="page-header-card">
            <h2 className="page-title">PSR Target Crater Catalogue</h2>
            <p className="page-subtitle">Lunar South Pole permanently shadowed regions under radar scanning protocols.</p>
          </div>

          <div className="catalogue-controls">
            <div className="search-bar-wrapper">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Filter craters by designation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="crater-count-badge">
              Active Targets: {filteredCraters.length}
            </div>
          </div>

          {loading ? (
            <div className="panel-loading-wrapper">
              <span className="spinner-icon large"></span>
              <p>Fetching lunar crater inventory...</p>
            </div>
          ) : (
            <div className="table-responsive-container">
              <table className="craters-data-table">
                <thead>
                  <tr>
                    <th>Crater Name</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Area (km²)</th>
                    <th>Ice Probability</th>
                    <th>Radar Scan Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCraters.length > 0 ? (
                    filteredCraters.map((crater) => {
                      const isFaustini = crater.name.includes('Faustini');
                      return (
                        <tr key={crater._id}>
                          <td className="crater-name-cell">
                            <strong>{crater.name}</strong>
                            <span className="crater-mini-desc">{isFaustini ? 'Doubly Shadowed Area' : 'South Pole Rim Area'}</span>
                          </td>
                          <td className="coord-cell">{crater.lat.toFixed(2)}° S</td>
                          <td className="coord-cell">{crater.lon.toFixed(2)}° E</td>
                          <td>{crater.area_km2} km²</td>
                          <td>
                            <span className="status-badge badge-safe">
                              {isFaustini ? 'High (82%)' : 'High (91%)'}
                            </span>
                          </td>
                          <td>
                            <div className="radar-status-cell">
                              <span className="status-dot dot-green"></span>
                              <span>Completed</span>
                            </div>
                          </td>
                          <td>
                            <button
                              className="action-btn table-action-btn"
                              onClick={() => handleAnalyze(crater._id)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="btn-icon">
                                <polygon points="5 3 19 12 5 21 5 3" />
                              </svg>
                              Analyze Target
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="table-empty-row">
                        No catalogued targets found matching "{searchQuery}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
