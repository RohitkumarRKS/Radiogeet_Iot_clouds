import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAuthModal } from '../Common/AuthModal';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useState, useEffect, useCallback } from 'react';

const PUBLIC_PATHS = ['/', '/dashboards', '/superadmin-portal'];

export default function MainLayout() {
  const { user, loading } = useAuth();
  const { requireAuth } = useAuthModal();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 768);

  const isPublicPath = PUBLIC_PATHS.includes(location.pathname) || location.pathname.startsWith('/dashboards/');

  useEffect(() => {
    if (!loading && !user && !isPublicPath) {
      requireAuth(null, location.pathname.replace('/', '').replace('-', ' '));
    }
  }, [user, loading, isPublicPath, location.pathname, requireAuth]);

  // Auto-collapse sidebar on mobile when navigating
  useEffect(() => {
    if (window.innerWidth < 768) {
      setCollapsed(true);
    }
  }, [location.pathname]);

  // Listen for window resize to auto-collapse/expand
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggle = useCallback(() => setCollapsed(prev => !prev), []);
  const handleOverlayClick = useCallback(() => setCollapsed(true), []);

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="app-layout">
      {/* Overlay backdrop for mobile when sidebar is open */}
      {isMobile && !collapsed && (
        <div className="sidebar-overlay" onClick={handleOverlayClick} />
      )}
      <Sidebar collapsed={collapsed} onToggle={handleToggle} />
      <div className="main-content">
        <Topbar sidebarCollapsed={collapsed} onMenuToggle={handleToggle} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
