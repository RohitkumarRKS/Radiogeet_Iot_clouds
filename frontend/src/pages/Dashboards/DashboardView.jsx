import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
  ArrowLeft, Plus, Clock, Filter, Smartphone, Maximize2, Download, Edit3, Trash2,
  BarChart2, Gauge as GaugeIcon, CheckCircle2, Sliders, Play, Settings, MapPin, Table as TableIcon, Zap, Code,
  Layers, LayoutTemplate, X, Check, Sparkles, Cpu, AlertTriangle, Users, LayoutDashboard, Activity, Save, ChevronDown
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter } from 'recharts';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useAuthModal } from '../../components/Common/AuthModal';
import { useWebSocket } from '../../context/WebSocketContext';
import WidgetLibraryModal from '../../components/Widgets/WidgetLibraryModal';
import DashboardWidgetGrid from '../../components/Widgets/DashboardWidgetGrid';

export default function DashboardView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { requireAuth } = useAuthModal();
  const { subscribe } = useWebSocket();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [devices, setDevices] = useState([]);
  const [telemetryData, setTelemetryData] = useState({});

  // Toolbar state
  const [isEditMode, setIsEditMode] = useState(false);
  const [timeWindow, setTimeWindow] = useState('1h');
  const [selectedEntityFilter, setSelectedEntityFilter] = useState('ALL');
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Modals state
  const [showWidgetLibraryModal, setShowWidgetLibraryModal] = useState(false);
  const [showTimeWindowModal, setShowTimeWindowModal] = useState(false);

  const TIME_WINDOW_OPTIONS = [
    { id: '1m', label: 'Realtime - last 1 minute', type: 'realtime' },
    { id: '5m', label: 'Realtime - last 5 minutes', type: 'realtime' },
    { id: '15m', label: 'Realtime - last 15 minutes', type: 'realtime' },
    { id: '30m', label: 'Realtime - last 30 minutes', type: 'realtime' },
    { id: '1h', label: 'Realtime - last 1 hour', type: 'realtime' },
    { id: '6h', label: 'Realtime - last 6 hours', type: 'realtime' },
    { id: '12h', label: 'Realtime - last 12 hours', type: 'realtime' },
    { id: '24h', label: 'Realtime - last 1 day', type: 'realtime' },
    { id: '7d', label: 'History - last 7 days', type: 'history' },
    { id: '30d', label: 'History - last 30 days', type: 'history' },
  ];

  const loadDashboard = () => {
    Promise.all([
      api.get(`/dashboards/${id}`),
      api.get('/stats'),
      api.get('/devices'),
    ]).then(([dashRes, statsRes, devRes]) => {
      setDashboard(dashRes.data);
      setStats(statsRes.data);
      const devList = devRes.data.data || [];
      setDevices(devList);

      const widgets = dashRes.data.configuration?.widgets || [];
      const entityIds = [...new Set(widgets.filter(w => w.config?.entityId).map(w => w.config.entityId))];
      const endTs = Date.now();
      const windowMs =
        timeWindow === '1m' ? 60000 :
        timeWindow === '5m' ? 300000 :
        timeWindow === '15m' ? 900000 :
        timeWindow === '30m' ? 1800000 :
        timeWindow === '1h' ? 3600000 :
        timeWindow === '6h' ? 21600000 :
        timeWindow === '12h' ? 43200000 :
        timeWindow === '24h' ? 86400000 :
        timeWindow === '7d' ? 604800000 : 2592000000;

      const startTs = endTs - windowMs;

      entityIds.forEach(eid => {
        api.get(`/telemetry/${eid}/timeseries`, { params: { startTs, endTs, limit: 100 } })
          .then(res => {
            const grouped = res.data;
            const allTs = new Set();
            Object.values(grouped).forEach(arr => arr.forEach(p => allTs.add(p.ts)));
            const sorted = [...allTs].sort();
            const maxTs = sorted.length > 0 ? sorted[sorted.length - 1] : 0;
            const isFresh = maxTs > 0 && (Date.now() - maxTs < 5000);

            const chartData = sorted.map(ts => {
              const point = { ts, time: new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) };
              Object.entries(grouped).forEach(([key, arr]) => {
                const found = arr.find(p => p.ts === ts);
                if (found) point[key] = parseFloat(found.value.toFixed(2));
              });
              return point;
            });

            // If latest DB reading is older than 5s (device inactive/off), set live raw values to 0
            const liveRaw = {};
            Object.entries(grouped).forEach(([key, arr]) => {
              if (isFresh && arr && arr.length > 0) {
                liveRaw[key] = arr;
              } else {
                liveRaw[key] = [{ value: 0, ts: Date.now() }];
              }
            });

            setTelemetryData(prev => ({
              ...prev,
              [eid]: {
                raw: liveRaw,
                chart: chartData,
                lastUpdated: isFresh ? maxTs : null
              }
            }));
          }).catch(() => {});
      });
    }).catch(() => navigate('/dashboards'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadDashboard(); }, [id, timeWindow]);

  // Live WebSocket telemetry subscription + Polling backup
  useEffect(() => {
    if (!subscribe) return;

    const widgets = dashboard?.configuration?.widgets || [];
    const entityIds = [...new Set(widgets.filter(w => w.config?.entityId).map(w => w.config.entityId))];

    const handleTelemetryUpdate = (event) => {
      if (event.type !== 'TELEMETRY_UPDATE' || !event.entityId || !Array.isArray(event.data) || event.data.length === 0) return;

      const eid = event.entityId;
      const ts = event.data[0]?.ts ? new Date(event.data[0].ts).getTime() : Date.now();
      const timeStr = new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setTelemetryData((prev) => {
        const existing = prev[eid] || { raw: {}, chart: [] };
        const updatedRaw = { ...existing.raw };

        // 1. Update raw key-value arrays for Value Cards, Gauges, Status Indicators, etc.
        event.data.forEach((item) => {
          const itemTs = item.ts ? new Date(item.ts).getTime() : ts;
          const val = typeof item.value === 'number' ? item.value : (isNaN(parseFloat(item.value)) ? item.value : parseFloat(item.value));
          const currentArr = updatedRaw[item.key] || [];
          updatedRaw[item.key] = [...currentArr, { value: val, ts: itemTs }];
        });

        // 2. Update time-series chart points for Line, Bar, Area charts
        const newPoint = { ts, time: timeStr };
        event.data.forEach((item) => {
          const val = typeof item.value === 'number' ? item.value : parseFloat(item.value);
          if (!isNaN(val)) {
            newPoint[item.key] = parseFloat(val.toFixed(2));
          } else {
            newPoint[item.key] = item.value;
          }
        });

        const currentChart = existing.chart || [];
        let updatedChart;
        if (currentChart.length > 0 && currentChart[currentChart.length - 1].ts === ts) {
          // Merge with current point if timestamp matches
          updatedChart = [...currentChart.slice(0, -1), { ...currentChart[currentChart.length - 1], ...newPoint }];
        } else {
          // Append new point and limit to 100 historical points
          updatedChart = [...currentChart, newPoint].slice(-100);
        }

        return {
          ...prev,
          [eid]: {
            raw: updatedRaw,
            chart: updatedChart,
            lastUpdated: Date.now()
          }
        };
      });
    };

    // Subscriptions for specific entity IDs & global broadcast fallback
    const unsubscribes = entityIds.map(eid => subscribe(eid, handleTelemetryUpdate));
    const unsubGlobal = subscribe('__global__', handleTelemetryUpdate);

    // Instant Inactivity Watchdog: TURANT reset active values to 0 when telemetry stream stops (> 3s silence)
    const watchdogInterval = setInterval(() => {
      const now = Date.now();
      setTelemetryData((prev) => {
        let hasChanges = false;
        const nextState = { ...prev };

        Object.keys(nextState).forEach((eid) => {
          const entityData = nextState[eid];
          if (!entityData || !entityData.lastUpdated) return;

          // TURANT reset to 0 if no telemetry packet received for over 3 seconds (ESP32 disconnected / silent)
          if (now - entityData.lastUpdated > 3000) {
            const resetRaw = {};
            if (entityData.raw) {
              Object.keys(entityData.raw).forEach((k) => {
                resetRaw[k] = [{ value: 0, ts: now }];
              });
            }
            nextState[eid] = {
              ...entityData,
              raw: resetRaw,
              lastUpdated: null,
            };
            hasChanges = true;
          }
        });

        return hasChanges ? nextState : prev;
      });
    }, 500);

    return () => {
      unsubscribes.forEach(unsub => unsub && unsub());
      if (unsubGlobal) unsubGlobal();
      clearInterval(watchdogInterval);
    };
  }, [dashboard, subscribe, timeWindow]);

  const handleAddWidgetFromLibrary = async (widgetData) => {
    requireAuth(async () => {
      const currentWidgets = dashboard.configuration?.widgets || [];
      
      let newW = 4;
      let newH = 4;
      if (widgetData.type === 'line-chart' || widgetData.type === 'bar-chart' || widgetData.type === 'table' || widgetData.type === 'map') {
        newW = 6;
        newH = 4;
      } else if (widgetData.type === 'value-card' || widgetData.type === 'gauge') {
        newW = 3;
        newH = 3;
      }

      let currentX = 0;
      let currentY = 0;
      let rowMaxH = 0;
      const cols = 12;

      currentWidgets.forEach(w => {
        const l = w.layout || {};
        const wx = l.x ?? 0;
        const wy = l.y ?? 0;
        const ww = l.w ?? 4;
        const wh = l.h ?? 4;
        
        if (wy > currentY) {
          currentY = wy;
          currentX = wx + ww;
          rowMaxH = wh;
        } else if (wy === currentY) {
          currentX = Math.max(currentX, wx + ww);
          rowMaxH = Math.max(rowMaxH, wh);
        }
      });

      if (currentX + newW > cols) {
        currentX = 0;
        currentY += rowMaxH || 4;
      }

      const newWidget = {
        id: `w-${Date.now()}`,
        type: widgetData.type,
        title: widgetData.title || `${widgetData.type.toUpperCase()} Widget`,
        config: widgetData.config,
        layout: { x: currentX, y: currentY, w: newW, h: newH },
      };

      const updatedConfig = { ...dashboard.configuration, widgets: [...currentWidgets, newWidget] };
      await api.put(`/dashboards/${id}`, { configuration: updatedConfig });
      setShowWidgetLibraryModal(false);
      loadDashboard();
    }, 'add a Widget to Dashboard');
  };

  const handleDeleteWidget = (widgetId) => {
    requireAuth(async () => {
      if (confirm('Delete widget from dashboard?')) {
        const currentWidgets = dashboard.configuration?.widgets || [];
        const updatedConfig = { ...dashboard.configuration, widgets: currentWidgets.filter(w => String(w.id) !== String(widgetId)) };
        await api.put(`/dashboards/${id}`, { configuration: updatedConfig });
        loadDashboard();
      }
    }, 'delete widget');
  };

  const handleLayoutChange = (layout) => {
    if (!dashboard || !isEditMode) return;
    const currentWidgets = dashboard.configuration?.widgets || [];
    if (currentWidgets.length === 0) return;

    // Update local state during drag/resize without triggering intermediate API writes
    const updatedWidgets = currentWidgets.map(w => {
      const match = layout.find(l => String(l.i) === String(w.id));
      if (match) {
        let minW = 3;
        if (w.type === 'line-chart' || w.type === 'bar-chart' || w.type === 'table' || w.type === 'map') {
          minW = 6;
        }
        return { ...w, layout: { x: match.x, y: match.y, w: Math.max(match.w, minW), h: match.h } };
      }
      return w;
    });

    setDashboard(prev => ({ ...prev, configuration: { ...prev.configuration, widgets: updatedWidgets } }));
  };

  const handleSaveDashboard = async () => {
    if (!dashboard) return;
    await api.put(`/dashboards/${id}`, { configuration: dashboard.configuration }).catch(() => {});
    setIsEditMode(false);
    loadDashboard();
  };

  const handleExportDashboardJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dashboard, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `dashboard_${dashboard.title.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  if (loading || !dashboard) {
    return <div className="animate-fadeIn"><div className="skeleton" style={{ height: 500, borderRadius: 12 }} /></div>;
  }

  let widgets = dashboard.configuration?.widgets || [];
  if (selectedEntityFilter !== 'ALL') {
    widgets = widgets.filter(w => !w.config?.entityId || w.config.entityId === selectedEntityFilter);
  }

  return (
    <div className="animate-fadeIn" style={{ maxWidth: isMobilePreview ? 480 : '100%', margin: isMobilePreview ? '0 auto' : undefined, height: '100%', display: 'flex', flexDirection: 'column', background: '#F1F5F9', minHeight: 'calc(100vh - 64px)' }}>
      
      {/* Top Controls Toolbar matching RadioGeet Logo Deep Navy Theme */}
      <div style={{
        background: '#0F1E36',
        color: '#FFF',
        padding: '0 20px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '13px',
        fontWeight: 500,
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
      }}>
        {/* Left Brand Title & Company Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/dashboards')}
            style={{ background: 'transparent', border: 'none', color: '#FFF', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
            title="Back to dashboards"
          >
            <ArrowLeft size={18} />
          </button>
          <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '0.3px', fontFamily: 'Inter, sans-serif', color: '#ffffff' }}>
            {dashboard.title}
          </span>

          {/* Render uploaded company PNG/SVG logo if present */}
          {(dashboard.image || dashboard.configuration?.logoUrl) ? (
            <div style={{ background: '#ffffff', padding: '3px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', height: '30px', marginLeft: '6px' }}>
              <img
                src={dashboard.image || dashboard.configuration?.logoUrl}
                alt="Company Logo"
                style={{ height: '22px', maxWidth: '140px', objectFit: 'contain' }}
              />
            </div>
          ) : (
            dashboard.configuration?.companyName && (
              <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.15)', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                {dashboard.configuration.companyName}
              </span>
            )
          )}
        </div>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

          <div
            onClick={() => setShowTimeWindowModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'rgba(255,255,255,0.95)',
              background: 'rgba(255,255,255,0.12)',
              padding: '4px 10px',
              borderRadius: '4px',
              transition: 'background 0.2s'
            }}
            title="Click to change time window"
          >
            <Clock size={15} />
            <span>{TIME_WINDOW_OPTIONS.find(o => o.id === timeWindow)?.label || 'Realtime - last 1 hour'}</span>
            <ChevronDown size={14} />
          </div>

          <Maximize2
            size={16}
            style={{ cursor: 'pointer', opacity: 0.9 }}
            onClick={toggleFullscreen}
            title="Fullscreen"
          />

          {isEditMode ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.5)', padding: '4px 12px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}
                onClick={() => setShowWidgetLibraryModal(true)}
              >
                <Plus size={14} /> Add widget
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: '1px solid #10B981', background: '#10B981', padding: '4px 12px', borderRadius: '4px', fontWeight: 600 }}
                onClick={handleSaveDashboard}
              >
                <Check size={14} /> Save
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', opacity: 0.85 }}
                onClick={() => setIsEditMode(false)}
              >
                <X size={14} /> Cancel
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsEditMode(true)}
              style={{
                background: 'transparent', border: '1px solid rgba(255,255,255,0.7)',
                color: '#FFF', borderRadius: '4px', padding: '4px 10px',
                display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px',
                cursor: 'pointer', fontWeight: 500
              }}
            >
              <Edit3 size={14} /> Enter Edit Mode
            </button>
          )}
        </div>
      </div>

      {/* Dashboard Title Area (when in Edit Mode) */}
      {isEditMode && (
        <div style={{ padding: '24px 24px 0 24px' }}>
          <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>Title*</div>
          <div style={{ fontSize: '24px', fontWeight: 500, color: '#0F172A' }}>{dashboard.title}</div>
        </div>
      )}
      {/* Dashboard Content */}
      <div style={{ flex: 1, position: 'relative' }}>
        {widgets.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px', gap: '12px' }}>
            {isEditMode ? (
              <button 
                onClick={() => setShowWidgetLibraryModal(true)}
                style={{ 
                  background: '#F8FAFC', border: '1px dashed #0F172A', color: '#0F172A', 
                  padding: '10px 24px', borderRadius: '4px', fontSize: '14px', fontWeight: 500, 
                  display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', minWidth: '220px', justifyContent: 'center'
                }}
              >
                <Plus size={18} /> Add new widget
              </button>
            ) : (
              <div style={{ color: '#94A3B8', fontSize: '14px' }}>
                No widgets found. Click "Enter Edit Mode" to add widgets.
              </div>
            )}
          </div>
        ) : (
          <DashboardWidgetGrid
            dashboard={dashboard}
            widgets={widgets}
            telemetryData={telemetryData}
            stats={stats}
            isEditMode={isEditMode}
            isMobilePreview={isMobilePreview}
            onDeleteWidget={handleDeleteWidget}
            onLayoutChange={handleLayoutChange}
          />
        )}
      </div>

      {/* MODAL: Full ThingsBoard Widget Library Bundles Selector */}
      <WidgetLibraryModal
        isOpen={showWidgetLibraryModal}
        onClose={() => setShowWidgetLibraryModal(false)}
        onSelectWidget={handleAddWidgetFromLibrary}
        devices={devices}
      />

      {/* MODAL: Time Window Selection Modal */}
      {showTimeWindowModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setShowTimeWindowModal(false)}
        >
          <div
            style={{
              background: '#FFF',
              borderRadius: '8px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              background: '#0F1E36',
              color: '#FFF',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 600 }}>
                <Clock size={18} />
                <span>Time window configuration</span>
              </div>
              <button
                onClick={() => setShowTimeWindowModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#FFF', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '12px' }}>
                Select Time Window Interval
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
                {TIME_WINDOW_OPTIONS.map((opt) => {
                  const isSelected = timeWindow === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        setTimeWindow(opt.id);
                        setShowTimeWindowModal(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: '6px',
                        border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                        background: isSelected ? '#EFF6FF' : '#FFF',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Clock size={16} style={{ color: isSelected ? '#2563EB' : '#64748B' }} />
                        <span style={{ fontSize: '14px', fontWeight: isSelected ? 600 : 400, color: isSelected ? '#2563EB' : '#1E293B' }}>
                          {opt.label}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: opt.type === 'realtime' ? '#DCFCE7' : '#DBEAFE',
                        color: opt.type === 'realtime' ? '#166534' : '#1E40AF',
                        fontWeight: 600
                      }}>
                        {opt.type}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid #E2E8F0',
              background: '#F8FAFC',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px'
            }}>
              <button
                onClick={() => setShowTimeWindowModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: '1px solid #CBD5E1',
                  background: '#FFF',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

