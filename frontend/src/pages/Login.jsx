import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../api/admin.api';
import { organizerLogin } from '../api/organizer.api';
import { attenderLogin } from '../api/attender.api';
import { setToken } from '../utils/localStorage';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

// Custom SVG Icons
const IconTicket = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"></path><line x1="13" y1="5" x2="13" y2="19"></line></svg>
);

const Login = () => {
  const [activeTab, setActiveTab] = useState('organizer'); // 'organizer', 'admin', or 'attender'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      let responseData;
      if (activeTab === 'organizer') {
        responseData = await organizerLogin({ email: identifier, password });
      } else if (activeTab === 'admin') {
        responseData = await adminLogin({ username: identifier, password });
      } else {
        responseData = await attenderLogin({ email: identifier, password });
      }
      
      const token = responseData.data?.token;
      if (!token) {
        throw new Error('Token not found in response');
      }
      
      setToken(token);
      const decoded = jwtDecode(token);
      
      login({ 
        role: decoded.role || (activeTab === 'admin' ? 'Admin' : activeTab === 'organizer' ? 'Organizer' : 'Attender'), 
        id: decoded.id, 
        username: decoded.username || decoded.email || 'User'
      }); 
      
      if (activeTab === 'organizer') {
        navigate('/organizer/dashboard');
      } else if (activeTab === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/attender/dashboard');
      }
      
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTab = (tab) => {
    setActiveTab(tab);
    setIdentifier('');
    setPassword('');
    setError('');
  };

  return (
    <div className="login-page-container">
      {/* Outer Wrapper */}
      <div className="split-layout">
        
        {/* LEFT PANEL: branding, illustration */}
        <div className="left-panel">
          <div className="branding-header">
            <div className="logo-box">
              <IconTicket />
            </div>
            <span className="logo-text">EventHub</span>
          </div>

          <div className="branding-body">
            <h2 className="tagline">Create. Manage. Attend Events Seamlessly</h2>
            <p className="tagline-sub">
              An all-in-one suite built for event directors, security coordinators, and attendees. Plan conferences, track ticket bookings, and check in guests instantly.
            </p>
            
            <div className="illustration-wrapper">
              <img 
                src="/login_illustration.png" 
                alt="Event Illustration" 
                className="illustration-img"
              />
              <div className="glow-behind"></div>
            </div>
          </div>

          <div className="branding-footer">
            <span>© 2026 XTOWN Event Systems. All rights reserved.</span>
          </div>
        </div>

        {/* RIGHT PANEL: login card */}
        <div className="right-panel">
          <div className="login-card">
            
            <div className="form-header">
              <h2 className="form-title">Welcome Back</h2>
              <p className="form-subtitle">Please sign in to access your dashboard</p>
            </div>

            {/* Role Tab Controls */}
            <div className="role-selector-container">
              <div className="role-label">Select Account Role</div>
              <div className="tabs-wrapper">
                {['attender', 'organizer', 'admin'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleTab(role)}
                    className={`tab-btn ${activeTab === role ? 'active' : ''}`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="error-alert animate-fade">
                <span className="error-icon">⚠️</span>
                <span className="error-text">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              
              {/* Username / Email field */}
              <div className="form-group">
                <label className="input-label">
                  {activeTab === 'admin' ? 'Username or Email' : 'Email Address'}
                </label>
                <div className="input-wrapper">
                  <input 
                    type={activeTab === 'admin' ? 'text' : 'email'}
                    value={identifier} 
                    onChange={e => setIdentifier(e.target.value)} 
                    placeholder={activeTab === 'admin' ? 'e.g. admin' : 'e.g. user@eventhub.com'} 
                    required 
                    className="styled-input"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="form-group">
                <div className="label-row">
                  <label className="input-label">Password</label>
                  <button 
                    type="button"
                    onClick={() => alert('Password reset is managed by the system administrator. Please reach out directly.')}
                    className="forgot-password-link"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="input-wrapper">
                  <input 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="••••••••" 
                    required 
                    className="styled-input password-input"
                  />
                </div>
              </div>

              {/* Remember Me Checkbox */}
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

              {/* Submit Button */}
              <button 
                type="submit" 
                className="submit-btn" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  `Sign In as ${activeTab === 'admin' ? 'Admin' : activeTab === 'organizer' ? 'Organizer' : 'Attender'}`
                )}
              </button>

            </form>

            {/* Guest Action Panel */}
            <div className="guest-action-footer">
              <span>Looking to register or browse events?</span>
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

      </div>

      {/* Embedded CSS for layout and aesthetics */}
      <style>{`
        /* Core layout definitions */
        .login-page-container {
          min-height: 100vh;
          width: 100vw;
          background: #06070a;
          color: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-family, sans-serif);
          position: relative;
          overflow-x: hidden;
        }

        .split-layout {
          display: flex;
          width: 100%;
          min-height: 100vh;
          position: relative;
        }

        /* Left Branding Panel */
        .left-panel {
          flex: 1.1;
          background: linear-gradient(135deg, #18192a, #0b0c16);
          border-right: 1px solid rgba(255, 255, 255, 0.04);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3rem;
          position: relative;
        }

        .branding-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-box {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, var(--primary-color, #6366f1), var(--accent-cyan, #06b6d4));
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }

        .logo-text {
          font-size: 1.35rem;
          font-weight: 800;
          background: linear-gradient(to right, #ffffff, #c7d2fe);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
          letter-spacing: -0.5px;
          display: inline-block;
          line-height: 1.2;
        }

        .branding-body {
          margin: auto 0;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 540px;
        }

        .tagline {
          font-size: 2.5rem;
          font-weight: 850;
          line-height: 1.15;
          letter-spacing: -1px;
          background: linear-gradient(135deg, #ffffff 30%, #a5b4fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
          margin: 0;
        }

        .tagline-sub {
          font-size: 1rem;
          color: #e5e7eb;
          line-height: 1.5;
          margin: 0;
          position: relative;
          z-index: 3;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9);
        }

        .illustration-wrapper {
          position: relative;
          margin-top: -2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
        }

        .illustration-img {
          width: 100%;
          max-width: 500px;
          height: auto;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 20px 40px rgba(0,0,0,0.6);
          position: relative;
          z-index: 2;
          opacity: 0.9;
          transition: transform 0.3s ease, opacity 0.3s ease;
        }

        .illustration-img:hover {
          transform: scale(1.02);
          opacity: 1;
        }

        .glow-behind {
          position: absolute;
          width: 80%;
          height: 85%;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(99, 102, 241, 0) 70%);
          z-index: 1;
          filter: blur(20px);
        }

        .branding-footer {
          font-size: 0.8rem;
          color: #4b5563;
        }

        /* Right Form Panel */
        .right-panel {
          flex: 0.9;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          position: relative;
          background: #05060b;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          gap: 2.2rem;
        }

        .form-header {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-title {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin: 0;
          color: #fff;
        }

        .form-subtitle {
          color: #9ca3af;
          font-size: 0.925rem;
          margin: 0;
        }

        /* Role Selector Tab controller */
        .role-selector-container {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .role-label {
          font-size: 0.75rem;
          color: #9ca3af;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .tabs-wrapper {
          display: flex;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          padding: 4px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .tab-btn {
          flex: 1;
          padding: 0.65rem 0.5rem;
          border: none;
          background: transparent;
          color: #9ca3af;
          font-size: 0.85rem;
          font-weight: 700;
          border-radius: 9px;
          cursor: pointer;
          font-family: inherit;
          text-transform: capitalize;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .tab-btn:hover {
          color: #fff;
        }

        .tab-btn.active {
          background: var(--primary-color, #6366f1);
          color: #fff;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.35);
        }

        /* Error Alert Banner */
        .error-alert {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: rgba(239, 68, 68, 0.07);
          border: 1px solid rgba(239, 68, 68, 0.2);
          padding: 0.8rem 1rem;
          border-radius: 10px;
          font-size: 0.85rem;
        }

        .error-icon {
          font-size: 1rem;
        }

        .error-text {
          color: #fca5a5;
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
          font-size: 0.825rem;
          color: #9ca3af;
          font-weight: 600;
        }

        .forgot-password-link {
          background: none;
          border: none;
          color: #818cf8;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }

        .forgot-password-link:hover {
          text-decoration: underline;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          color: #4b5563;
          display: flex;
          align-items: center;
          pointer-events: none;
        }

        .styled-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.07);
          padding: 0.85rem 1.2rem;
          border-radius: 10px;
          color: #fff;
          font-size: 0.95rem;
          font-family: inherit;
          outline: none;
          transition: all 0.2s ease;
        }

        .styled-input:focus {
          border-color: var(--primary-color, #6366f1);
          background: rgba(255, 255, 255, 0.04);
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.15);
        }

        .eye-toggle-btn {
          position: absolute;
          right: 1rem;
          background: none;
          border: none;
          color: #4b5563;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.2s ease;
        }

        .eye-toggle-btn:hover {
          color: #9ca3af;
        }

        /* Checkbox remembered browser info */
        .remember-me-container {
          display: flex;
          align-items: center;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          user-select: none;
        }

        .styled-checkbox {
          width: 16px;
          height: 16px;
          accent-color: var(--primary-color, #6366f1);
          cursor: pointer;
        }

        .checkbox-custom-text {
          font-size: 0.825rem;
          color: #9ca3af;
          font-weight: 500;
        }

        /* Submit controller button */
        .submit-btn {
          margin-top: 0.5rem;
          padding: 0.9rem;
          background: var(--primary-color, #6366f1);
          border: none;
          color: #fff;
          font-weight: 750;
          font-size: 0.95rem;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.25);
        }

        .submit-btn:hover:not(:disabled) {
          background: #4f46e5;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(1px);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Spinner graphic */
        .spinner {
          width: 18px;
          height: 18px;
          border: 2.5px solid rgba(255, 255, 255, 0.15);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* Guest Access Footer Panel */
        .guest-action-footer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          text-align: center;
          font-size: 0.85rem;
          color: #9ca3af;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 1.5rem;
          margin-top: 0.5rem;
        }

        .guest-action-btn {
          background: none;
          border: none;
          color: var(--accent-cyan, #06b6d4);
          font-size: 0.9rem;
          font-weight: 750;
          cursor: pointer;
          padding: 0;
          transition: all 0.2s ease;
        }

        .guest-action-btn:hover {
          color: #fff;
          text-shadow: 0 0 8px rgba(6, 182, 212, 0.4);
        }

        /* Animations */
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .animate-fade {
          animation: fadeIn 0.3s ease-in-out forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Media Queries for Split Responsiveness */
        @media (max-width: 960px) {
          .left-panel {
            padding: 2.5rem;
          }
          .tagline {
            font-size: 2.2rem;
          }
          .illustration-img {
            max-width: 360px;
          }
        }

        @media (max-width: 820px) {
          .split-layout {
            flex-direction: column;
          }
          .left-panel {
            flex: none;
            padding: 3rem 2rem;
            align-items: center;
            text-align: center;
          }
          .branding-body {
            align-items: center;
            max-width: 100%;
          }
          .illustration-wrapper {
            display: none; /* Hide illustration on mobile to save vertical scrolling space */
          }
          .right-panel {
            flex: none;
            padding: 3rem 2rem;
            background: #06070a;
          }
          .login-card {
            max-width: 460px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
