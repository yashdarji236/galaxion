import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar({
  craters = [],
  selectedCraterId = '',
  onCraterChange = () => {},
  onNewAnalysis = () => {},
  currentStep = 2 // default to Ice Classifier in progress
}) {
  const [collapsed, setCollapsed] = useState(false);

  const steps = [
    { id: 1, name: 'Crater Mapper', status: 'active', color: '#138808', desc: 'Identified candidate PSR boundary' },
    { id: 2, name: 'Ice Classifier', status: 'progress', color: '#FF6B00', desc: 'Analyzing CPR & DOP ratios' },
    { id: 3, name: 'Terrain Safety', status: 'progress', color: '#FF6B00', desc: 'Computing slopes & roughness' },
    { id: 4, name: 'Landing Site', status: 'pending', color: '#555555', desc: 'Evaluating solar & hazards' },
    { id: 5, name: 'Rover Path', status: 'pending', color: '#555555', desc: 'Traverse path finding' },
    { id: 6, name: 'Ice Volume', status: 'pending', color: '#555555', desc: 'Estimating total water reserves' }
  ];

  return (
    <aside className={`sidebar-container ${collapsed ? 'collapsed' : ''}`}>
      {/* Collapse button for mobile/compact view */}
      <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle Sidebar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {collapsed ? (
            <path d="m13 17 5-5-5-5M6 17l5-5-5-5" />
          ) : (
            <path d="m11 17-5-5 5-5M18 17l-5-5 5-5" />
          )}
        </svg>
      </button>

      <div className="sidebar-content">
        <div className="sidebar-section">
          <h2 className="sidebar-title">NAVIGATION</h2>
          <nav className="nav-links">
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="9" />
                <rect x="14" y="3" width="7" height="5" />
                <rect x="14" y="12" width="7" height="9" />
                <rect x="3" y="16" width="7" height="5" />
              </svg>
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/craters" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                <path d="M2 12h20" />
              </svg>
              <span>Crater Catalogue</span>
            </NavLink>
            <NavLink to="/reports" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span>Mission Reports</span>
            </NavLink>
          </nav>
        </div>

        <div className="sidebar-divider"></div>

        <div className="sidebar-section">
          <h2 className="sidebar-title">WORKFLOW</h2>
          <div className="workflow-steps">
            {steps.map((step) => {
              let dotClass = 'dot-grey';
              if (step.status === 'active') dotClass = 'dot-green';
              if (step.status === 'progress') dotClass = 'dot-orange';

              return (
                <div key={step.id} className={`workflow-step-item step-${step.status}`}>
                  <div className="step-header">
                    <span className={`status-dot ${dotClass}`} style={{ backgroundColor: step.color }}></span>
                    <span className="step-name">{step.name}</span>
                  </div>
                  {!collapsed && <span className="step-desc">{step.desc}</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="sidebar-divider"></div>

        <div className="sidebar-section crater-selector-section">
          {!collapsed && <label htmlFor="crater-select" className="crater-select-label">SELECT PSR TARGET</label>}
          <div className="crater-select-wrapper">
            <select
              id="crater-select"
              className="crater-select-dropdown"
              value={selectedCraterId}
              onChange={(e) => onCraterChange(e.target.value)}
            >
              {craters.map((crater) => (
                <option key={crater._id} value={crater._id}>
                  {crater.name}
                </option>
              ))}
            </select>
            <div className="select-arrow-icon">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </div>

        <div className="sidebar-footer-btn-wrapper">
          <button className="new-analysis-btn" onClick={onNewAnalysis}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>Reset Analysis</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
