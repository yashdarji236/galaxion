import React from 'react';

export default function RadarPanel({
  cpr = 1.34,
  dop = 0.09,
  onCprChange = () => {},
  onDopChange = () => {},
  onReRun = () => {},
  isLoading = false
}) {
  return (
    <div className="dashboard-card radar-panel-card">
      <h3 className="card-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="card-title-icon">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 12m-6 0a6 6 0 1 0 12 0a6 6 0 1 0 -12 0" />
          <path d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
          <line x1="12" y1="2" x2="12" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
        </svg>
        RADAR PARAMETERS
      </h3>
      
      <div className="slider-group">
        <div className="slider-header">
          <label htmlFor="cpr-slider" className="slider-label">CPR (Circular Polarization Ratio)</label>
          <span className="slider-value cpr-val">{cpr.toFixed(2)}</span>
        </div>
        <input
          id="cpr-slider"
          type="range"
          min="0.0"
          max="2.0"
          step="0.01"
          value={cpr}
          onChange={(e) => onCprChange(parseFloat(e.target.value))}
          className="slider-input cpr-slider-input"
          disabled={isLoading}
        />
        <div className="slider-bounds">
          <span>0.0 (Smooth)</span>
          <span>2.0 (Rough/Ice)</span>
        </div>
      </div>

      <div className="slider-group">
        <div className="slider-header">
          <label htmlFor="dop-slider" className="slider-label">DOP (Degree of Polarization)</label>
          <span className="slider-value dop-val">{dop.toFixed(3)}</span>
        </div>
        <input
          id="dop-slider"
          type="range"
          min="0.0"
          max="0.30"
          step="0.005"
          value={dop}
          onChange={(e) => onDopChange(parseFloat(e.target.value))}
          className="slider-input dop-slider-input"
          disabled={isLoading}
        />
        <div className="slider-bounds">
          <span>0.00 (Polarized/Pure)</span>
          <span>0.30 (Depolarized)</span>
        </div>
      </div>

      <button
        className={`rerun-classifier-btn ${isLoading ? 'loading' : ''}`}
        onClick={onReRun}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="spinner-icon"></span>
            Running Classifier Sim...
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-icon">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            Re-run Classifier
          </>
        )}
      </button>
    </div>
  );
}
