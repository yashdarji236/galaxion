import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('admin@galaxion.dev');
  const [password, setPassword] = useState('galaxion2026');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  // Force pre-populate on mount for prototype convenience
  useEffect(() => {
    setEmail('admin@galaxion.dev');
    setPassword('galaxion2026');
  }, []);

  // Star particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Resize canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Create stars
    const starCount = 120;
    const stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        alpha: Math.random(),
        speed: Math.random() * 0.4 + 0.1
      });
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < starCount; i++) {
        const star = stars[i];
        
        // Draw star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fill();

        // Update star alpha (twinkle)
        star.alpha += (Math.random() - 0.5) * 0.05;
        if (star.alpha < 0.1) star.alpha = 0.1;
        if (star.alpha > 1) star.alpha = 1;

        // Move star downwards slowly
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="login-page-container">
      {/* Background stars canvas */}
      <canvas className="login-stars-canvas" ref={canvasRef}></canvas>

      <div className="login-card">
        {/* Logos header */}
        <div className="login-logos-header">
          {/* ISRO Logo SVG */}
          <div className="login-logo-wrapper isro-logo-wrapper" title="ISRO">
            <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="40" fill="#0c1020" stroke="#4A90D9" strokeWidth="2" />
              <ellipse cx="50" cy="50" rx="35" ry="12" stroke="#4A90D9" strokeWidth="1" strokeDasharray="3 3" transform="rotate(-30 50 50)" />
              <path d="M43 65 L48 85 L53 65 Z" fill="#FF6B00" opacity="0.8" />
              <path d="M42 35 C42 35 48 20 50 15 C52 20 58 35 58 35 L55 65 L45 65 Z" fill="#FFFFFF" />
              <rect x="47" y="40" width="6" height="3" fill="#FF9933" />
              <rect x="47" y="43" width="6" height="3" fill="#FFFFFF" />
              <rect x="47" y="46" width="6" height="3" fill="#138808" />
              <text x="50" y="80" fill="#FF6B00" fontSize="10" fontWeight="bold" textAnchor="middle" letterSpacing="1">ISRO</text>
            </svg>
          </div>

          <div className="login-logo-divider"></div>

          {/* H2S Logo SVG */}
          <div className="login-logo-wrapper h2s-logo-wrapper" title="H2S Hackathon 2026">
            <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="5" width="90" height="90" rx="10" fill="#12121a" stroke="#222233" strokeWidth="2" />
              <path d="M15 75 Q35 60 55 75 T95 75" stroke="#4A90D9" strokeWidth="1" opacity="0.4" />
              <ellipse cx="65" cy="78" rx="15" ry="5" stroke="#4A90D9" strokeWidth="1" fill="#08080f" />
              <path d="M30 55 L35 62 L25 62 Z" fill="#AAAAAA" />
              <path d="M20 50 C20 40 40 40 40 50 Z" fill="none" stroke="#FF6B00" strokeWidth="2" />
              <path d="M22 38 A15 15 0 0 1 38 38" stroke="#4A90D9" strokeWidth="1.5" strokeDasharray="2 2" />
              <text x="50" y="25" fill="#FFFFFF" fontSize="12" fontWeight="bold" textAnchor="middle">H2S</text>
              <text x="50" y="38" fill="#AAAAAA" fontSize="8" textAnchor="middle">BAH 2026</text>
            </svg>
          </div>
        </div>

        <div className="login-welcome-text">
          <h2 className="login-title">GALAXION</h2>
          <p className="login-subtitle">Lunar Subsurface Ice Detection Mission Console</p>
        </div>

        {errorMsg && (
          <div className="login-error-alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email-input">MISSION OPERATOR ID</label>
            <div className="input-with-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                id="email-input"
                type="email"
                required
                placeholder="operator@galaxion.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password-input">ACCESS PASSPHRASE</label>
            <div className="input-with-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="password-input"
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <button className="login-submit-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="spinner-icon"></span>
            ) : (
              'INITIALIZE SECURE LINK'
            )}
          </button>
        </form>

        <div 
          className="login-credentials-hint"
          onClick={() => {
            setEmail('admin@galaxion.dev');
            setPassword('galaxion2026');
          }}
          style={{ cursor: 'pointer' }}
          title="Click to auto-fill"
        >
          <p><strong>System Note:</strong> Click here to auto-fill demo profile credentials:</p>
          <code>admin@galaxion.dev / galaxion2026</code>
        </div>
      </div>
      
      <div className="login-footer">
        Built for ISRO BAH 2026 · PS-08 · Team Galaxion
      </div>
    </div>
  );
}
