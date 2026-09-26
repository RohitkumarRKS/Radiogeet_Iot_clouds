import { useState, createContext, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, LogIn, UserPlus, ShieldAlert, X } from 'lucide-react';

const AuthModalContext = createContext(null);

export function AuthModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: 'Authentication Required',
    message: 'Please sign in or create an account to access this feature.',
    featureName: '',
  });
  const navigate = useNavigate();

  const requireAuth = useCallback((callback, featureName = '') => {
    const token = localStorage.getItem('token');
    if (token) {
      if (typeof callback === 'function') callback();
      return true;
    } else {
      setModalConfig({
        title: 'Authentication Required',
        message: featureName 
          ? `You need an account to access ${featureName}. Sign in or create a free account to continue.`
          : 'You are currently in Guest Mode. Sign in or create an account to access full device management and IoT controls.',
        featureName,
      });
      setIsOpen(true);
      return false;
    }
  }, []);

  const closeModal = () => {
    setIsOpen(false);
    // If the user closed the modal but they are on a protected page, send them back to Home.
    const isPublic = window.location.pathname === '/' || window.location.pathname.startsWith('/dashboards');
    if (!isPublic) {
      navigate('/');
    }
  };

  const handleSignIn = () => {
    setIsOpen(false);
    navigate('/login');
  };

  const handleRegister = () => {
    setIsOpen(false);
    navigate('/register');
  };

  return (
    <AuthModalContext.Provider value={{ requireAuth, openAuthModal: (msg) => requireAuth(null, msg) }}>
      {children}
      {isOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div 
            className="modal-container animate-scaleUp" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '440px', padding: 'var(--space-6)' }}
          >
            <button type="button" className="modal-close" onClick={closeModal} aria-label="Close auth dialog">
              <X size={18} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(59, 130, 246, 0.12)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)',
                marginBottom: 'var(--space-3)',
              }}>
                <Lock size={28} />
              </div>
              <h2 className="modal-title" style={{ fontSize: 'var(--font-size-xl)' }}>
                {modalConfig.title}
              </h2>
              <p className="modal-subtitle" style={{ marginTop: 'var(--space-2)', lineHeight: '1.5' }}>
                {modalConfig.message}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
              <button 
                className="btn btn-primary btn-lg" 
                onClick={handleSignIn}
                style={{ width: '100%', justifyContent: 'center' }}
                id="auth-modal-signin"
              >
                <LogIn size={18} />
                Sign In to RadioGeet
              </button>

              <button 
                className="btn btn-secondary btn-lg" 
                onClick={handleRegister}
                style={{ width: '100%', justifyContent: 'center' }}
                id="auth-modal-register"
              >
                <UserPlus size={18} />
                Create Free Account
              </button>

              <button 
                className="btn btn-ghost" 
                onClick={closeModal}
                style={{ width: '100%', justifyContent: 'center', color: 'var(--color-text-tertiary)' }}
              >
                Continue Previewing Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error('useAuthModal must be used within AuthModalProvider');
  return ctx;
}
