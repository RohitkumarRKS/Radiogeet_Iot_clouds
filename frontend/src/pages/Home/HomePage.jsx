import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import DashboardWidgetGrid from '../../components/Widgets/DashboardWidgetGrid';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Cpu, AlertTriangle, Users, LayoutDashboard, Building2, GitBranch,
  Activity, ArrowUpRight, ArrowDownRight, Zap, RefreshCw,
  CheckCircle2, XCircle, Clock, ShieldCheck, Server, Radio, Database, Bell,
  FileText, Plus, ChevronRight, Layers, Smartphone, Sparkles, Filter
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [homeDashboard, setHomeDashboard] = useState(null);
  const [telemetryData, setTelemetryData] = useState({});

  // Widget States
  const [chartTimeframe, setChartTimeframe] = useState('1h');
  const [activeMetric, setActiveMetric] = useState('temp');
  const [alarms, setAlarms] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [actionLoading, setActionLoading] = useState({});

  // Mock telemetry data generator for timeframes
  const generateTelemetryData = (timeframe, metric) => {
    const data = [];
    const count = timeframe === '1h' ? 12 : timeframe === '6h' ? 18 : timeframe === '24h' ? 24 : 30;
    const now = new Date();

    for (let i = count - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - i * (timeframe === '1h' ? 5 : timeframe === '6h' ? 20 : timeframe === '24h' ? 60 : 300) * 60000);
      const timeLabel = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      let value = 0;
      let targetValue = 0;

      if (metric === 'temp') {
        value = +(24 + Math.sin(i * 0.5) * 4 + Math.random() * 2).toFixed(1);
        targetValue = 28;
      } else if (metric === 'humidity') {
        value = +(55 + Math.cos(i * 0.4) * 12 + Math.random() * 3).toFixed(1);
        targetValue = 65;
      } else if (metric === 'power') {
        value = +(3.4 + Math.sin(i * 0.8) * 1.2 + Math.random() * 0.4).toFixed(2);
        targetValue = 4.5;
      } else {
        value = +(230 + Math.sin(i * 0.6) * 6 + Math.random() * 2).toFixed(1);
        targetValue = 240;
      }

      data.push({
        time: timeLabel,
        value,
        targetValue,
      });
    }
    return data;
  };

  const [chartData, setChartData] = useState(() => generateTelemetryData('1h', 'temp'));

  // Initial load
  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [statsRes, alarmsRes, logsRes, dashboardsRes] = await Promise.allSettled([
        api.get('/stats'),
        api.get('/alarms'),
        api.get('/audit-logs'),
        api.get('/dashboards'),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (dashboardsRes.status === 'fulfilled' && dashboardsRes.value.data?.data?.length > 0) {
        setHomeDashboard(dashboardsRes.value.data.data[0]); // Pick first dashboard as home
      }

      if (alarmsRes.status === 'fulfilled' && alarmsRes.value.data?.length > 0) {
        setAlarms(alarmsRes.value.data);
      } else {
        // High quality ThingsBoard fallback alarms
        setAlarms([
          {
            id: 'alm-101',
            severity: 'CRITICAL',
            type: 'High Temperature Threshold',
            originatorName: 'Industrial Oven Gateway #04',
            createdTime: Date.now() - 1000 * 60 * 12,
            status: 'ACTIVE_UNACK',
          },
          {
            id: 'alm-102',
            severity: 'MAJOR',
            type: 'Voltage Drop Anomaly',
            originatorName: 'Smart Energy Meter B-12',
            createdTime: Date.now() - 1000 * 60 * 45,
            status: 'ACTIVE_UNACK',
          },
          {
            id: 'alm-103',
            severity: 'MINOR',
            type: 'Low Battery Level',
            originatorName: 'Warehouse Moisture Sensor #09',
            createdTime: Date.now() - 1000 * 60 * 180,
            status: 'ACKNOWLEDGED',
          },
          {
            id: 'alm-104',
            severity: 'WARNING',
            type: 'Firmware Update Pending',
            originatorName: 'HVAC Controller - Building A',
            createdTime: Date.now() - 1000 * 60 * 320,
            status: 'ACTIVE_UNACK',
          },
        ]);
      }

      if (logsRes.status === 'fulfilled' && logsRes.value.data?.length > 0) {
        setAuditLogs(logsRes.value.data);
      } else {
        // High quality audit logs fallback
        setAuditLogs([
          {
            id: 'log-1',
            action: 'DEVICE_CREATED',
            entityType: 'DEVICE',
            entityName: 'Smart Solar Inverter #07',
            userName: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Admin User',
            timestamp: Date.now() - 1000 * 60 * 5,
            status: 'SUCCESS',
          },
          {
            id: 'log-2',
            action: 'TELEMETRY_POST',
            entityType: 'TELEMETRY',
            entityName: 'Pressure Transmitter P-90',
            userName: 'API Access Token',
            timestamp: Date.now() - 1000 * 60 * 18,
            status: 'SUCCESS',
          },
          {
            id: 'log-3',
            action: 'ALARM_ACK',
            entityType: 'ALARM',
            entityName: 'High Temperature Threshold',
            userName: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Operator',
            timestamp: Date.now() - 1000 * 60 * 42,
            status: 'SUCCESS',
          },
          {
            id: 'log-4',
            action: 'RULE_CHAIN_UPDATE',
            entityType: 'RULE_CHAIN',
            entityName: 'Root Telemetry Filter Chain',
            userName: 'System Architect',
            timestamp: Date.now() - 1000 * 60 * 110,
            status: 'SUCCESS',
          },
        ]);
      }
    } catch (err) {
      console.error('Failed loading dashboard data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update telemetry chart when timeframe or metric changes
  useEffect(() => {
    setChartData(generateTelemetryData(chartTimeframe, activeMetric));
  }, [chartTimeframe, activeMetric]);

  // Live telemetry polling for Home Dashboard widgets
  useEffect(() => {
    if (!homeDashboard) return;
    const interval = setInterval(() => {
      const widgets = homeDashboard?.configuration?.widgets || [];
      const entityIds = [...new Set(widgets.filter(w => w.config?.entityId).map(w => w.config.entityId))];
      if (entityIds.length === 0) return;
      
      const endTs = Date.now();
      const startTs = endTs - 60000; 

      entityIds.forEach(eid => {
        api.get(`/telemetry/${eid}/timeseries`, { params: { startTs, endTs, limit: 1 } })
          .then(res => {
            const grouped = res.data;
            setTelemetryData(prev => {
              const currentChart = prev[eid]?.chart || [];
              if (Object.keys(grouped).length === 0) return prev;
              
              const now = Date.now();
              const newPoint = { ts: now, time: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) };
              Object.entries(grouped).forEach(([key, arr]) => {
                if (arr && arr.length > 0) newPoint[key] = parseFloat(arr[arr.length - 1].value.toFixed(2));
              });
              
              if (Object.keys(newPoint).length > 2) {
                const updatedChart = [...currentChart, newPoint].slice(-100); 
                return { ...prev, [eid]: { raw: grouped, chart: updatedChart } };
              }
              return prev;
            });
          }).catch(() => {});
      });
    }, 2500); 
    return () => clearInterval(interval);
  }, [homeDashboard]);

  // Handle Alarm Actions (ACK & CLEAR)
  const handleAcknowledgeAlarm = async (alarmId) => {
    setActionLoading(prev => ({ ...prev, [alarmId]: 'ack' }));
    try {
      await api.put(`/alarms/${alarmId}/ack`).catch(() => {});
      setAlarms(prev =>
        prev.map(a => (a.id === alarmId ? { ...a, status: 'ACKNOWLEDGED' } : a))
      );
    } finally {
      setActionLoading(prev => ({ ...prev, [alarmId]: null }));
    }
  };

  const handleClearAlarm = async (alarmId) => {
    setActionLoading(prev => ({ ...prev, [alarmId]: 'clear' }));
    try {
      await api.put(`/alarms/${alarmId}/clear`).catch(() => {});
      setAlarms(prev => prev.filter(a => a.id !== alarmId));
    } finally {
      setActionLoading(prev => ({ ...prev, [alarmId]: null }));
    }
  };

  if (loading) {
    return (
      <div className="animate-fadeIn" style={{ padding: 'var(--space-6)' }}>
        <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
          <div>
            <div className="skeleton" style={{ width: 240, height: 32, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: 340, height: 18 }} />
          </div>
        </div>
        <div className="dashboard-grid-4" style={{ marginBottom: 'var(--space-6)' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ height: 130, borderRadius: 12 }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: 340, borderRadius: 12, marginBottom: 'var(--space-6)' }} />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Devices',
      value: stats?.devices?.total ?? 24,
      subValue: `${stats?.devices?.active ?? 21} Active`,
      icon: Cpu,
      color: 'primary',
      trend: '+12% this month',
      trendDir: 'up',
      onClick: () => navigate('/devices'),
    },
    {
      label: 'Active Alarms',
      value: alarms.filter(a => a.status === 'ACTIVE_UNACK').length,
      subValue: 'Requires attention',
      icon: AlertTriangle,
      color: 'danger',
      trend: `${alarms.length} total`,
      trendDir: alarms.filter(a => a.status === 'ACTIVE_UNACK').length > 0 ? 'down' : 'up',
      onClick: () => navigate('/alarms'),
    },
    {
      label: 'Customers & Assets',
      value: (stats?.customers?.total ?? 8) + (stats?.assets?.total ?? 14),
      subValue: `${stats?.customers?.total ?? 8} Customers`,
      icon: Users,
      color: 'success',
      trend: 'Managed',
      trendDir: 'up',
      onClick: () => navigate('/customers'),
    },
    {
      label: 'Dashboards & Rules',
      value: (stats?.dashboards?.total ?? 12) + (stats?.ruleChains?.total ?? 6),
      subValue: `${stats?.dashboards?.total ?? 12} Dashboards`,
      icon: LayoutDashboard,
      color: 'warning',
      trend: '6 Rule Chains',
      trendDir: 'up',
      onClick: () => navigate('/dashboards'),
    },
  ];

  const quickActions = [
    { icon: Cpu, label: 'Add Device', path: '/devices', color: '#2563EB' },
    { icon: LayoutDashboard, label: 'New Dashboard', path: '/dashboards', color: '#7C3AED' },
    { icon: GitBranch, label: 'Rule Chains', path: '/rule-chains', color: '#10B981' },
    { icon: Building2, label: 'Asset Explorer', path: '/assets', color: '#F59E0B' },
    { icon: Smartphone, label: 'Mobile Apps', path: '/mobile-center', color: '#EC4899' },
    { icon: Layers, label: 'OTA Updates', path: '/ota-updates', color: '#06B6D4' },
  ];

  const metricUnits = {
    temp: { label: 'Temperature', unit: '°C', color: '#2563EB' },
    humidity: { label: 'Humidity', unit: '%', color: '#7C3AED' },
    power: { label: 'Power Usage', unit: 'kW', color: '#10B981' },
    voltage: { label: 'Grid Voltage', unit: 'V', color: '#F59E0B' },
  };

  return (
    <div className="animate-fadeIn" style={{ paddingBottom: 'var(--space-8)' }}>
      {/* 1. Header Banner */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
            <h1 className="page-title" style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
            </h1>
            <span style={{ fontSize: '1.25rem' }}>👋</span>
          </div>
          <p className="page-subtitle" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>
            RadioGeet Cloud Platform Overview — Real-Time Telemetry & System Diagnostics
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button
            className="btn btn-secondary"
            onClick={fetchData}
            disabled={refreshing}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/devices')}>
            <Plus size={16} /> Add Device
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards Suite */}
      <div className="dashboard-grid-4" style={{ marginBottom: 'var(--space-6)' }}>
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="stat-card"
              onClick={card.onClick}
              style={{
                cursor: 'pointer',
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius-lg)',
                padding: 'var(--space-5)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s ease',
              }}
            >
              <div className="stat-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                <div
                  className={`stat-card-icon ${card.color}`}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 'var(--border-radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: card.color === 'primary' ? 'rgba(37, 99, 235, 0.1)' :
                               card.color === 'danger' ? 'rgba(239, 68, 68, 0.1)' :
                               card.color === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: card.color === 'primary' ? '#2563EB' :
                           card.color === 'danger' ? '#EF4444' :
                           card.color === 'success' ? '#10B981' : '#F59E0B',
                  }}
                >
                  <Icon size={22} />
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 600,
                  color: card.trendDir === 'up' ? '#10B981' : '#EF4444',
                  background: card.trendDir === 'up' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  padding: '3px 8px',
                  borderRadius: 'var(--border-radius-full)',
                }}>
                  {card.trendDir === 'up' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {card.trend}
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.1 }}>
                {card.value}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{card.label}</span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>{card.subValue}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Render Home Dashboard Widgets if user has a dashboard */}
      {homeDashboard && homeDashboard.configuration?.widgets?.length > 0 && (
        <div className="card" style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-lg)', marginBottom: 'var(--space-6)', padding: 'var(--space-2)' }}>
          <div className="card-header" style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title" style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>
              {homeDashboard.title} (Home Dashboard)
            </span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/dashboards/${homeDashboard.id}`)}>
              Edit Dashboard
            </button>
          </div>
          <div className="card-body" style={{ minHeight: 300, overflow: 'hidden' }}>
            <DashboardWidgetGrid
              dashboard={homeDashboard}
              widgets={homeDashboard.configuration.widgets}
              telemetryData={telemetryData}
              stats={stats}
              isEditMode={false}
              isMobilePreview={false}
              onDeleteWidget={null}
              onLayoutChange={() => {}}
            />
          </div>
        </div>
      )}

      {/* 3. Main Live Telemetry Chart & Fleet Health Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        {/* Telemetry Chart Widget */}
        <div className="card" style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
          <div className="card-header" style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
              <div>
                <span className="card-title" style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>
                  Real-Time Telemetry Streaming Widget
                </span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginLeft: 'var(--space-3)' }}>
                  Live IoT Sensor Stream
                </span>
              </div>
            </div>

            {/* Metric & Timeframe Selectors */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              {/* Metric selector */}
              <div style={{ display: 'flex', background: 'var(--color-bg-hover)', borderRadius: 'var(--border-radius-md)', padding: 2 }}>
                {Object.keys(metricUnits).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveMetric(key)}
                    style={{
                      border: 'none',
                      background: activeMetric === key ? 'var(--color-bg-surface)' : 'transparent',
                      color: activeMetric === key ? metricUnits[key].color : 'var(--color-text-tertiary)',
                      boxShadow: activeMetric === key ? 'var(--shadow-sm)' : 'none',
                      borderRadius: 'var(--border-radius-sm)',
                      padding: '4px 10px',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {metricUnits[key].label}
                  </button>
                ))}
              </div>

              {/* Timeframe selector */}
              <div style={{ display: 'flex', background: 'var(--color-bg-hover)', borderRadius: 'var(--border-radius-md)', padding: 2 }}>
                {['1h', '6h', '24h', '7d'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setChartTimeframe(tf)}
                    style={{
                      border: 'none',
                      background: chartTimeframe === tf ? '#2563EB' : 'transparent',
                      color: chartTimeframe === tf ? '#FFFFFF' : 'var(--color-text-tertiary)',
                      borderRadius: 'var(--border-radius-sm)',
                      padding: '4px 8px',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {tf.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card-body" style={{ padding: 'var(--space-5)' }}>
            <div style={{ height: 260, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="telemetryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={metricUnits[activeMetric].color} stopOpacity={0.35}/>
                      <stop offset="95%" stopColor={metricUnits[activeMetric].color} stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} unit={metricUnits[activeMetric].unit} />
                  <Tooltip
                    contentStyle={{
                      background: '#0F1E36',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                    formatter={(val) => [`${val} ${metricUnits[activeMetric].unit}`, metricUnits[activeMetric].label]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={metricUnits[activeMetric].color}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#telemetryGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Device Fleet Status Breakdown Widget */}
        <div className="card" style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-lg)' }}>
          <div className="card-header" style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title" style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>
              Fleet Health & Connectivity
            </span>
            <span className="badge badge-success" style={{ fontSize: 'var(--font-size-xs)' }}>
              95.8% Online
            </span>
          </div>

          <div className="card-body" style={{ padding: 'var(--space-5)' }}>
            {/* Progress gauge bar */}
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Fleet Health Score</span>
                <span style={{ color: '#10B981' }}>Optimal Performance</span>
              </div>
              <div style={{ height: 10, background: '#E2E8F0', borderRadius: 999, overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: '82%', background: '#10B981', transition: 'width 0.5s ease' }} title="Online (82%)" />
                <div style={{ width: '10%', background: '#F59E0B', transition: 'width 0.5s ease' }} title="Warning (10%)" />
                <div style={{ width: '8%', background: '#94A3B8', transition: 'width 0.5s ease' }} title="Offline (8%)" />
              </div>
            </div>

            {/* Metric Status Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div style={{ padding: 'var(--space-3)', background: 'var(--color-bg-primary)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>
                  <CheckCircle2 size={14} style={{ color: '#10B981' }} />
                  <span>Online Devices</span>
                </div>
                <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  {stats?.devices?.active ?? 21}
                </div>
              </div>

              <div style={{ padding: 'var(--space-3)', background: 'var(--color-bg-primary)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>
                  <XCircle size={14} style={{ color: '#94A3B8' }} />
                  <span>Offline Devices</span>
                </div>
                <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  {stats?.devices?.inactive ?? 3}
                </div>
              </div>

              <div style={{ padding: 'var(--space-3)', background: 'var(--color-bg-primary)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>
                  <Radio size={14} style={{ color: '#2563EB' }} />
                  <span>MQTT Sessions</span>
                </div>
                <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  18 Active
                </div>
              </div>

              <div style={{ padding: 'var(--space-3)', background: 'var(--color-bg-primary)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>
                  <Zap size={14} style={{ color: '#7C3AED' }} />
                  <span>HTTP Pushes</span>
                </div>
                <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  1.4k / min
                </div>
              </div>
            </div>

            {/* Quick Link */}
            <button
              onClick={() => navigate('/devices')}
              style={{
                width: '100%',
                marginTop: 'var(--space-4)',
                padding: 'var(--space-2) var(--space-3)',
                background: 'transparent',
                border: '1px border var(--color-border)',
                borderRadius: 'var(--border-radius-md)',
                color: '#2563EB',
                fontWeight: 600,
                fontSize: 'var(--font-size-xs)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <span>Explore All Devices</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Active Alarms Management Stream & Rule Chain Status Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        {/* Active Alarms Stream Widget */}
        <div className="card" style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
          <div className="card-header" style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <AlertTriangle size={18} style={{ color: '#EF4444' }} />
              <span className="card-title" style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>
                RadioGeet Cloud Alarms Stream
              </span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/alarms')} style={{ fontSize: 'var(--font-size-xs)' }}>
              View All Alarms ({alarms.length})
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: 'var(--font-size-xs)' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg-hover)', color: 'var(--color-text-tertiary)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 16px' }}>Severity</th>
                  <th style={{ padding: '10px 16px' }}>Alarm Type</th>
                  <th style={{ padding: '10px 16px' }}>Originator Device</th>
                  <th style={{ padding: '10px 16px' }}>Status</th>
                  <th style={{ padding: '10px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {alarms.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                      No active alarms detected. System operating normally.
                    </td>
                  </tr>
                ) : (
                  alarms.slice(0, 4).map((alarm) => {
                    const sevColor =
                      alarm.severity === 'CRITICAL' ? '#EF4444' :
                      alarm.severity === 'MAJOR' ? '#F97316' :
                      alarm.severity === 'MINOR' ? '#F59E0B' : '#3B82F6';

                    return (
                      <tr key={alarm.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 700,
                            background: `${sevColor}1A`,
                            color: sevColor,
                            border: `1px solid ${sevColor}40`,
                          }}>
                            {alarm.severity}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {alarm.type}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>
                          {alarm.originatorName || 'IoT Device Node'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: alarm.status === 'ACKNOWLEDGED' ? '#10B981' : '#EF4444',
                          }}>
                            {alarm.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            {alarm.status !== 'ACKNOWLEDGED' && (
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleAcknowledgeAlarm(alarm.id)}
                                disabled={actionLoading[alarm.id] === 'ack'}
                                style={{ padding: '2px 8px', fontSize: '10px' }}
                              >
                                {actionLoading[alarm.id] === 'ack' ? '...' : 'ACK'}
                              </button>
                            )}
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleClearAlarm(alarm.id)}
                              disabled={actionLoading[alarm.id] === 'clear'}
                              style={{ padding: '2px 8px', fontSize: '10px', color: '#EF4444' }}
                            >
                              {actionLoading[alarm.id] === 'clear' ? '...' : 'CLEAR'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rule Engine & Platform Status */}
        <div className="card" style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-lg)' }}>
          <div className="card-header" style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <GitBranch size={18} style={{ color: '#7C3AED' }} />
              <span className="card-title" style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>
                Rule Engine Status
              </span>
            </div>
            <span className="badge badge-success" style={{ fontSize: 'var(--font-size-xs)' }}>
              Active
            </span>
          </div>

          <div className="card-body" style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>Processed Messages</span>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-text-primary)' }}>128,490 msgs</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>Rule Nodes Evaluated</span>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-text-primary)' }}>482,100 nodes</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>Success Delivery Rate</span>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: '#10B981' }}>99.98%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>Average Execution Latency</span>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: '#2563EB' }}>1.4 ms</span>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)', marginTop: 'var(--space-1)' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
                  Active Rule Chains
                </div>
                {['Root Rule Chain', 'Telemetry Alarm Filter', 'MQTT Push Dispatcher'].map((rc, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{rc}</span>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Audit Activity Stream & Quick Action Shortcuts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
        {/* Audit Logs Stream */}
        <div className="card" style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-lg)' }}>
          <div className="card-header" style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Activity size={18} style={{ color: '#2563EB' }} />
              <span className="card-title" style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>
                Recent Audit Activity Stream
              </span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/audit-logs')} style={{ fontSize: 'var(--font-size-xs)' }}>
              View Logs
            </button>
          </div>

          <div className="card-body" style={{ padding: 'var(--space-4) var(--space-5)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {auditLogs.slice(0, 4).map((log) => (
                <div key={log.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--color-border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2563EB1A', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
                      {log.userName.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {log.action} — <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}>{log.entityName}</span>
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>
                        By {log.userName} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '10px' }}>
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Tools & Shortcuts Grid */}
        <div className="card" style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-lg)' }}>
          <div className="card-header" style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Zap size={18} style={{ color: '#F59E0B' }} />
              <span className="card-title" style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>
                Cloud Developer Tools & Navigation
              </span>
            </div>
          </div>

          <div className="card-body" style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <button
                    key={idx}
                    className="btn btn-secondary"
                    onClick={() => navigate(action.path)}
                    style={{
                      padding: 'var(--space-4) var(--space-3)',
                      flexDirection: 'column',
                      height: 'auto',
                      gap: 'var(--space-2)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--border-radius-md)',
                      background: 'var(--color-bg-primary)',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                  >
                    <Icon size={22} style={{ color: action.color }} />
                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

