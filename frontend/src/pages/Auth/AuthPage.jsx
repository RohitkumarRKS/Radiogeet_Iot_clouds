import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, User, Building, CheckCircle2 } from 'lucide-react';

export default function AuthPage({ initialMode = 'login' }) {
  const location = useLocation();
  const isRegisterPage = location.pathname === '/register' || initialMode === 'register';
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('admin@cloudboard.io');
  const [loginPassword, setLoginPassword] = useState('demo1234');
  const [rememberMe, setRememberMe] = useState(true);
  
  // Register form state
  const [regForm, setRegForm] = useState({ email: '', password: '', firstName: '', lastName: '', tenantName: '' });
  
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setError('');
  }, [location.pathname]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(regForm);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-reference-page">
      {/* Background Soft Orbs */}
      <div className="ref-orb-1" />
      <div className="ref-orb-2" />
      <div className="ref-orb-3" />

      <div className="auth-reference-container">
        
        {/* LEFT SIDE: Light Hero Content matching reference image */}
        <div className="auth-ref-hero-side">
          <div className="ref-hero-body">
            <h1 className="ref-hero-title">
              {isRegisterPage ? 'Get Started!' : 'Welcome Back!'}
            </h1>
            <h2 className="ref-hero-subtitle">
              Hello RadioGeet! 👋
            </h2>
            <p className="ref-hero-desc">
              Your trusted platform for real-time IoT device management, telemetry data collection, and smart cloud automation across India.
            </p>

            <div className="ref-hero-accent-line" />

            <div className="ref-hero-bullets">
              <div className="ref-bullet-item">
                <CheckCircle2 size={18} className="ref-bullet-icon" />
                <span>Real-time Telemetry & Live Data Updates</span>
              </div>
              <div className="ref-bullet-item">
                <CheckCircle2 size={18} className="ref-bullet-icon" />
                <span>Smart Device Control & Remote RPC Commands</span>
              </div>
              <div className="ref-bullet-item">
                <CheckCircle2 size={18} className="ref-bullet-icon" />
                <span>Exclusive Enterprise Security & Multi-Tenant Analytics</span>
              </div>
            </div>
          </div>

          <div className="ref-hero-footer">
            © 2026 Radiogeet Digital Pvt Ltd. All Rights Reserved.
          </div>
        </div>

        {/* RIGHT SIDE: Dark Navy Card Container matching logo palette */}
        <div className="auth-ref-card-side">
          <div className="auth-ref-dark-card animate-fadeIn">
            <div className="ref-card-logo">
              <img 
                src="/radiogeet_logo.png" 
                alt="RadioGeet Logo" 
                className="ref-logo-img"
              />
            </div>

            <h2 className="ref-card-title">
              {isRegisterPage ? 'Create Account' : 'Welcome Back!'}
            </h2>
            <p className="ref-card-subtitle">
              {isRegisterPage ? 'Register your account to continue.' : 'Sign in to your account to continue.'}
            </p>

            {error && <div className="ref-error-alert">{error}</div>}

            {!isRegisterPage ? (
              /* LOGIN FORM */
              <form onSubmit={handleLoginSubmit} className="ref-auth-form">
                <div className="ref-form-group">
                  <div className="ref-input-wrapper">
                    <Mail className="ref-input-icon" size={18} />
                    <input
                      type="text"
                      className="ref-form-input"
                      placeholder="admin@cloudboard.io or Admin@#2002"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="ref-form-group">
                  <div className="ref-input-wrapper">
                    <Lock className="ref-input-icon" size={18} />
                    <input
                      type={showPass ? 'text' : 'password'}
                      className="ref-form-input"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="ref-pass-toggle"
                      onClick={() => setShowPass(!showPass)}
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="ref-options-row">
                  <label className="ref-checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={rememberMe} 
                      onChange={(e) => setRememberMe(e.target.checked)} 
                    />
                    <span>Remember me</span>
                  </label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Demo login credentials: admin@cloudboard.io / demo1234'); }} className="ref-forgot-link">
                    Forgot password?
                  </a>
                </div>

                <button type="submit" className="ref-submit-btn" disabled={loading}>
                  {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Login Now'}
                </button>

                <div className="ref-toggle-footer">
                  Don't have an account?{' '}
                  <button type="button" className="ref-toggle-btn" onClick={() => navigate('/register')}>
                    Register now
                  </button>
                </div>
              </form>
            ) : (
              /* REGISTER FORM */
              <form onSubmit={handleRegisterSubmit} className="ref-auth-form">
                <div className="ref-grid-2">
                  <div className="ref-form-group">
                    <div className="ref-input-wrapper">
                      <User className="ref-input-icon" size={18} />
                      <input 
                        className="ref-form-input" 
                        placeholder="First Name" 
                        value={regForm.firstName} 
                        onChange={(e) => setRegForm({ ...regForm, firstName: e.target.value })} 
                        required 
                      />
                    </div>
                  </div>
                  <div className="ref-form-group">
                    <div className="ref-input-wrapper">
                      <input 
                        className="ref-form-input" 
                        placeholder="Last Name" 
                        value={regForm.lastName} 
                        onChange={(e) => setRegForm({ ...regForm, lastName: e.target.value })} 
                        style={{ paddingLeft: '16px' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="ref-form-group">
                  <div className="ref-input-wrapper">
                    <Building className="ref-input-icon" size={18} />
                    <input 
                      className="ref-form-input" 
                      placeholder="Organization Name" 
                      value={regForm.tenantName} 
                      onChange={(e) => setRegForm({ ...regForm, tenantName: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="ref-form-group">
                  <div className="ref-input-wrapper">
                    <Mail className="ref-input-icon" size={18} />
                    <input 
                      type="email" 
                      className="ref-form-input" 
                      placeholder="Email Address" 
                      value={regForm.email} 
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} 
                      required 
                    />
                  </div>
                </div>

                <div className="ref-form-group">
                  <div className="ref-input-wrapper">
                    <Lock className="ref-input-icon" size={18} />
                    <input 
                      type="password" 
                      className="ref-form-input" 
                      placeholder="Password (Min 6 characters)" 
                      value={regForm.password} 
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} 
                      required 
                      minLength={6} 
                    />
                  </div>
                </div>

                <button type="submit" className="ref-submit-btn" disabled={loading}>
                  {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Register Now'}
                </button>

                <div className="ref-toggle-footer">
                  Already have an account?{' '}
                  <button type="button" className="ref-toggle-btn" onClick={() => navigate('/login')}>
                    Sign in now
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
