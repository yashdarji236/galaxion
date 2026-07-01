import React from 'react';

export default function TerrainCard({
  slope = 6.2,
  boulderDensity = 'Low',
  surfaceRoughness = 'Moderate',
  overallStatus = 'SAFE FOR LANDING'
}) {
  // Helper to generate character progress bar
  const getAsciiBar = (value, type) => {
    let filled = 5;
    if (type === 'slope') {
      // Slope max safe is 15
      filled = Math.min(10, Math.max(1, Math.round((value / 15) * 10)));
    } else {
      const level = value.toLowerCase();
      if (level === 'low') filled = 4;
      else if (level === 'moderate') filled = 5;
      else if (level === 'high') filled = 8;
    }
    return '█'.repeat(filled) + '░'.repeat(10 - filled);
  };

  const isSlopeSafe = slope < 15.0;
  const isOverallSafe = overallStatus === 'SAFE FOR LANDING';

  return (
    <div className="dashboard-card terrain-safety-card">
      <h3 className="card-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="card-title-icon">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        TERRAIN SAFETY
      </h3>

      <div className="terrain-metrics">
        <div className="metric-row green">
          <span className="metric-label">Slope:</span>
          <span className="metric-bar-wrapper">
            <code className="metric-ascii-bar">{getAsciiBar(slope, 'slope')}</code>
            <span className="metric-value-text">{slope.toFixed(1)}°</span>
          </span>
          <span className="metric-limits-text">(Safe &lt; 15°)</span>
        </div>

        <div className={`metric-row ${boulderDensity.toLowerCase() === 'low' ? 'green' : 'orange'}`}>
          <span className="metric-label">Boulder Density:</span>
          <span className="metric-bar-wrapper">
            <code className="metric-ascii-bar">{getAsciiBar(boulderDensity, 'boulder')}</code>
            <span className="metric-value-text">{boulderDensity}</span>
          </span>
          <span className="metric-limits-text"></span>
        </div>

        <div className={`metric-row ${surfaceRoughness.toLowerCase() === 'low' ? 'green' : 'orange'}`}>
          <span className="metric-label">Surface Roughness:</span>
          <span className="metric-bar-wrapper">
            <code className="metric-ascii-bar">{getAsciiBar(surfaceRoughness, 'roughness')}</code>
            <span className="metric-value-text">{surfaceRoughness}</span>
          </span>
          <span className="metric-limits-text"></span>
        </div>
      </div>

      <div className="card-footer-badge-wrapper">
        <span className={`status-badge ${isOverallSafe ? 'badge-safe' : 'badge-warning'}`}>
          {isOverallSafe ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="badge-icon">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {overallStatus}
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="badge-icon">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              {overallStatus}
            </>
          )}
        </span>
      </div>
    </div>
  );
}
