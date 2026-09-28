import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, Bell, Menu, LogOut, Settings, User, LogIn, UserPlus, Eye, Cpu, Building2, LayoutDashboard, Maximize, Minimize, MoreVertical } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import api from '../../api/axios';

const routeTitles = {
  '/': 'Home',
  '/alarms': 'Alarms',
  '/devices': 'Devices',
  '/assets': 'Assets',
  '/entity-views': 'Entity Views',
  '/customers': 'Customers',
  '/dashboards': 'Dashboards',
  '/rule-chains': 'Rule Chains',
  '/notifications': 'Notifications',
  '/ota-updates': 'OTA Updates',
  '/audit-logs': 'Audit Logs',
  '/settings': 'Settings',
  '/gateways': 'Gateways',
  '/emulators': 'Telemetry Emulator',
  '/device-profiles': 'Device Profiles',
  '/asset-profiles': 'Asset Profiles',
  '/users': 'Users',
  '/integrations': 'Integrations',
  '/data-converters': 'Data Converters',
  '/calculated-fields': 'Calculated Fields',
  '/edge-instances': 'Edge Instances',
  '/trendz-analytics': 'Trendz Analytics',
  '/resources-library': 'Resource Library',
  '/mobile-center': 'Mobile Center',
  '/api-usage': 'API Usage',
  '/white-labeling': 'White Labeling',
  '/security-settings': 'Security Settings',
  '/reporting': 'Reporting & Exports',
  '/plan-and-billing': 'Plan & Billing',
};

export default function Topbar({ sidebarCollapsed, onMenuToggle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  const currentTitle = routeTitles[location.pathname] ||
    location.pathname.split('/').filter(Boolean).map(s => {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
      if (isUuid) return 'Details';
      return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');
    }).join(' / ');

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('Free');

  useEffect(() => {
    if (user) {
      api.get('/settings').then(res => {
        const plan = res.data?.settings?.billing?.currentPlan;
        if (plan) setCurrentPlan(plan);
      }).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const timer = setTimeout(() => {
      Promise.all([
        api.get('/devices', { params: { search } }),
        api.get('/assets', { params: { search } }),
        api.get('/dashboards', { params: { search } }),
      ]).then(([devRes, assetRes, dashRes]) => {
        const devs = (devRes.data.data || []).slice(0, 3).map(d => ({ id: d.id, name: d.name, category: 'Device', icon: Cpu, path: `/devices/${d.id}` }));
        const assets = (assetRes.data.data || []).slice(0, 3).map(a => ({ id: a.id, name: a.name, category: 'Asset', icon: Building2, path: '/assets' }));
        const dashes = (dashRes.data.data || []).slice(0, 3).map(d => ({ id: d.id, name: d.title, category: 'Dashboard', icon: LayoutDashboard, path: `/dashboards/${d.id}` }));

        setSearchResults([...devs, ...assets, ...dashes]);
        setShowSearchResults(true);
      }).catch(console.error);
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Hamburger button and Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="topbar-icon-btn topbar-hamburger-btn"
            onClick={onMenuToggle}
            title="Open Navigation Menu"
            id="topbar-hamburger"
            style={{ display: sidebarCollapsed ? 'flex' : undefined }}
          >
            <Menu size={22} />
          </button>
          {sidebarCollapsed && (
            <div onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <img
                src="/radiogeet.png"
                alt="RadioGeet"
                style={{ height: '40px', maxHeight: '44px', maxWidth: '150px', objectFit: 'contain' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        <div className="topbar-breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {sidebarCollapsed && <span className="topbar-breadcrumb-separator">/</span>}
          <span className="topbar-breadcrumb-item active" style={{ color: '#ffffff', fontWeight: 600, fontSize: '15px' }}>
            {currentTitle}
          </span>
        </div>
      </div>

      <div className="topbar-right">
        {user ? (
          <>
            {/* ThingsBoard Subscription & Account Status Header */}
            <div className="topbar-subscription-badge" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px', fontSize: '11px', color: 'rgba(255, 255, 255, 0.85)' }}>
              <span>Subscription</span>
              <span style={{ fontWeight: 600, padding: '2px 8px', borderRadius: 12, background: 'rgba(255, 255, 255, 0.2)', color: '#ffffff' }}>{currentPlan}</span>
              <span>Status</span>
              <span style={{ fontWeight: 600, padding: '2px 8px', borderRadius: 12, background: '#00875A', color: '#ffffff' }}>Active</span>
            </div>

            <button
              className="topbar-icon-btn"
              onClick={toggleFullScreen}
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>

            <button
              className="topbar-icon-btn"
              onClick={() => navigate('/notifications')}
              title="Notifications"
              id="notifications-btn"
            >
              <Bell size={18} />
              <span style={{ position: 'absolute', top: 4, right: 4, width: 14, height: 14, borderRadius: '50%', background: '#EF4444', color: '#fff', fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
            </button>

            <div className="dropdown" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                id="user-menu-btn"
                title="Account Settings"
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent',
                  border: 'none', color: '#ffffff', cursor: 'pointer', padding: '4px 8px', borderRadius: 6,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                  <User size={16} />
                </div>
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>
                    {user?.firstName || 'Admin'} {user?.lastName || 'User'}
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.75)' }}>
                    {user?.role === 'TENANT_ADMIN' ? 'Tenant administrator' : 'Customer user'}
                  </div>
                </div>
                <MoreVertical size={16} style={{ color: 'rgba(255, 255, 255, 0.85)', marginLeft: 2 }} />
              </button>

              {showDropdown && (
                <div className="dropdown-menu">
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                      {user?.role === 'TENANT_ADMIN' ? 'Tenant administrator' : 'Customer user'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                      {user?.email}
                    </div>
                  </div>
                  <button className="dropdown-item" onClick={() => { navigate('/settings?tab=profile'); setShowDropdown(false); }}>
                    <User size={16} />
                    Profile
                  </button>
                  <button className="dropdown-item" onClick={() => { navigate('/settings?tab=security'); setShowDropdown(false); }}>
                    <Settings size={16} />
                    Security
                  </button>
                  <button className="dropdown-item" onClick={() => { navigate('/settings?tab=notifications'); setShowDropdown(false); }}>
                    <Bell size={16} />
                    Notification settings
                  </button>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={logout}>
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="topbar-icon-btn"
              onClick={toggleFullScreen}
              title="Toggle Fullscreen"
              style={{ marginRight: '8px' }}
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: 'var(--font-size-xs)', padding: '4px 10px',
              borderRadius: 'var(--border-radius-full)',
              background: 'var(--color-info-bg)', border: '1px solid rgba(37, 99, 235, 0.2)',
              color: 'var(--color-primary)', fontWeight: 500,
            }}>
              <Eye size={12} />
              Guest Demo Mode
            </span>

            <button className="btn btn-outline btn-sm" onClick={() => navigate('/login')} id="topbar-signin-btn">
              <LogIn size={14} />
              Sign In
            </button>

            <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')} id="topbar-register-btn">
              <UserPlus size={14} />
              Register
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
