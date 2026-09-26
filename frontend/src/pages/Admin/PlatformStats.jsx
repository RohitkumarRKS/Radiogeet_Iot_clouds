import { useState, useEffect } from 'react';
import {
  Building, Users, Cpu, LayoutDashboard, AlertTriangle, UserCheck,
  Crown, Activity, Shield, UserX, TrendingUp
} from 'lucide-react';
import api from '../../api/axios';

export default function PlatformStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
        Loading platform statistics...
      </div>
    );
  }

  const statCards = [
    { label: 'Total Tenants', value: stats?.tenantCount || 0, icon: Building, color: '#8b5cf6', gradient: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))' },
    { label: 'Total Users', value: stats?.userCount || 0, icon: Users, color: '#3b82f6', gradient: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))' },
    { label: 'Total Devices', value: stats?.deviceCount || 0, icon: Cpu, color: '#10b981', gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))' },
    { label: 'Dashboards', value: stats?.dashboardCount || 0, icon: LayoutDashboard, color: '#f59e0b', gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))' },
    { label: 'Active Alarms', value: stats?.alarmCount || 0, icon: AlertTriangle, color: '#ef4444', gradient: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))' },
    { label: 'Customers', value: stats?.customerCount || 0, icon: UserCheck, color: '#06b6d4', gradient: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(6,182,212,0.05))' },
  ];

  const roleCards = [
    { label: 'Super Admins', value: stats?.usersByRole?.sysAdmins || 0, icon: Crown, color: '#ef4444' },
    { label: 'Tenant Admins', value: stats?.usersByRole?.tenantAdmins || 0, icon: Shield, color: '#3b82f6' },
    { label: 'Customer Users', value: stats?.usersByRole?.customerUsers || 0, icon: Users, color: '#94a3b8' },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px',
      }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: 'linear-gradient(135deg, #ef4444, #f97316)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Activity size={22} color="#fff" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#f1f5f9' }}>Platform Statistics</h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Overview of the entire platform</p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
      }}>
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} style={{
              background: card.gradient,
              border: `1px solid ${card.color}22`,
              borderRadius: '14px',
              padding: '20px',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'default',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${card.color}22`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <Icon size={22} style={{ color: card.color }} />
                <TrendingUp size={14} style={{ color: `${card.color}88` }} />
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px' }}>
                {card.value.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', fontWeight: 500 }}>
                {card.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Users by Role */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        borderRadius: '14px',
        padding: '24px',
        marginBottom: '28px',
      }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', marginBottom: '16px', margin: '0 0 16px 0' }}>Users by Role</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {roleCards.map((card) => {
            const Icon = card.icon;
            const total = stats?.userCount || 1;
            const percentage = Math.round((card.value / total) * 100) || 0;
            return (
              <div key={card.label} style={{
                background: `${card.color}0A`,
                border: `1px solid ${card.color}22`,
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
              }}>
                <Icon size={24} style={{ color: card.color, marginBottom: '8px' }} />
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#f1f5f9' }}>{card.value}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{card.label}</div>
                <div style={{
                  marginTop: '8px',
                  height: '4px',
                  borderRadius: '2px',
                  background: 'rgba(255,255,255,0.05)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    borderRadius: '2px',
                    background: card.color,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
                <div style={{ fontSize: '10px', color: `${card.color}`, marginTop: '4px' }}>{percentage}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Status & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* User Status */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '14px',
          padding: '24px',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 16px 0' }}>Account Status</h2>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{
              flex: 1, textAlign: 'center', padding: '16px',
              background: 'rgba(16, 185, 129, 0.08)', borderRadius: '10px',
              border: '1px solid rgba(16, 185, 129, 0.15)',
            }}>
              <UserCheck size={24} style={{ color: '#10b981', marginBottom: '8px' }} />
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981' }}>
                {stats?.usersByStatus?.active || 0}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Active</div>
            </div>
            <div style={{
              flex: 1, textAlign: 'center', padding: '16px',
              background: 'rgba(239, 68, 68, 0.08)', borderRadius: '10px',
              border: '1px solid rgba(239, 68, 68, 0.15)',
            }}>
              <UserX size={24} style={{ color: '#ef4444', marginBottom: '8px' }} />
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#ef4444' }}>
                {stats?.usersByStatus?.inactive || 0}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Inactive</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '14px',
          padding: '24px',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 16px 0' }}>Recent Activity</h2>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: 'calc(100% - 40px)',
          }}>
            <Activity size={36} style={{ color: '#3b82f6', marginBottom: '12px' }} />
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#f1f5f9' }}>
              {stats?.recentLogins || 0}
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>Logins in last 24 hours</div>
          </div>
        </div>
      </div>
    </div>
  );
}
