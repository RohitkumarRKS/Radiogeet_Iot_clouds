import { useState, useEffect, useRef } from 'react';
import {
  Crown, Lock, Building, Users, Activity, Key, LogOut, ArrowRight,
  Shield, CheckCircle2, Plus, Edit2, Trash2, Search, Settings, Mail,
  LayoutDashboard, Cpu, TrendingUp, Sparkles, AlertTriangle, Home,
  Menu, X, Bell, ChevronDown, ChevronUp, Eye, EyeOff, RefreshCw,
  FileText, Globe, Server, Database, Clock, Zap, UserCheck, UserX,
  BarChart3, PieChart, Layers, Hash, Calendar, ArrowUpRight, ArrowDownRight,
  MonitorSmartphone, Package
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import TenantManagement from './TenantManagement';
import AllUsersManagement from './AllUsersManagement';
import PlatformStats from './PlatformStats';
import ProfileSettings from '../Settings/ProfileSettings';
import api from '../../api/axios';

// ============ STANDALONE SUPERADMIN SIDEBAR ============
function SuperAdminSidebar({ activeTab, setActiveTab, onLogout, user, collapsed, onToggle }) {
  const sidebarItems = [
    { id: 'overview', icon: Home, label: 'Overview' },
    { id: 'tenants', icon: Building, label: 'Tenants & Plans' },
    { id: 'users', icon: Users, label: 'All Users' },
    { id: 'stats', icon: BarChart3, label: 'Platform Metrics' },
    { id: 'settings', icon: Settings, label: 'System Settings' },
  ];

  return (
    <>
      {!collapsed && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
            zIndex: 998, display: 'none',
          }}
          className="sa-sidebar-overlay"
          onClick={onToggle}
        />
      )}
      <aside
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0,
          width: collapsed ? 0 : 260,
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column',
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden', zIndex: 999,
          boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: 12, minWidth: 260,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
            flexShrink: 0,
          }}>
            <Crown size={20} style={{ color: '#fff' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap' }}>
              Super Admin
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>
              Control Center
            </div>
          </div>
          <button
            onClick={onToggle}
            style={{
              background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 6,
              padding: 6, cursor: 'pointer', color: '#94a3b8', flexShrink: 0,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Super Admin Badge */}
        <div style={{
          margin: '12px 14px 4px', padding: '8px 12px', borderRadius: 8,
          background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 11, fontWeight: 700, color: '#f87171',
          letterSpacing: '0.5px', textTransform: 'uppercase', minWidth: 230,
        }}>
          <Shield size={14} style={{ color: '#f59e0b' }} />
          System Administrator
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 10px', overflow: 'auto', minWidth: 260 }}>
          {sidebarItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  width: '100%', padding: '10px 14px', borderRadius: 8,
                  border: 'none', cursor: 'pointer', marginBottom: 2,
                  background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: isActive ? '#818cf8' : '#94a3b8',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 13, textAlign: 'left',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = '#e2e8f0';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#94a3b8';
                  }
                }}
              >
                <span style={{
                  width: 32, height: 32, borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isActive ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.04)',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}>
                  <Icon size={17} />
                </span>
                {item.label}
                {isActive && (
                  <div style={{
                    marginLeft: 'auto', width: 3, height: 20, borderRadius: 2,
                    background: '#6366f1',
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Footer */}
        <div style={{
          padding: '14px 14px 18px', borderTop: '1px solid rgba(255,255,255,0.06)',
          minWidth: 260,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 10,
            background: 'rgba(255,255,255,0.04)',
            marginBottom: 10,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: 'linear-gradient(135deg, #ef4444, #f97316)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 13, fontWeight: 800, flexShrink: 0,
            }}>
              SA
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '10px 0', borderRadius: 8,
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.08)',
              color: '#f87171', fontWeight: 700, fontSize: 13,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            }}
          >
            <LogOut size={15} /> Exit Super Admin
          </button>
        </div>
      </aside>
    </>
  );
}

