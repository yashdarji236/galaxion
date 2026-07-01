import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CraterMap from '../components/CraterMap';
import RadarPanel from '../components/RadarPanel';
import ElevationChart from '../components/ElevationChart';
import TerrainCard from '../components/TerrainCard';
import LandingScoreCard from '../components/LandingScoreCard';

export default function Dashboard() {
  const location = useLocation();
  
  // List of craters
  const [craters, setCraters] = useState([]);
  
  // Selected crater & loaded data
  const [selectedCraterId, setSelectedCraterId] = useState('');
  const [selectedCrater, setSelectedCrater] = useState(null);
  
  // Radar & weight states
  const [cpr, setCpr] = useState(1.34);
  const [dop, setDop] = useState(0.09);
  const [w1, setW1] = useState(0.4);
  const [w2, setW2] = useState(0.4);
  const [w3, setW3] = useState(0.2);

  // Analysis run output states
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Ice Discovery scanning states
  const [isScanning, setIsScanning] = useState(false);
  const [isDetected, setIsDetected] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ high: true, medium: true, low: true });

  const handleRunIceDetection = () => {
    setIsScanning(true);
    setIsDetected(false);
    setTimeout(() => {
      setIsScanning(false);
      setIsDetected(true);
    }, 2000);
  };

  const toggleFilter = (level) => {
    setActiveFilters(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
  };

  // 1. Fetch all craters on mount
  useEffect(() => {
    const fetchCraters = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/craters');
        setCraters(response.data);
        
        // Find default crater: Check if state passed a crater, else load Faustini
        const stateCraterId = location.state?.craterId;
        const defaultCrater = response.data.find(c => c._id === stateCraterId) || 
                              response.data.find(c => c.name.includes('Faustini')) || 
                              response.data[0];
        
        if (defaultCrater) {
          setSelectedCraterId(defaultCrater._id);
        }
      } catch (err) {
        console.error('Error fetching craters list:', err);
      }
    };
    fetchCraters();
  }, [location.state]);

  // 2. Fetch active crater details when selectedCraterId changes
  useEffect(() => {
    if (!selectedCraterId) return;

    const fetchCraterDetail = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/craters/${selectedCraterId}`);
        const crater = response.data;
        setSelectedCrater(crater);
        
        // Reset defaults
        setCpr(1.34);
        setDop(0.09);
        setW1(0.4);
        setW2(0.4);
        setW3(0.2);
        setSaveStatus('');
        setIsScanning(false);
        setIsDetected(false);
        setActiveFilters({ high: true, medium: true, low: true });

        // Pre-initialize analysisData with seeded values immediately (no delay)
        // so that the map and charts render instantly
        const isFaustini = crater.name.includes('Faustini');
        const baseRadius = isFaustini ? 8 : 12;
        
        const initialAnalysis = {
          iceZones: {
            center: [crater.lat, crater.lon],
            highRadius: baseRadius * 0.4,
            mediumRadius: baseRadius * 0.7,
            lowRadius: baseRadius * 1.1,
            cpr: 1.34,
            dop: 0.09,
            confidenceText: 'High'
          },
          landingSite: crater.landingSite,
          roverPath: crater.roverPath,
          elevationProfile: crater.elevationProfile,
          iceVolume: isFaustini ? 2400000 : 4100000,
          confidence_interval: isFaustini ? 300000 : 600000,
          confidence_percent: 90,
          terrainSafety: isFaustini 
            ? {
                slope: 6.2,
                boulderDensity: 'Low',
                surfaceRoughness: 'Moderate',
                overallStatus: 'SAFE FOR LANDING'
              }
            : {
                slope: 11.4,
                boulderDensity: 'Moderate',
                surfaceRoughness: 'Moderate',
                overallStatus: 'SAFE FOR LANDING'
              },
          score: isFaustini ? 0.84 : 0.86
        };
        
        setAnalysisData(initialAnalysis);
      } catch (err) {
        console.error('Error fetching crater details:', err);
      }
    };
    fetchCraterDetail();
  }, [selectedCraterId]);

  // 3. Keep Landing Score updated in real-time as weights or values change
  const currentScore = (() => {
    if (!selectedCrater || !analysisData) return 0;
    const isFaustini = selectedCrater.name.includes('Faustini');
    
    // Simulate threshold factors
    const cprFactor = Math.max(0.3, Math.min(2.0, 1 + (1.34 - cpr) * 0.9));
    const dopFactor = Math.max(0.3, Math.min(2.0, 1 + (dop - 0.09) * 2.2));
    
    const baseIceScore = isFaustini ? 0.85 : 0.92;
    const baseSlopeScore = isFaustini ? 0.90 : 0.75;
    const baseSolarScore = isFaustini ? 0.70 : 0.95;
    
    const currentSlope = isFaustini 
      ? (6.2 + (cpr - 1.34) * 0.5) 
      : (11.4 + (cpr - 1.34) * 0.8);

    const iceScore = Math.max(0.1, Math.min(1.0, baseIceScore * cprFactor * dopFactor));
    const slopeScore = currentSlope < 15.0 ? baseSlopeScore : baseSlopeScore * 0.5;
    const solarScore = baseSolarScore;

    return parseFloat((w1 * iceScore + w2 * slopeScore + w3 * solarScore).toFixed(2));
  })();

  // 4. Trigger backend classifier simulation
  const handleReRun = async () => {
    setIsLoading(true);
    setSaveStatus('');
    try {
      const response = await axios.post('http://localhost:5000/api/analysis/run', {
        craterId: selectedCraterId,
        cpr_threshold: cpr,
        dop_threshold: dop,
        w1,
        w2,
        w3
      });
      setAnalysisData(response.data);
    } catch (err) {
      console.error('Error re-running radar classification:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Save analysis to MongoDB reports database
  const handleSaveReport = async () => {
    if (!selectedCrater || !analysisData) return;
    setSaveStatus('Saving report to central log...');
    try {
      await axios.post('http://localhost:5000/api/reports/save', {
        craterId: selectedCraterId,
        cpr_used: cpr,
        dop_used: dop,
        iceVolume_m3: analysisData.iceVolume,
        confidence_interval: analysisData.confidence_interval,
        landingScore: currentScore,
        terrainSafety: {
          slope: analysisData.terrainSafety.slope,
          boulderDensity: analysisData.terrainSafety.boulderDensity,
          surfaceRoughness: analysisData.terrainSafety.surfaceRoughness,
          overallStatus: analysisData.terrainSafety.overallStatus
        }
      });
      setSaveStatus('Success! Analysis logged in database.');
      setTimeout(() => setSaveStatus(''), 4000);
    } catch (err) {
      console.error('Error saving report:', err);
      setSaveStatus('Failed to log analysis.');
    }
  };

  // 6. Export data as JSON file
  const handleExportJSON = () => {
    if (!selectedCrater || !analysisData) return;

    const reportPayload = {
      mission: 'Galaxion Lunar Subsurface Ice Detection Dashboard',
      craterDetails: {
        id: selectedCrater._id,
        name: selectedCrater.name,
        center_lat: selectedCrater.lat,
        center_lon: selectedCrater.lon,
        area_km2: selectedCrater.area_km2,
        description: selectedCrater.description
      },
      analysisParameters: {
        cpr_threshold: cpr,
        dop_threshold: dop,
        weights: {
          w1_ice: w1,
          w2_slope: w2,
          w3_solar: w3
        }
      },
      evaluationOutputs: {
        iceVolume_m3: analysisData.iceVolume,
        confidence_interval_m3: analysisData.confidence_interval,
        confidence_level: `${analysisData.confidence_percent}%`,
        landingScore: currentScore,
        terrainSafety: analysisData.terrainSafety,
        roverPathWaypoints: analysisData.roverPath,
        elevationProfile: analysisData.elevationProfile
      },
      generatedAt: new Date().toISOString(),
      compiler: 'ISRO BAH 2026 - PS08 - Team Galaxion'
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `galaxion-mission-report-${selectedCrater.name.toLowerCase()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Reset analysis parameters to defaults
  const handleResetAnalysis = () => {
    setCpr(1.34);
    setDop(0.09);
    setW1(0.4);
    setW2(0.4);
    setW3(0.2);
    setSaveStatus('');
    handleReRun();
  };

  const handleShowPathModal = () => {
    if (!analysisData) return;
    const pathText = analysisData.roverPath.map((wp, idx) => `WP-${idx + 1}: Lat ${wp.lat.toFixed(4)}, Lon ${wp.lon.toFixed(4)}`).join('\n');
    alert(`PLANNED ROVER TRAVERSE PATH WAYPOINTS:\n\n${pathText}`);
  };

  return (
    <div className="app-page-layout">
      <Navbar />

      <div className="main-viewport">
        {/* Left column sidebar */}
        <Sidebar
          craters={craters}
          selectedCraterId={selectedCraterId}
          onCraterChange={setSelectedCraterId}
          onNewAnalysis={handleResetAnalysis}
        />

        {/* Center Panel */}
        <main className="center-content-panel">
          {selectedCrater && analysisData ? (
            <>
              {/* Map view */}
              <CraterMap
                lat={selectedCrater.lat}
                lon={selectedCrater.lon}
                iceZones={analysisData.iceZones}
                landingSite={analysisData.landingSite}
                roverPath={analysisData.roverPath}
                isScanning={isScanning}
                isDetected={isDetected}
                activeFilters={activeFilters}
              />

              {/* Elevation graph */}
              <ElevationChart data={analysisData.elevationProfile} />
            </>
          ) : (
            <div className="panel-loading-wrapper">
              <span className="spinner-icon large"></span>
              <p>Syncing telemetry and loading surface maps...</p>
            </div>
          )}
        </main>

        {/* Right Panel */}
        <aside className="right-sidebar-panel">
          {selectedCrater && analysisData ? (
            <div className="right-panel-cards-container">
              {/* Card 1 - Radar Parameters */}
              <RadarPanel
                cpr={cpr}
                dop={dop}
                onCprChange={setCpr}
                onDopChange={setDop}
                onReRun={handleReRun}
                isLoading={isLoading}
              />

              {/* Card - Ice Discovery */}
              <div className="dashboard-card ice-discovery-card">
                <h3 className="card-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="card-title-icon">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="2" x2="12" y2="22" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 12l5-5" />
                  </svg>
                  ICE DISCOVERY
                </h3>
                
                <button
                  className={`action-btn filled-orange-btn detection-btn ${isScanning ? 'loading' : ''}`}
                  onClick={handleRunIceDetection}
                  disabled={isScanning}
                >
                  {isScanning ? (
                    <>
                      <span className="spinner-icon"></span>
                      Scanning Surface...
                    </>
                  ) : (
                    'Run Ice Detection'
                  )}
                </button>

                {isDetected && (
                  <div className="detection-results-wrapper">
                    <div className="detection-results-card">
                      <div className="result-metric-row">
                        <span className="result-label">Zones Detected:</span>
                        <strong className="result-val blue-highlight">3</strong>
                      </div>
                      <div className="result-metric-row">
                        <span className="result-label">Highest Confidence:</span>
                        <strong className="result-val blue-highlight">CPR {cpr.toFixed(2)}, DOP {dop.toFixed(2)}</strong>
                      </div>
                      <div className="result-metric-row">
                        <span className="result-label">Est. Surface Coverage:</span>
                        <strong className="result-val">12.4 km²</strong>
                      </div>
                      <div className="result-metric-row align-center">
                        <span className="result-label">Recommended for Extraction:</span>
                        <span className="status-badge badge-safe">YES</span>
                      </div>
                    </div>

                    <div className="filter-title-row">
                      <span>ICE ZONE DISPLAY FILTERS</span>
                    </div>
                    <div className="zone-filters-buttons">
                      <button
                        className={`filter-toggle-btn btn-high ${activeFilters.high ? 'active' : ''}`}
                        onClick={() => toggleFilter('high')}
                      >
                        High
                      </button>
                      <button
                        className={`filter-toggle-btn btn-med ${activeFilters.medium ? 'active' : ''}`}
                        onClick={() => toggleFilter('medium')}
                      >
                        Medium
                      </button>
                      <button
                        className={`filter-toggle-btn btn-low ${activeFilters.low ? 'active' : ''}`}
                        onClick={() => toggleFilter('low')}
                      >
                        Low
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Card 2 - Estimated Ice Volume */}
              <div className="dashboard-card ice-volume-card">
                <h3 className="card-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="card-title-icon">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  ESTIMATED ICE VOLUME (TOP 5M)
                </h3>
                <div className="volume-large-display">
                  <span className="volume-number">{(analysisData.iceVolume / 1000000).toFixed(1)}M</span>
                  <span className="volume-unit"> m³</span>
                </div>
                <div className="volume-subtext">
                  ± {(analysisData.confidence_interval / 1000000).toFixed(1)}M m³ (dielectric model, 90% CI)
                </div>
                <div className="volume-note">
                  Model-based estimate, not direct measurement
                </div>
                <div className="confidence-level-wrapper">
                  <div className="confidence-label-row">
                    <span>Model Confidence</span>
                    <span>{analysisData.confidence_percent}%</span>
                  </div>
                  <div className="confidence-progress-bg">
                    <div
                      className="confidence-progress-fill"
                      style={{ width: `${analysisData.confidence_percent}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Card 3 - Terrain Safety */}
              <TerrainCard
                slope={analysisData.terrainSafety.slope}
                boulderDensity={analysisData.terrainSafety.boulderDensity}
                surfaceRoughness={analysisData.terrainSafety.surfaceRoughness}
                overallStatus={analysisData.terrainSafety.overallStatus}
              />

              {/* Card 4 - Landing Site Score */}
              <LandingScoreCard
                w1={w1}
                w2={w2}
                w3={w3}
                onWeightsChange={(newW1, newW2, newW3) => {
                  setW1(newW1);
                  setW2(newW2);
                  setW3(newW3);
                }}
                score={currentScore}
              />

              {/* Action buttons */}
              <div className="right-panel-actions">
                {saveStatus && <p className="save-status-msg">{saveStatus}</p>}
                
                <button className="action-btn outline-blue-btn" onClick={handleShowPathModal}>
                  View Full Rover Path
                </button>
                
                <div className="dual-action-buttons">
                  <button className="action-btn filled-orange-btn" onClick={handleSaveReport}>
                    Save Run to Log
                  </button>
                  <button className="action-btn filled-orange-btn" onClick={handleExportJSON}>
                    Export Report
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="panel-loading-wrapper">
              <span className="spinner-icon"></span>
              <p>Analyzing parameters...</p>
            </div>
          )}
        </aside>
      </div>

      <footer className="galaxion-console-footer">
        Built for ISRO BAH 2026 · PS-08 · Team Galaxion
      </footer>
    </div>
  );
}
