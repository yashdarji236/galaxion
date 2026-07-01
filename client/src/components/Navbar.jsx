import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar-container">
      {/* Left: ISRO Logo */}
      <div className="navbar-brand">
        <svg width="42" height="42" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="isro-logo-svg">
          {/* Stylized ISRO blue sphere & orange rocket */}
          <circle cx="50" cy="50" r="40" fill="#0c1020" stroke="#4A90D9" strokeWidth="2" />
          {/* Orbit paths */}
          <ellipse cx="50" cy="50" rx="35" ry="12" stroke="#4A90D9" strokeWidth="1" strokeDasharray="3 3" transform="rotate(-30 50 50)" />
          {/* Rocket flame */}
          <path d="M43 65 L48 85 L53 65 Z" fill="#FF6B00" opacity="0.8" />
          {/* Rocket body */}
          <path d="M42 35 C42 35 48 20 50 15 C52 20 58 35 58 35 L55 65 L45 65 Z" fill="#FFFFFF" />
          {/* India Flag Colors detail on rocket */}
          <rect x="47" y="40" width="6" height="3" fill="#FF9933" />
          <rect x="47" y="43" width="6" height="3" fill="#FFFFFF" />
          <rect x="47" y="46" width="6" height="3" fill="#138808" />
          {/* Text label ISRO */}
          <text x="50" y="80" fill="#FF6B00" fontSize="10" fontWeight="bold" textAnchor="middle" letterSpacing="1">ISRO</text>
        </svg>
        <span className="brand-text">GALAXION</span>
      </div>

      {/* Center: Title */}
      <div className="navbar-title">
        <h1>Galaxion — Lunar Ice Mission Console</h1>
      </div>

      {/* Right: H2S Logo + User Status */}
      <div className="navbar-actions">
        {user && (
          <div className="user-profile">
            <span className="user-badge-icon"></span>
            <span className="user-email">{user.email}</span>
            <button className="logout-btn" onClick={handleLogout} title="Sign Out">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        )}
        
        {/* H2S Hackathon Logo */}
        <div className="h2s-logo-wrapper" title="Bharatiya Antariksh Hackathon 2026">
          <svg width="42" height="42" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="5" width="90" height="90" rx="10" fill="#12121a" stroke="#222233" strokeWidth="2" />
            {/* Lunar Surface grid */}
            <path d="M15 75 Q35 60 55 75 T95 75" stroke="#4A90D9" strokeWidth="1" opacity="0.4" />
            <path d="M10 85 Q40 75 70 85 T90 85" stroke="#4A90D9" strokeWidth="1" opacity="0.3" />
            {/* Crater outline */}
            <ellipse cx="65" cy="78" rx="15" ry="5" stroke="#4A90D9" strokeWidth="1" fill="#08080f" />
            {/* Antenna dish */}
            <path d="M30 55 L35 62 L25 62 Z" fill="#AAAAAA" />
            <path d="M20 50 C20 40 40 40 40 50 Z" fill="none" stroke="#FF6B00" strokeWidth="2" />
            {/* Signal waves */}
            <path d="M22 38 A15 15 0 0 1 38 38" stroke="#4A90D9" strokeWidth="1.5" strokeDasharray="2 2" />
            <path d="M18 30 A25 25 0 0 1 42 30" stroke="#FF6B00" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="50" y="25" fill="#FFFFFF" fontSize="12" fontWeight="bold" textAnchor="middle">H2S</text>
            <text x="50" y="38" fill="#AAAAAA" fontSize="8" textAnchor="middle">BAH 2026</text>
          </svg>
        </div>
      </div>
    </header>
  );
}