// ============ STANDALONE SUPERADMIN TOPBAR ============
function SuperAdminTopbar({ activeTab, collapsed, onToggle }) {
  const tabLabels = {
    overview: 'Overview Dashboard',
    tenants: 'Tenant & Plan Management',
    users: 'User Management',
    stats: 'Platform Metrics',
    settings: 'System Settings',
  };

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      height: 56, display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: 14,
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
    }}>
      {collapsed && (
        <button
          onClick={onToggle}
          style={{
            background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8,
            padding: 8, cursor: 'pointer', color: '#e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
        >
          <Menu size={20} />
        </button>
      )}

      {collapsed && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Crown size={16} style={{ color: '#fff' }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>Super Admin</span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: collapsed ? 8 : 0 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>
          {tabLabels[activeTab] || 'Super Admin'}
        </span>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 11, color: 'rgba(255,255,255,0.7)',
      }}>
        <span style={{
          background: '#ef4444', color: '#fff', padding: '2px 10px',
          borderRadius: 12, fontWeight: 700, fontSize: 10,
          letterSpacing: '0.5px', textTransform: 'uppercase',
        }}>
          SUPER ADMIN
        </span>
        <span style={{
          background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', padding: '2px 10px',
          borderRadius: 12, fontWeight: 600, fontSize: 10,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <CheckCircle2 size={10} /> Full Access
        </span>
      </div>
    </header>
  );
}

// ============ OVERVIEW DASHBOARD CONTENT ============
function OverviewDashboard({ stats, tenants, loading, onRefresh, setActiveTab }) {
  const statCards = [
    { label: 'Total Tenants', value: stats?.tenantCount || 0, icon: Building, color: '#16a34a', bg: '#f0fdf4', borderColor: '#bbf7d0', desc: 'Active Organizations' },
    { label: 'Total Users', value: stats?.userCount || 0, icon: Users, color: '#2563eb', bg: '#eff6ff', borderColor: '#bfdbfe', desc: `${stats?.usersByRole?.tenantAdmins || 0} Admins • ${stats?.usersByRole?.customerUsers || 0} Users` },
    { label: 'IoT Devices', value: stats?.deviceCount || 0, icon: MonitorSmartphone, color: '#9333ea', bg: '#faf5ff', borderColor: '#e9d5ff', desc: 'Connected Endpoints' },
    { label: 'Dashboards', value: stats?.dashboardCount || 0, icon: LayoutDashboard, color: '#ea580c', bg: '#fff7ed', borderColor: '#fed7aa', desc: 'Active Dashboards' },
    { label: 'Customers', value: stats?.customerCount || 0, icon: UserCheck, color: '#0891b2', bg: '#ecfeff', borderColor: '#a5f3fc', desc: 'Registered Clients' },
    { label: 'Active Alarms', value: stats?.alarmCount || 0, icon: AlertTriangle, color: '#dc2626', bg: '#fef2f2', borderColor: '#fecaca', desc: 'Requires Attention' },
    { label: 'Recent Logins', value: stats?.recentLogins || 0, icon: Clock, color: '#ca8a04', bg: '#fefce8', borderColor: '#fef08a', desc: 'Last 24 Hours' },
    { label: 'Active Users', value: stats?.usersByStatus?.active || 0, icon: Zap, color: '#059669', bg: '#ecfdf5', borderColor: '#a7f3d0', desc: `${stats?.usersByStatus?.inactive || 0} Inactive` },
  ];

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #7c3aed 100%)',
        borderRadius: 16, padding: '28px 32px', marginBottom: 28,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -20, right: 80, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>
            Welcome, Super Admin 👋
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', margin: 0, maxWidth: 500 }}>
            Platform administration dashboard — manage tenants, users, plans, and system-wide configurations.
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10,
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff', fontWeight: 700, fontSize: 13,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s', position: 'relative', zIndex: 1,
            backdropFilter: 'blur(8px)',
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
        >
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 16, marginBottom: 28,
      }}>
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} style={{
              background: '#ffffff', borderRadius: 14, padding: '20px 22px',
              border: `1px solid ${card.borderColor}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'all 0.2s ease', cursor: 'default',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {card.label}
                </span>
                <div style={{
                  padding: 8, borderRadius: 10, background: card.bg,
                  color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={18} />
                </div>
              </div>
              <div style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                {loading ? '...' : card.value}
              </div>
              <div style={{ fontSize: 12, color: card.color, marginTop: 6, fontWeight: 600 }}>
                {card.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tenant Quick Management Table */}
      <div style={{
        background: '#ffffff', borderRadius: 14, padding: 24,
        border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Tenant Organizations & Plan Management
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '2px 0 0' }}>
              Quickly view and modify tenant plans across the platform
            </p>
          </div>
          <button
            onClick={() => setActiveTab('tenants')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', borderRadius: 8,
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: '#fff', border: 'none', fontWeight: 700, fontSize: 13,
              cursor: 'pointer', boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Building size={15} /> Manage All Tenants
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                {['Tenant Name', 'Plan Tier', 'Users', 'Devices', 'Created', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: h === 'Actions' ? 'right' : 'left',
                    fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tenants.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                  {loading ? 'Loading tenants...' : 'No tenants found'}
                </td></tr>
              ) : tenants.slice(0, 8).map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a', fontSize: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#6366f1',
                      }}>
                        <Building size={15} />
                      </div>
                      {t.name}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '4px 12px', borderRadius: 20, fontWeight: 700, fontSize: 11,
                      letterSpacing: '0.03em',
                      background: t.plan === 'ENTERPRISE' ? '#f0fdf4' : t.plan === 'PRO' ? '#eff6ff' : t.plan === 'STARTER' ? '#faf5ff' : '#f8fafc',
                      color: t.plan === 'ENTERPRISE' ? '#16a34a' : t.plan === 'PRO' ? '#2563eb' : t.plan === 'STARTER' ? '#9333ea' : '#64748b',
                      border: `1px solid ${t.plan === 'ENTERPRISE' ? '#bbf7d0' : t.plan === 'PRO' ? '#bfdbfe' : t.plan === 'STARTER' ? '#e9d5ff' : '#e2e8f0'}`,
                    }}>
                      {t.plan || 'FREE'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#475569', fontWeight: 600, fontSize: 14 }}>
                    {t.userCount || 0}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#475569', fontWeight: 600, fontSize: 14 }}>
                    {t.deviceCount || 0}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: 12 }}>
                    {t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => setActiveTab('tenants')}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '6px 12px', borderRadius: 6,
                        background: '#f1f5f9', border: '1px solid #e2e8f0',
                        color: '#6366f1', fontWeight: 700, fontSize: 12,
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; }}
                    >
                      <Edit2 size={13} /> Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============ MAIN SUPERADMIN PORTAL ============
export default function SuperAdminPortal() {
  const { superAdminUser, loginSuperAdmin, logoutSuperAdmin, superAdminLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Login form state
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Overview data
  const [overviewStats, setOverviewStats] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (superAdminUser) {
      fetchOverviewData();
    }
  }, [superAdminUser]);

  // Set document title
  useEffect(() => {
    document.title = superAdminUser
      ? 'Super Admin — RadioGeet Control Center'
      : 'Super Admin Login — RadioGeet';
    return () => { document.title = 'RadioGeet Cloud'; };
  }, [superAdminUser]);

  const fetchOverviewData = async () => {
    try {
      setLoadingData(true);
      const [statsRes, tenantsRes] = await Promise.all([
        api.get('/admin/stats', { headers: { 'X-Portal': 'superadmin' } }),
        api.get('/admin/tenants?pageSize=100', { headers: { 'X-Portal': 'superadmin' } })
      ]);
      setOverviewStats(statsRes.data);
      setTenants(tenantsRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch superadmin overview data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSuperAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);
    try {
      await loginSuperAdmin(adminId, password);
    } catch (err) {
      setLoginError(err.response?.data?.error || 'Super Admin authentication failed. Invalid ID or Password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============ LOADING STATE ============
  if (superAdminLoading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 50%, #e2e8f0 100%)',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, border: '3px solid #e2e8f0',
            borderTopColor: '#6366f1', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
          }} />
          <p style={{ color: '#64748b', fontSize: 14, fontWeight: 500 }}>Loading Super Admin Portal...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ============ LOGIN SCREEN ============
  if (!superAdminUser) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 50%, #e2e8f0 100%)',
        color: '#1e293b', padding: 20,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative Background Elements */}
        <div style={{
          position: 'absolute', top: '-15%', left: '-10%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.06)', filter: 'blur(80px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', right: '-10%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'rgba(59, 130, 246, 0.06)', filter: 'blur(80px)',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'rgba(139, 92, 246, 0.04)', filter: 'blur(60px)',
          transform: 'translate(-50%, -50%)',
        }} />

        <div style={{
          width: '100%', maxWidth: 460, background: '#ffffff',
          borderRadius: 20, padding: '44px 40px',
          boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.1), 0 0 1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0', position: 'relative', zIndex: 1,
        }}>
          {/* Logo & Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: '12px 20px', background: '#f8fafc', borderRadius: 14,
              marginBottom: 20, border: '1px solid #f1f5f9',
            }}>
              <img
                src="/radiogeet_logo.png"
                alt="RadioGeet Logo"
                style={{ height: 36, objectFit: 'contain' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginLeft: 10 }}>
                RadioGeet<sup style={{ fontSize: 10, color: '#6366f1' }}>TM</sup>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '0 0 6px' }}>
              <Crown size={22} style={{ color: '#6366f1' }} />
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Super Admin Portal
              </h1>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
              System Restricted Control Center — Master Authentication Required
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSuperAdminLogin}>
            {loginError && (
              <div style={{
                padding: '12px 16px', borderRadius: 10,
                background: '#fef2f2', border: '1px solid #fecaca',
                color: '#dc2626', fontSize: 13, marginBottom: 20,
                display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500,
              }}>
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                {loginError}
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block', fontSize: 12, fontWeight: 700, color: '#475569',
                marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                Super Admin ID
              </label>
              <div style={{ position: 'relative' }}>
                <Key size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6366f1' }} />
                <input
                  type="text"
                  value={adminId}
                  onChange={e => setAdminId(e.target.value)}
                  placeholder="Enter Super Admin ID"
                  required
                  autoFocus
                  style={{
                    width: '100%', paddingLeft: 44, paddingRight: 14,
                    height: 48, borderRadius: 10,
                    background: '#f8fafc', border: '1.5px solid #cbd5e1',
                    color: '#0f172a', fontSize: 14, fontWeight: 500,
                    outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{
                display: 'block', fontSize: 12, fontWeight: 700, color: '#475569',
                marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                Master Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6366f1' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter Master Password"
                  required
                  style={{
                    width: '100%', paddingLeft: 44, paddingRight: 48,
                    height: 48, borderRadius: 10,
                    background: '#f8fafc', border: '1.5px solid #cbd5e1',
                    color: '#0f172a', fontSize: 14, fontWeight: 500,
                    outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#94a3b8', padding: 4, display: 'flex',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#6366f1'}
                  onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%', height: 50, borderRadius: 10,
                background: isSubmitting
                  ? '#a5b4fc'
                  : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: '#ffffff', border: 'none', fontWeight: 700, fontSize: 15,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.45)'; }}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.35)'}
            >
              {isSubmitting ? (
                <>
                  <div style={{
                    width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield size={18} />
                  Unlock Super Admin Console
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 14px', borderRadius: 10,
            background: '#fffbeb', border: '1px solid #fef3c7',
            marginTop: 20, fontSize: 12, color: '#92400e',
          }}>
            <Lock size={14} style={{ flexShrink: 0 }} />
            This portal is restricted to authorized system administrators only.
          </div>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#94a3b8' }}>
            © 2026 RadioGeet Digital Pvt Ltd. All Rights Reserved.
          </div>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ============ AUTHENTICATED SUPER ADMIN LAYOUT ============
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f1f5f9',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      color: '#1e293b',
    }}>
      {/* Standalone Sidebar */}
      <SuperAdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={logoutSuperAdmin}
        user={superAdminUser}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div style={{
        marginLeft: sidebarCollapsed ? 0 : 260,
        transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Standalone Topbar */}
        <SuperAdminTopbar
          activeTab={activeTab}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Content Area */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {activeTab === 'overview' && (
            <OverviewDashboard
              stats={overviewStats}
              tenants={tenants}
              loading={loadingData}
              onRefresh={fetchOverviewData}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'tenants' && (
            <div style={{ padding: '24px 28px' }}>
              <TenantManagement />
            </div>
          )}

          {activeTab === 'users' && (
            <div style={{ padding: '24px 28px' }}>
              <AllUsersManagement />
            </div>
          )}

          {activeTab === 'stats' && (
            <div style={{ padding: '24px 28px' }}>
              <PlatformStats />
            </div>
          )}

          {activeTab === 'settings' && (
            <div style={{ padding: '24px 28px' }}>
              <ProfileSettings />
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        @media (max-width: 768px) {
          .sa-sidebar-overlay { display: block !important; }
        }
      `}</style>
    </div>
  );
}
