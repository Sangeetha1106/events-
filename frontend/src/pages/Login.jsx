import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { unifiedLogin } from '../api/auth.api';
import { attenderRegister } from '../api/attender.api';
import { setToken } from '../utils/localStorage';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

// Custom SVG Icons
const IconTicket = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z" />
    <line x1="13" y1="5" x2="13" y2="19" />
  </svg>
);

const IconEye = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Attender Registration State
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      let responseData;
      if (isRegistering) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }

        // Register attender
        await attenderRegister({
          fullName,
          email: identifier,
          phoneNumber,
          password
        });

        // Automatically log in using unified auth
        responseData = await unifiedLogin({ email: identifier, password });
      } else {
        // Sign in flow using unified auth
        responseData = await unifiedLogin({ email: identifier, password });
      }
      
      const token = responseData.data?.token;
      if (!token) {
        throw new Error('Token not found in response');
      }
      
      setToken(token);
      const decoded = jwtDecode(token);
      const userRole = decoded.role || 'Attender';
      
      login({ 
        role: userRole, 
        id: decoded.id, 
        username: decoded.username || decoded.email || 'User'
      }); 
      
      if (userRole === 'Organizer') {
        navigate('/organizer/dashboard');
      } else if (userRole === 'Admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/attender/dashboard');
      }
      
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Submission failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const toggleRegisterMode = () => {
    setIsRegistering(!isRegistering);
    setIdentifier('');
    setPassword('');
    setError('');
    setFullName('');
    setPhoneNumber('');
    setConfirmPassword('');
  };

  return (
    <div className="login-page-container">
      
      {/* 1 & 2. Full-Screen Background Image and Overlay */}
      <div className="fullscreen-bg-wrapper">
        <img 
          src="/synthesis_live_banner.png" 
          alt="Event Background" 
          className="fullscreen-bg-img"
        />
        <div className="dark-gradient-overlay"></div>
      </div>

      {/* Brand Logo - Float top-left */}
      <div className="logo-header">
        <div className="logo-box">
          <IconTicket />
        </div>
        <span className="logo-text">EventHub</span>
      </div>

      {/* 4. Hero Content - Absolute positioning on the left */}
      <div className="floating-hero-content">
        <h1 className="hero-title">Create. Manage. Attend Events Seamlessly</h1>
        <p className="hero-subtitle">
          All-in-one platform for organizers and attendees to create, manage, and book events effortlessly.
        </p>
      </div>

      {/* 3 & 5. Centered Floating Glassmorphism Login Card */}
      <div className="popup-container">
        <div className="login-popup glass-panel animate-scale">
          
          <div className="form-header">
            <h2 className="form-title">
              {isRegistering ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="form-subtitle">
              {isRegistering 
                ? 'Register as an Attender to book event tickets' 
                : 'Please sign in to access your dashboard'}
            </p>
          </div>

          {error && (
            <div className="error-alert animate-fade">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            
            {/* Full Name field (Register only) */}
            {isRegistering && (
              <div className="form-group animate-fade">
                <label className="input-label">Full Name</label>
                <input 
                  type="text"
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)} 
                  placeholder="John Doe" 
                  required 
                  className="styled-input"
                />
              </div>
            )}

            {/* Email Address field */}
            <div className="form-group">
              <label className="input-label">Email Address</label>
              <input 
                type="text"
                value={identifier} 
                onChange={e => setIdentifier(e.target.value)} 
                placeholder="e.g. user@eventhub.com" 
                required 
                className="styled-input"
              />
            </div>

            {/* Phone Number field (Register only) */}
            {isRegistering && (
              <div className="form-group animate-fade">
                <label className="input-label">Phone Number</label>
                <input 
                  type="tel"
                  value={phoneNumber} 
                  onChange={e => setPhoneNumber(e.target.value)} 
                  placeholder="+1 (555) 123-4567" 
                  required 
                  className="styled-input"
                />
              </div>
            )}

            {/* Password field */}
            <div className="form-group">
              <div className="label-row">
                <label className="input-label">Password</label>
                {!isRegistering && (
                  <button 
                    type="button"
                    onClick={() => alert('Password reset is managed by the system administrator. Please reach out directly.')}
                    className="forgot-password-link"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="input-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                  className="styled-input password-input"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="eye-toggle-btn"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            {/* Confirm Password field (Register only) */}
            {isRegistering && (
              <div className="form-group animate-fade">
                <label className="input-label">Confirm Password</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                  className="styled-input"
                />
              </div>
            )}

            {/* Remember Me Checkbox (Sign in only) */}
            {!isRegistering && (
              <div className="remember-me-container">
                <label className="checkbox-label">
                  <input 
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="styled-checkbox"
                  />
                  <span className="checkbox-custom-text">Remember this browser</span>
                </label>
              </div>
            )}

            {/* Submit Button (Full Width) */}
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  <span>{isRegistering ? 'Registering...' : 'Authenticating...'}</span>
                </>
              ) : (
                <span>{isRegistering ? 'Register & Sign In' : 'Sign In'}</span>
              )}
            </button>

          </form>

          {/* Toggle registration link */}
          <div className="register-toggle-footer">
            <span className="toggle-text">
              {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
            </span>
            <button
              type="button"
              onClick={toggleRegisterMode}
              className="toggle-link-btn"
            >
              {isRegistering ? 'Sign In' : 'Register here'}
            </button>
          </div>

          {/* Guest Action Panel */}
          <div className="guest-action-footer">
            <span>Looking to browse events?</span>
            <button 
              type="button" 
              onClick={() => navigate('/attender/dashboard')}
              className="guest-action-btn"
            >
              Browse Public Event Directory →
            </button>
          </div>

        </div>
      </div>

      {/* Embedded CSS layout and aesthetics */}
      <style>{`
        .login-page-container {
          min-height: 100vh;
          width: 100vw;
          background: var(--bg-main);
          color: var(--text-main);
          font-family: var(--font-family, sans-serif);
          position: relative;
          overflow: hidden;
        }

        /* 1. Full Screen Background Image */
        .fullscreen-bg-wrapper {
          position: absolute;
          inset: 0;
          width: 100vw;
          height: 100vh;
          z-index: 1;
        }

        .fullscreen-bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        /* 2. Background Overlay */
        .dark-gradient-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg, 
            var(--bg-main) 0%, 
            var(--card-bg) 50%, 
            var(--bg-main) 100%
          );
          z-index: 2;
        }

        /* Logo Header - Float top-left */
        .logo-header {
          position: absolute;
          top: 3rem;
          left: 4rem;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-box {
          width: 42px;
          height: 42px;
          background: linear-gradient(135deg, var(--primary-color, #6366f1), var(--accent-cyan, #06b6d4));
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-title);
          box-shadow: 0 4px 20px var(--primary-glow);
        }

        .logo-text {
          font-size: 1.4rem;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        /* 4. Hero Content - Position left side */
        .floating-hero-content {
          position: absolute;
          left: 4rem;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
          pointer-events: none;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .hero-title {
          font-size: 2.8rem;
          font-weight: 850;
          line-height: 1.15;
          letter-spacing: -1.5px;
          margin: 0;
        }

        .hero-subtitle {
          font-size: 1.05rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin: 0;
        }

        /* 3. Floating Login Popup (Centered) */
        .popup-container {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
          width: 100%;
          max-width: 450px;
          padding: 0 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Glassmorphism card effects */
        .login-popup.glass-panel {
          width: 100%;
          background: var(--panel-bg);
          backdrop-filter: blur(15px) saturate(180%);
          -webkit-backdrop-filter: blur(15px) saturate(180%);
          border: 1px solid var(--border-strong);
          border-radius: 20px;
          padding: 3rem 2.5rem;
          box-shadow: 
            0 10px 40px var(--shadow-main),
            0 1px 0px var(--border-light) inset,
            0 20px 60px var(--shadow-main);
          display: flex;
          flex-direction: column;
          gap: 1.8rem;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .login-popup.glass-panel:hover {
          border-color: rgba(99, 102, 241, 0.2);
          box-shadow: 
            0 10px 40px var(--shadow-main),
            0 1px 0px var(--border-light) inset,
            0 20px 60px var(--shadow-main);
        }

        .form-header {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-title {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.75px;
          color: var(--text-title);
          margin: 0;
        }

        .form-subtitle {
          color: var(--text-muted);
          font-size: 0.925rem;
          margin: 0;
        }

        /* Error Alert banner */
        .error-alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.25);
          padding: 0.9rem 1.2rem;
          border-radius: 12px;
          font-size: 0.875rem;
        }

        .error-icon {
          font-size: 1.1rem;
        }

        .error-text {
          color: #fca5a5;
          font-weight: 500;
        }

        /* Form styling */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.4rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .input-label {
          font-size: 0.85rem;
          color: var(--label-color);
          font-weight: 600;
        }

        .forgot-password-link {
          background: none;
          border: none;
          color: #818cf8;
          font-size: 0.825rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s ease;
        }

        .forgot-password-link:hover {
          color: #a5b4fc;
          text-decoration: underline;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .styled-input {
          width: 100%;
          background: var(--input-bg);
          border: 1px solid var(--border-strong);
          padding: 0.9rem 1.2rem;
          border-radius: 12px;
          color: var(--text-title);
          font-size: 0.975rem;
          font-family: inherit;
          outline: none;
          transition: all 0.2s ease;
        }

        .styled-input:focus {
          border-color: var(--primary-color, #6366f1);
          background: var(--input-bg);
          box-shadow: 0 0 16px rgba(99, 102, 241, 0.25);
        }

        .password-input {
          padding-right: 3.2rem;
        }

        .eye-toggle-btn {
          position: absolute;
          right: 1.1rem;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.2s ease;
        }

        .eye-toggle-btn:hover {
          color: #9ca3af;
        }

        /* Checkbox styling */
        .remember-me-container {
          display: flex;
          align-items: center;
          margin-top: 0.2rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          cursor: pointer;
          user-select: none;
        }

        .styled-checkbox {
          width: 18px;
          height: 18px;
          accent-color: var(--primary-color, #6366f1);
          cursor: pointer;
        }

        .checkbox-custom-text {
          font-size: 0.875rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        /* Sign In Button */
        .submit-btn {
          margin-top: 0.5rem;
          width: 100%;
          padding: 0.95rem;
          background: linear-gradient(135deg, var(--primary-color, #6366f1), var(--primary-hover, #4f46e5));
          border: none;
          color: var(--text-on-primary);
          font-weight: 700;
          font-size: 1rem;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(99, 102, 241, 0.45);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 22px;
          height: 22px;
          border: 2.5px solid var(--border-strong);
          border-top-color: var(--text-title);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* Footers */
        .register-toggle-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          font-size: 0.9rem;
          margin-top: -0.5rem;
        }

        .toggle-text {
          color: var(--text-muted);
        }

        .toggle-link-btn {
          background: none;
          border: none;
          color: #818cf8;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s ease;
        }

        .toggle-link-btn:hover {
          color: #a5b4fc;
          text-decoration: underline;
        }

        .guest-action-footer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          text-align: center;
          font-size: 0.875rem;
          color: var(--text-muted);
          border-top: 1px solid var(--border-strong);
          padding-top: 1.5rem;
          margin-top: 0.5rem;
        }

        .guest-action-btn {
          background: none;
          border: none;
          color: var(--accent-cyan, #06b6d4);
          font-size: 0.925rem;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
          transition: all 0.2s ease;
        }

        .guest-action-btn:hover {
          color: #22d3ee;
          text-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
        }

        /* Animations */
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .animate-fade {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-scale {
          animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }

        /* Responsive Design - Clashing Prevention */
        @media (max-width: 1200px) {
          /* On medium screens, shift card to right-center and shrink hero text */
          .popup-container {
            left: auto;
            right: 6%;
            transform: translateY(-50%);
          }
          .floating-hero-content {
            left: 3rem;
            max-width: 320px;
          }
          .hero-title {
            font-size: 2.2rem;
          }
        }

        @media (max-width: 1000px) {
          /* On smaller tablets, completely center the popup container and hide hero text */
          .floating-hero-content {
            opacity: 0;
            transform: translateY(-50%) scale(0.95);
            pointer-events: none;
          }
          .popup-container {
            left: 50%;
            right: auto;
            transform: translate(-50%, -50%);
          }
          .logo-header {
            top: 2rem;
            left: 2rem;
          }
        }

        @media (max-width: 480px) {
          .logo-header {
            top: 1.5rem;
            left: 1.5rem;
          }
          .logo-text {
            font-size: 1.25rem;
          }
          .login-popup.glass-panel {
            padding: 2.2rem 1.5rem;
            border-radius: 16px;
          }
          .form-title {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
