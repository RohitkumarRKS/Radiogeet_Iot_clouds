import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAuthModal } from '../Common/AuthModal';
import {
  Home, AlertTriangle, Cpu, Building2, Eye, Users, LayoutDashboard,
  GitBranch, Bell, Package, FileText, Settings, LogOut, Cloud, LogIn, UserPlus,
  Shapes, Network, Monitor, ChevronUp, ChevronDown, Folder, Smartphone, Contact, MonitorSmartphone,
  ArrowRightLeft, RefreshCw, FunctionSquare, Router, Hexagon, Wrench, Box, User, Flag, Activity, PaintRoller, Shield, CreditCard, Menu, X,
  Crown, Building, BarChart3, UserCog
} from 'lucide-react';
import { useState } from 'react';

// Define sidebar navigation items with role restrictions
const navItems = [
  // Super Admin Only Items
  { path: '/admin/tenants', icon: Building, label: 'Tenant Management', superAdminOnly: true },
  { path: '/admin/users', icon: UserCog, label: 'All Users', superAdminOnly: true },
  { path: '/admin/stats', icon: BarChart3, label: 'Platform Stats', superAdminOnly: true },

  // Common items
  { path: '/', icon: Home, label: 'Home', public: true },
  { path: '/alarms', icon: AlertTriangle, label: 'Alarms', adminOnly: true },
  { path: '/dashboards', icon: LayoutDashboard, label: 'Dashboards', public: true },
  { path: '/reporting', icon: FileText, label: 'Reporting', adminOnly: true },
  {
    label: 'Entities',
    icon: Shapes,
    isGroup: true,
    adminOnly: true,
    children: [
      { path: '/devices', icon: MonitorSmartphone, label: 'Devices' },
      { path: '/assets', icon: Building2, label: 'Assets' },
      { path: '/entity-views', icon: Eye, label: 'Entity views' },
      { path: '/gateways', icon: Network, label: 'Gateways' },
      { path: '/emulators', icon: Router, label: 'Emulators' },
    ]
  },
  {
    label: 'Profiles',
    icon: Contact,
    isGroup: true,
    adminOnly: true,
    children: [
      { path: '/device-profiles', icon: Smartphone, label: 'Device profiles' },
      { path: '/asset-profiles', icon: Building2, label: 'Asset profiles' },
    ]
  },
  { path: '/customers', icon: Users, label: 'Customers', adminOnly: true },
  { path: '/users', icon: User, label: 'Users', adminOnly: true },
  {
    label: 'Integrations center',
    icon: Box,
    isGroup: true,
    adminOnly: true,
    children: [
      { path: '/integrations', icon: ArrowRightLeft, label: 'Integrations' },
      { path: '/data-converters', icon: RefreshCw, label: 'Data converters' },
    ]
  },
  { path: '/calculated-fields', icon: FunctionSquare, label: 'Calculated fields', adminOnly: true },
  { path: '/rule-chains', icon: GitBranch, label: 'Rule chains', adminOnly: true },
  {
    label: 'Edge management',
    icon: Router,
    isGroup: true,
    adminOnly: true,
    children: [
      { path: '/edge-instances', icon: Network, label: 'Edge instances' },
      { path: '/edge-rule-chains', icon: GitBranch, label: 'Rule chains' },
    ]
  },
  { path: '/trendz-analytics', icon: Hexagon, label: 'Trendz analytics', adminOnly: true },
  {
    label: 'Advanced features',
    icon: Wrench,
    isGroup: true,
    adminOnly: true,
    children: [
      { path: '/ota-updates', icon: Package, label: 'OTA Updates' },
      { path: '/audit-logs', icon: FileText, label: 'Audit Logs' },
    ]
  },
  {
    label: 'Resources',
    icon: Folder,
    isGroup: true,
    adminOnly: true,
    children: [
      { path: '/resources-library', icon: FileText, label: 'Resource library' },
    ]
  },
  { path: '/notification-center', icon: Flag, label: 'Notification center' },
  { path: '/mobile-center', icon: Smartphone, label: 'Mobile center', adminOnly: true },
  { path: '/api-usage', icon: Activity, label: 'API usage', adminOnly: true },
  { path: '/white-labeling', icon: PaintRoller, label: 'White labeling', adminOnly: true },
  { path: '/settings', icon: Settings, label: 'Settings' },
  {
    label: 'Security',
    icon: Shield,
    isGroup: true,
    adminOnly: true,
    children: [
      { path: '/security-settings', icon: Shield, label: 'Security settings' },
    ]
  },
  { path: '/plan-and-billing', icon: CreditCard, label: 'Plan and billing', adminOnly: true },
];

