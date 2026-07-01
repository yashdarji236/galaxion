import React from 'react';

export default function LandingScoreCard({
  w1 = 0.4,
  w2 = 0.4,
  w3 = 0.2,
  onWeightsChange = () => {},
  score = 0.84
}) {
  
  // Custom weight adjuster that keeps sum = 1.0
  const handleWeightChange = (changedIndex, newValue) => {
    const weights = [w1, w2, w3];
    const prevValue = weights[changedIndex];
    const diff = newValue - prevValue;
    
    // Distribute the negative difference among the other two weights
    const otherIndices = [0, 1, 2].filter(i => i !== changedIndex);
    const sumOthers = weights[otherIndices[0]] + weights[otherIndices[1]];
    
    let nextWeights = [...weights];
    nextWeights[changedIndex] = newValue;
    
    if (sumOthers > 0) {
      // Proportional redistribution
      nextWeights[otherIndices[0]] = Math.max(0, weights[otherIndices[0]] - diff * (weights[otherIndices[0]] / sumOthers));
      nextWeights[otherIndices[1]] = Math.max(0, weights[otherIndices[1]] - diff * (weights[otherIndices[1]] / sumOthers));
    } else {
      // Split remaining equally
      const remaining = 1.0 - newValue;
      nextWeights[otherIndices[0]] = remaining / 2;
      nextWeights[otherIndices[1]] = remaining / 2;
    }
    
    // Fix rounding issues to ensure they sum exactly to 1.0
    const sum = nextWeights[0] + nextWeights[1] + nextWeights[2];
    if (sum !== 1.0) {
      const error = 1.0 - sum;
      // Add error to the weight that has the largest room
      const maxIdx = nextWeights.indexOf(Math.max(...nextWeights));
      nextWeights[maxIdx] = parseFloat((nextWeights[maxIdx] + error).toFixed(3));
    }
    
    // Clamp values to 2 decimals
    onWeightsChange(
      parseFloat(nextWeights[0].toFixed(2)),
      parseFloat(nextWeights[1].toFixed(2)),
      parseFloat(nextWeights[2].toFixed(2))
    );
  };

  return (
    <div className="dashboard-card landing-score-card">
      <h3 className="card-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="card-title-icon">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        LANDING SITE SCORE
      </h3>

      <div className="score-formula-display">
        <code>score = w₁·(ice) + w₂·(slope) + w₃·(solar)</code>
      </div>

      <div className="weights-sliders-container">
        {/* Weight 1 */}
        <div className="weight-slider-row">
          <div className="weight-slider-header">
            <span className="weight-name">w₁ (Ice abundance weight)</span>
            <span className="weight-value">{w1.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.01"
            value={w1}
            onChange={(e) => handleWeightChange(0, parseFloat(e.target.value))}
            className="slider-input weight-slider-input w1-slider"
          />
        </div>

        {/* Weight 2 */}
        <div className="weight-slider-row">
          <div className="weight-slider-header">
            <span className="weight-name">w₂ (Slope safety weight)</span>
            <span className="weight-value">{w2.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.01"
            value={w2}
            onChange={(e) => handleWeightChange(1, parseFloat(e.target.value))}
            className="slider-input weight-slider-input w2-slider"
          />
        </div>

        {/* Weight 3 */}
        <div className="weight-slider-row">
          <div className="weight-slider-header">
            <span className="weight-name">w₃ (Solar exposure weight)</span>
            <span className="weight-value">{w3.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.01"
            value={w3}
            onChange={(e) => handleWeightChange(2, parseFloat(e.target.value))}
            className="slider-input weight-slider-input w3-slider"
          />
        </div>
        
        <div className="weight-sum-validator">
          <span className="validator-dot"></span>
          <span>Sum of weights: {(w1 + w2 + w3).toFixed(1)} / 1.0</span>
        </div>
      </div>

      <div className="computed-score-section">
        <div className="score-main-display">
          <span className="score-num">{score.toFixed(2)}</span>
          <span className="score-total">/ 1.00</span>
        </div>
        
        {score >= 0.70 && (
          <span className="status-badge badge-safe recommended-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="badge-icon">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            RECOMMENDED
          </span>
        )}
      </div>
    </div>
  );
}