// Role badge styles
const ROLE_BADGES = {
  SYS_ADMIN: { label: 'Super Admin', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  TENANT_ADMIN: { label: 'Admin', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  CUSTOMER_USER: { label: 'User', color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' },
};

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout, isSuperAdmin, isCustomerUser, canAccessSidebarItem } = useAuth();
  const { requireAuth } = useAuthModal();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({
    'Entities': true,
    'Profiles': true,
    'Integrations center': true,
  });

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'G';

  const roleBadge = user ? ROLE_BADGES[user.role] : null;

  const handleNavClick = (e, item) => {
    if (!user && !item.public) {
      e.preventDefault();
      requireAuth(null, item.label);
    }
  };

  const toggleGroup = (groupLabel) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupLabel]: !prev[groupLabel]
    }));
  };

  // Filter items based on role and permissions
  const filterItem = (item) => {
    // Super Admin-only items
    if (item.superAdminOnly && !isSuperAdmin) return false;

    // Admin-only items hidden from customer users
    if (item.adminOnly && isCustomerUser) return false;

    // Check sidebar permission for items with paths
    if (item.path && user && !item.superAdminOnly) {
      if (!canAccessSidebarItem(item.path)) return false;
    }

    return true;
  };

  const filteredNavItems = navItems.filter(item => {
    if (!filterItem(item)) return false;

    // For groups, filter children too
    if (item.isGroup && item.children) {
      const filteredChildren = item.children.filter(child => filterItem(child));
      if (filteredChildren.length === 0) return false;
    }

    return true;
  });

  const renderNavItem = (item, isNested = false) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path ||
      (item.path !== '/' && location.pathname.startsWith(item.path));

    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={(e) => handleNavClick(e, item)}
        className={`sidebar-nav-item ${isActive ? 'active' : ''} ${isNested ? 'nested' : ''}`}
      >
        <span className="sidebar-nav-item-icon">
          <Icon size={18} />
        </span>
        <span className="sidebar-nav-item-text">{item.label}</span>
        {!user && !item.public && (
          <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', marginLeft: 'auto' }}>
            🔒
          </span>
        )}
        {item.superAdminOnly && (
          <span style={{ fontSize: '10px', marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
            <Crown size={12} style={{ color: '#f59e0b' }} />
          </span>
        )}
      </NavLink>
    );
  };

  return (
    <>
      {/* Overlay backdrop when sidebar is open on mobile */}
      {!collapsed && (
        <div
          className="sidebar-overlay"
          onClick={onToggle}
        />
      )}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-logo">
          <div
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              width: '100%',
              paddingRight: '20px',
            }}
          >
            <img
              src="/radiogeet.png"
              alt="RadioGeet"
              style={{
                height: '62px',
                maxHeight: '65px',
                maxWidth: '217px',
                objectFit: 'contain',
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'inline-block';
              }}
            />
            <span style={{ display: 'none', fontWeight: 800, fontSize: '22px', color: '#ffffff' }}>
              RadioGeet™
            </span>
          </div>
          <button
            className="sidebar-hamburger"
            onClick={onToggle}
            title={collapsed ? "Open Navigation" : "Hide Navigation"}
            id="sidebar-hamburger"
            style={{ position: 'absolute', right: 10 }}
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Super Admin Banner */}
        {isSuperAdmin && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(249,115,22,0.1))',
            borderBottom: '1px solid rgba(239,68,68,0.2)',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '11px',
            fontWeight: 600,
            color: '#f87171',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}>
            <Crown size={14} style={{ color: '#f59e0b' }} />
            Super Admin Mode
          </div>
        )}

        {/* Navigation */}
        <nav className="sidebar-nav">
          {filteredNavItems.map((item, idx) => {
            if (item.isGroup) {
              const isExpanded = expandedGroups[item.label];
              const GroupIcon = item.icon;
              const filteredChildren = (item.children || []).filter(child => filterItem(child));

              return (
                <div key={`group-${idx}`} className="sidebar-group">
                  <button
                    className="sidebar-nav-item group-header"
                    onClick={() => toggleGroup(item.label)}
                  >
                    <span className="sidebar-nav-item-icon">
                      <GroupIcon size={18} />
                    </span>
                    <span className="sidebar-nav-item-text" style={{ fontWeight: 600 }}>{item.label}</span>
                    <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', transition: 'transform 0.2s ease' }}>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </span>
                  </button>

                  <div className={`sidebar-group-children ${isExpanded ? 'expanded' : ''}`}>
                    {filteredChildren.map(child => renderNavItem(child, true))}
                  </div>
                </div>
              );
            }

            return renderNavItem(item);
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {user ? (
            <>
              <div className="sidebar-user" onClick={() => setShowUserMenu(!showUserMenu)}>
                <div className="sidebar-user-avatar" style={
                  isSuperAdmin ? { background: 'linear-gradient(135deg, #ef4444, #f97316)', border: '2px solid #f59e0b' } : {}
                }>{initials}</div>
                <div className="sidebar-user-info">
                  <div className="sidebar-user-name">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div className="sidebar-user-tenant">
                      {user?.Tenant?.name || 'Tenant'}
                    </div>
                    {roleBadge && (
                      <span style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        color: roleBadge.color,
                        background: roleBadge.bg,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        letterSpacing: '0.3px',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                      }}>
                        {roleBadge.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {showUserMenu && (
                <div style={{ marginTop: '8px' }}>
                  <NavLink to="/settings" className="sidebar-nav-item" onClick={() => setShowUserMenu(false)}>
                    <span className="sidebar-nav-item-icon"><Settings size={16} /></span>
                    <span className="sidebar-nav-item-text">Settings</span>
                  </NavLink>
                  <button className="sidebar-nav-item" onClick={logout} style={{ color: 'var(--color-danger)', width: '100%' }}>
                    <span className="sidebar-nav-item-icon"><LogOut size={16} /></span>
                    <span className="sidebar-nav-item-text">Logout</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '4px' }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/login')}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <LogIn size={14} />
                Sign In
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate('/register')}
                style={{ width: '100%', justifyContent: 'center', fontSize: 'var(--font-size-xs)' }}
              >
                <UserPlus size={12} />
                Create Account
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
