import React from 'react';
import { ResponsiveGridLayout } from 'react-grid-layout';
import {
  Trash2, Cpu, AlertTriangle, Users, LayoutDashboard, Activity, MapPin, Zap,
  Download, Maximize2, Search, Filter, LayoutGrid, Clock, ArrowUp, ChevronLeft,
  ChevronRight, ChevronsLeft, ChevronsRight, FileText
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Brush, Legend } from 'recharts';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import MapWidget from './MapWidget';
import api from '../../api/axios';

const RpcButtonWidgetComponent = ({ widget, config, color, WidgetHeader }) => {
  const [loading, setLoading] = React.useState(false);
  const [statusMsg, setStatusMsg] = React.useState(null);

  const handleRpcTrigger = async () => {
    if (!config.entityId) {
      setStatusMsg({ type: 'error', text: 'No target device assigned' });
      setTimeout(() => setStatusMsg(null), 3000);
      return;
    }
    setLoading(true);
    setStatusMsg(null);
    try {
      const payload = {
        method: config.method || 'setValue',
        params: config.params || { state: 'ON' }
      };
      const res = await api.post(`/devices/${config.entityId}/rpc`, payload);
      setStatusMsg({ type: 'success', text: `RPC Sent! Req ID: ${res.data.requestId || 'OK'}` });
    } catch (err) {
      console.error('RPC Error:', err);
      setStatusMsg({ type: 'error', text: err.response?.data?.error || 'RPC Execution Failed' });
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  return (
    <div className="widget" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFF', padding: '16px', height: '100%', textAlign: 'center' }}>
      <WidgetHeader title={widget.title} color={color} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <button
          className="btn tb-btn-hover"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px 20px',
            background: loading ? '#94A3B8' : color,
            color: '#FFF',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '13px',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: `0 4px 12px ${color}40`,
            transition: 'all 0.2s ease'
          }}
          onClick={handleRpcTrigger}
        >
          <Zap size={16} className={loading ? 'animate-spin' : ''} /> {loading ? 'SENDING RPC...' : (config.label || 'TRIGGER RPC COMMAND')}
        </button>

        {statusMsg && (
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            color: statusMsg.type === 'success' ? '#166534' : '#991B1B',
            background: statusMsg.type === 'success' ? '#DCFCE7' : '#FEE2E2',
            padding: '4px 10px',
            borderRadius: 4,
            width: '100%',
            textAlign: 'center'
          }}>
            {statusMsg.text}
          </div>
        )}
      </div>
    </div>
  );
};

const WidthProvider = (ComposedComponent) => {
  return function WidthProviderWrapper(props) {
    const containerRef = React.useRef(null);
    const [width, setWidth] = React.useState(1200);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
      setMounted(true);
      if (!containerRef.current) return;
      const updateWidth = () => {
        if (containerRef.current) {
          const w = containerRef.current.getBoundingClientRect().width || containerRef.current.clientWidth;
          if (w > 0) setWidth(w);
        }
      };
      updateWidth();
      const ro = new ResizeObserver(updateWidth);
      ro.observe(containerRef.current);
      return () => ro.disconnect();
    }, []);

    return (
      <div ref={containerRef} style={{ width: '100%', minHeight: '100%' }}>
        {mounted && <ComposedComponent {...props} width={width} />}
      </div>
    );
  };
};

const ResponsiveReactGridLayout = WidthProvider(ResponsiveGridLayout);

const iconMap = { Cpu, AlertTriangle, Users, LayoutDashboard };
const colorMap = { primary: 'var(--color-primary)', danger: 'var(--color-danger)', success: 'var(--color-success)', warning: 'var(--color-warning)' };

export default function DashboardWidgetGrid({
  dashboard,
  widgets,
  telemetryData,
  stats,
  isEditMode,
  isMobilePreview,
  onDeleteWidget,
  onLayoutChange
}) {

  // Auto-arrange widgets into 12 columns with 2D collision-free matrix placement
  const computedWidgets = React.useMemo(() => {
    if (!widgets || widgets.length === 0) return [];
    
    const cols = 12;
    const grid = []; // 2D matrix of occupied grid cells

    const isFree = (x, y, w, h) => {
      if (x + w > cols) return false;
      for (let r = y; r < y + h; r++) {
        for (let c = x; c < x + w; c++) {
          if (grid[r] && grid[r][c]) return false;
        }
      }
      return true;
    };

    const markOccupied = (x, y, w, h) => {
      for (let r = y; r < y + h; r++) {
        if (!grid[r]) grid[r] = [];
        for (let c = x; c < x + w; c++) {
          grid[r][c] = true;
        }
      }
    };

    return widgets.map((w) => {
      let l = w.layout || {};

      // Enforce minimum width according to widget type to prevent narrow overlap squishing
      let minW = 3;
      if (w.type === 'line-chart' || w.type === 'bar-chart' || w.type === 'table' || w.type === 'map') {
        minW = 6;
      }
      let width = Math.max(l.w || minW, minW);
      let height = l.h || (w.type === 'value-card' ? 3 : 4);

      let x = typeof l.x === 'number' ? l.x : 0;
      let y = typeof l.y === 'number' ? l.y : 0;

      // If requested position collides or exceeds bounds, find next available grid slot
      if (!isFree(x, y, width, height)) {
        let found = false;
        for (let searchY = 0; searchY < 500 && !found; searchY++) {
          for (let searchX = 0; searchX <= cols - width; searchX++) {
            if (isFree(searchX, searchY, width, height)) {
              x = searchX;
              y = searchY;
              found = true;
              break;
            }
          }
        }
      }

      markOccupied(x, y, width, height);

      return {
        ...w,
        layout: { i: String(w.id), x, y, w: width, h: height }
      };
    });
  }, [widgets]);

  const getStatValue = (key) => {
    if (!stats) return 0;
    if (key === 'devices') return stats.devices?.total || 0;
    if (key === 'alarms') return stats.alarms?.active || 0;
    if (key === 'customers') return stats.customers?.total || 0;
    if (key === 'dashboards') return stats.dashboards?.total || 0;
    return 0;
  };

  const getLatestValue = (entityId, key) => {
    const data = telemetryData[entityId]?.raw?.[key];
    if (!data || data.length === 0) return 0;
    return data[data.length - 1].value;
  };

  const WidgetHeader = ({ title, color }) => (
    <div className="widget-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 4px', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {color && <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />}
        <span className="widget-title" style={{ fontSize: '15px', color: '#202124', fontWeight: 600 }}>{title}</span>
      </div>
      <div style={{ display: 'flex', gap: '10px', color: '#5F6368' }}>
        <FileText size={15} style={{ cursor: 'pointer' }} title="Export data" />
        <Maximize2 size={15} style={{ cursor: 'pointer' }} title="Fullscreen" onClick={(e) => {
          const container = e.currentTarget.closest('.widget-container');
          if (container) {
            if (!document.fullscreenElement) {
              container.requestFullscreen().catch(err => console.log(err));
              container.style.padding = '24px';
              container.style.background = '#FFF';
              container.style.overflow = 'auto';
            } else {
              document.exitFullscreen();
              container.style.padding = '0';
              container.style.overflow = 'hidden';
            }
          }
        }} />
      </div>
    </div>
  );

  const renderWidget = (widget) => {
    const layoutItem = widget.layout;
    const config = widget.config || {};
    const color = config.color || '#00695C';
    const unit = config.unit || '°C';
    const decimals = config.decimals !== undefined && config.decimals !== null ? Number(config.decimals) : 1;
    const yMin = config.yMin !== undefined && config.yMin !== '' ? Number(config.yMin) : (config.yAxisMin !== undefined ? Number(config.yAxisMin) : 'auto');
    const yMax = config.yMax !== undefined && config.yMax !== '' ? Number(config.yMax) : (config.yAxisMax !== undefined ? Number(config.yAxisMax) : 'auto');
    const minVal = Number(config.min ?? 0);
    const maxVal = Number(config.max ?? 100);

    return (
      <div
        key={String(widget.id)}
        className="widget-container tb-widget-card"
        data-grid={{
          i: String(widget.id),
          x: layoutItem.x,
          y: layoutItem.y,
          w: layoutItem.w,
          h: layoutItem.h,
          static: !isEditMode
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          border: isEditMode ? '2px dashed #2563EB' : '1px solid #E2E8F0',
          borderRadius: '10px',
          background: config.bgColor || '#FFF',
          boxShadow: isEditMode ? '0 4px 12px rgba(37, 99, 235, 0.15)' : '0 2px 8px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <style>{`
          .tb-widget-card {
            transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s ease !important;
          }
          .tb-widget-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 24px -4px rgba(37, 99, 235, 0.18), 0 4px 6px -2px rgba(0, 0, 0, 0.04) !important;
            border-color: #2563EB !important;
          }

          /* FULLSCREEN RESPONSIVE STYLING */
          .widget-container:fullscreen,
          .widget-container:-webkit-full-screen,
          .widget-container:-moz-full-screen {
            width: 100vw !important;
            height: 100vh !important;
            padding: 32px 48px !important;
            background: #FAFAFA !important;
            display: flex !important;
            flex-direction: column !important;
            box-sizing: border-box !important;
            border: none !important;
            border-radius: 0 !important;
            overflow: auto !important;
          }

          .widget-container:fullscreen .widget,
          .widget-container:-webkit-full-screen .widget {
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
          }

          .widget-container:fullscreen .widget-header,
          .widget-container:-webkit-full-screen .widget-header {
            margin-bottom: 24px !important;
            padding-bottom: 16px !important;
            border-bottom: 1px solid #E2E8F0 !important;
          }
          .widget-container:fullscreen .widget-title,
          .widget-container:-webkit-full-screen .widget-title {
            font-size: 24px !important;
            font-weight: 700 !important;
          }

          /* Fullscreen Value Cards */
          .widget-container:fullscreen .tb-value-card-body,
          .widget-container:-webkit-full-screen .tb-value-card-body {
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 24px !important;
            padding: 40px !important;
          }
          .widget-container:fullscreen .tb-value-card-icon,
          .widget-container:-webkit-full-screen .tb-value-card-icon {
            width: 110px !important;
            height: 110px !important;
            border-radius: 28px !important;
          }
          .widget-container:fullscreen .tb-value-card-icon svg,
          .widget-container:-webkit-full-screen .tb-value-card-icon svg {
            width: 56px !important;
            height: 56px !important;
          }
          .widget-container:fullscreen .tb-value-card-num,
          .widget-container:-webkit-full-screen .tb-value-card-num {
            font-size: 5.5rem !important;
            line-height: 1 !important;
          }
          .widget-container:fullscreen .tb-value-card-unit,
          .widget-container:-webkit-full-screen .tb-value-card-unit {
            font-size: 2.25rem !important;
          }
          .widget-container:fullscreen .tb-value-card-sub,
          .widget-container:-webkit-full-screen .tb-value-card-sub {
            font-size: 16px !important;
            margin-top: 8px !important;
          }

          /* Fullscreen Charts */
          .widget-container:fullscreen .tb-chart-body,
          .widget-container:-webkit-full-screen .tb-chart-body {
            flex: 1 !important;
            min-height: calc(100vh - 200px) !important;
            height: calc(100vh - 200px) !important;
            width: 100% !important;
          }

          /* Fullscreen Gauges */
          .widget-container:fullscreen .tb-gauge-body,
          .widget-container:-webkit-full-screen .tb-gauge-body {
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .widget-container:fullscreen .tb-gauge-svg-wrapper,
          .widget-container:-webkit-full-screen .tb-gauge-svg-wrapper {
            width: 320px !important;
            height: 320px !important;
          }
          .widget-container:fullscreen .tb-gauge-svg-wrapper svg,
          .widget-container:-webkit-full-screen .tb-gauge-svg-wrapper svg {
            width: 320px !important;
            height: 320px !important;
          }
          .widget-container:fullscreen .tb-gauge-value,
          .widget-container:-webkit-full-screen .tb-gauge-value {
            font-size: 4rem !important;
          }
          .widget-container:fullscreen .tb-gauge-unit,
          .widget-container:-webkit-full-screen .tb-gauge-unit {
            font-size: 1.5rem !important;
          }

          /* Fullscreen Table & Map */
          .widget-container:fullscreen .tb-table-body,
          .widget-container:-webkit-full-screen .tb-table-body,
          .widget-container:fullscreen .tb-map-body,
          .widget-container:-webkit-full-screen .tb-map-body {
            flex: 1 !important;
            height: calc(100vh - 180px) !important;
            min-height: calc(100vh - 180px) !important;
          }
        `}</style>
        {isEditMode && onDeleteWidget && (
          <button
            className="btn btn-danger btn-icon btn-sm"
            onClick={(e) => { e.stopPropagation(); onDeleteWidget(widget.id); }}
            title="Delete Widget"
            style={{
              position: 'absolute',
              top: 6,
              left: 6,
              zIndex: 20,
              padding: 4,
              width: 26,
              height: 26,
              borderRadius: '6px',
              background: '#EF4444',
              color: '#FFF',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            <Trash2 size={13} />
          </button>
        )}
        {(() => {
          switch (widget.type) {
            case 'value-card': {
              const Icon = iconMap[config.icon] || Activity;
              const cardColor = colorMap[config.color] || (config.color && config.color !== '#00695C' ? config.color : '#2563EB');
              const latest = getLatestValue(config.entityId, config.key || 'temperature');
              const rawValue = latest !== null && latest !== undefined ? latest : getStatValue(config.key);
              const formattedVal = typeof rawValue === 'number' ? rawValue.toFixed(decimals) : (rawValue || 0);
              const devName = config.deviceName || 'Thermostat A1';

              return (
                <div className="widget" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFF', padding: '16px', height: '100%', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: cardColor }} />
                  <WidgetHeader title={widget.title} color={cardColor} />
                  <div className="widget-body tb-value-card-body" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px', padding: '0 8px' }}>
                    <div className="tb-value-card-icon" style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: `${cardColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 4px 10px ${cardColor}25`
                    }}>
                      <Icon size={26} style={{ color: cardColor }} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '6px' }}>
                        <span className="tb-value-card-num" style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{formattedVal}</span>
                        {unit && <span className="tb-value-card-unit" style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>{unit}</span>}
                      </div>
                      <div className="tb-value-card-sub" style={{ fontSize: '11px', color: '#2563EB', fontWeight: 600, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                        {devName} • {config.key || 'temperature'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            case 'line-chart': {
              const entityId = config.entityId;
              const keys = config.keys || [config.key || 'temperature'];
              const baseKey = keys[0];
              let data = telemetryData[entityId]?.chart;
              if (!data || data.length === 0) {
                const now = new Date();
                data = Array.from({ length: 6 }, (_, i) => {
                  const t = new Date(now.getTime() - (5 - i) * 60000);
                  return { time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), [baseKey]: 0 };
                });
              }
              const chartColor = colorMap[config.color] || (config.color && config.color !== '#00695C' ? config.color : '#2563EB');

              return (
                <div className="widget" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFF', padding: '16px', height: '100%' }}>
                  <WidgetHeader title={widget.title} color={chartColor} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#202124' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: chartColor, display: 'inline-block' }} />
                      <span>{baseKey.charAt(0).toUpperCase() + baseKey.slice(1)}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#9E9E9E', background: '#F1F5F9', padding: '2px 8px', borderRadius: 4 }}>
                      Unit: {unit} | Min: {yMin} | Max: {yMax}
                    </span>
                  </div>

                  <div className="widget-body tb-chart-body" style={{ flex: 1, minHeight: 140 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`gradient-${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartColor} stopOpacity={0.25} />
                            <stop offset="95%" stopColor={chartColor} stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="2 2" vertical={true} horizontal={true} stroke="#F1F5F9" />
                        <XAxis dataKey="time" stroke="#64748B" fontSize={10} tickLine={true} axisLine={{ stroke: '#CBD5E1' }} />
                        <YAxis stroke="#64748B" fontSize={10} domain={[yMin, yMax]} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}${unit}`} />
                        <Tooltip
                          formatter={(val) => [`${typeof val === 'number' ? val.toFixed(decimals) : val} ${unit}`, baseKey]}
                          contentStyle={{ background: '#FFF', border: `1px solid ${chartColor}`, borderRadius: 6, color: '#334155', fontSize: 11, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        {keys.map(k => (
                          <Area key={k} type="monotone" dataKey={k} name={k.charAt(0).toUpperCase() + k.slice(1)} stroke={chartColor} fill={`url(#gradient-${widget.id})`} strokeWidth={2.5} />
                        ))}
                        <Brush dataKey="time" height={20} stroke={chartColor} fill="#EFF6FF" travellerWidth={8} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            }

            case 'bar-chart': {
              const barColor = colorMap[config.color] || config.color || '#7C3AED';
              const entityId = config.entityId;
              const baseKey = config.key || 'temperature';
              let data = telemetryData[entityId]?.chart;
              if (!data || data.length === 0) {
                const now = new Date();
                data = Array.from({ length: 5 }, (_, i) => {
                  const t = new Date(now.getTime() - (4 - i) * 60000);
                  return { name: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), value: 0 };
                });
              } else {
                data = data.map(pt => ({
                  name: pt.time,
                  value: pt[baseKey] !== undefined ? pt[baseKey] : 0
                }));
              }

              return (
                <div className="widget" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFF', padding: '16px', height: '100%' }}>
                  <WidgetHeader title={widget.title} color={barColor} />
                  <div className="widget-body tb-chart-body" style={{ flex: 1, minHeight: 150 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={10} domain={[yMin, yMax]} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}${unit}`} />
                        <Tooltip
                          formatter={(val) => [`${typeof val === 'number' ? val.toFixed(decimals) : val} ${unit}`, baseKey]}
                          contentStyle={{ background: '#FFF', border: `1px solid ${barColor}`, borderRadius: 6, color: '#334155', fontSize: 11, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="value" fill={barColor} radius={[4, 4, 0, 0]} />
                        <Brush dataKey="name" height={20} stroke={barColor} fill="#F1F5F9" travellerWidth={6} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            }

            case 'pie-chart': {
              const pieData = [
                { name: 'Normal', value: 132, color: config.color || '#10B981' },
                { name: 'Critical', value: 51, color: '#EF4444' },
              ];
              return (
                <div className="widget" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFF', padding: '16px', height: '100%' }}>
                  <WidgetHeader title={widget.title} color={color} />
                  <div className="widget-body tb-chart-body" style={{ flex: 1, minHeight: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} fill="#8884d8">
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val) => [`${val} ${unit}`, 'Metric']} contentStyle={{ background: '#0F1E36', border: 'none', borderRadius: 8, color: '#FFF', fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            }

            case 'doughnut-chart': {
              const pieData = [
                { name: 'Active', value: 132, color: color },
                { name: 'Fault', value: 51, color: '#EF4444' },
              ];
              return (
                <div className="widget" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFF', padding: '16px', height: '100%' }}>
                  <WidgetHeader title={widget.title} color={color} />
                  <div className="widget-body tb-chart-body" style={{ flex: 1, minHeight: 150, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={70} fill="#8884d8">
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val) => [`${val} ${unit}`, 'Count']} contentStyle={{ background: '#0F1E36', border: 'none', borderRadius: 8, color: '#FFF', fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ position: 'absolute', textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: '#94A3B8' }}>Total</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>183 {unit}</div>
                    </div>
                  </div>
                </div>
              );
            }

            case 'radar-chart': {
              const radarData = [
                { subject: 'Temp', A: 120, B: 110 },
                { subject: 'Humidity', A: 98, B: 130 },
                { subject: 'Voltage', A: 86, B: 130 },
                { subject: 'Power', A: 99, B: 100 },
              ];
              return (
                <div className="widget" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFF', padding: '16px', height: '100%' }}>
                  <WidgetHeader title={widget.title} color={color} />
                  <div className="widget-body tb-chart-body" style={{ flex: 1, minHeight: 150 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="#CBD5E1" />
                        <PolarAngleAxis dataKey="subject" stroke="#64748B" fontSize={10} />
                        <Radar name="Metrics" dataKey="A" stroke={color} fill={color} fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            }

            case 'gauge': {
              const entityId = config.entityId;
              const key = config.key || 'temperature';
              const latest = getLatestValue(entityId, key);
              const gaugeVal = (latest !== null && latest !== undefined) ? latest : 0;
              const percentage = Math.min(100, Math.max(0, ((gaugeVal - minVal) / (maxVal - minVal)) * 100));
              const displayVal = typeof gaugeVal === 'number' ? gaugeVal.toFixed(decimals) : gaugeVal;
              const gaugeColor = colorMap[config.color] || (config.color && config.color !== '#00695C' ? config.color : '#2563EB');

              return (
                <div className="widget" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFF', padding: '16px', height: '100%' }}>
                  <WidgetHeader title={widget.title} color={gaugeColor} />
                  <div className="widget-body tb-gauge-body" style={{ flex: 1, minHeight: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
                    <div className="tb-gauge-svg-wrapper" style={{ position: 'relative', width: 120, height: 120 }}>
                      <svg width="120" height="120" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="52" fill="none" stroke="#E2E8F0" strokeWidth="9" />
                        <circle
                          cx="60" cy="60" r="52" fill="none"
                          stroke={gaugeColor}
                          strokeWidth="9" strokeLinecap="round"
                          strokeDasharray={`${(percentage / 100) * 327} 327`}
                          transform="rotate(-90 60 60)"
                          style={{ transition: 'stroke-dasharray 1s ease' }}
                        />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="tb-gauge-value" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{displayVal}</span>
                        <span className="tb-gauge-unit" style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, marginTop: 2 }}>{unit}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '11px', color: '#94A3B8', marginTop: 8, padding: '0 12px' }}>
                      <span>Min: {minVal} {unit}</span>
                      <span>Max: {maxVal} {unit}</span>
                    </div>
                  </div>
                </div>
              );
            }

            case 'map': {
              const entityId = config.entityId;
              const latVal = getLatestValue(entityId, config.latKey || 'latitude') || getLatestValue(entityId, 'lat');
              const lngVal = getLatestValue(entityId, config.lngKey || 'longitude') || getLatestValue(entityId, 'lng') || getLatestValue(entityId, 'lon');
              const speedVal = getLatestValue(entityId, 'speed');

              const lat = (latVal !== null && latVal !== undefined && Number(latVal) !== 0) ? Number(latVal) : (Number(config.defaultLat) || 28.6139);
              const lng = (lngVal !== null && lngVal !== undefined && Number(lngVal) !== 0) ? Number(lngVal) : (Number(config.defaultLng) || 77.2090);

              return (
                <div className="widget" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFF', padding: '12px', height: '100%' }}>
                  <WidgetHeader title={widget.title} color={color} />
                  <div className="widget-body tb-map-body" style={{ flex: 1, minHeight: 180, display: 'flex' }}>
                    <MapWidget title={widget.title} lat={lat} lng={lng} deviceName={config.deviceName || 'GPS Tracker Device'} speed={speedVal || 0} />
                  </div>
                </div>
              );
            }

            case 'table': {
              return (
                <div className="widget" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFF', padding: '16px', height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '15px', color: '#202124', fontWeight: 600 }}>{widget.title}</span>
                    <div style={{ display: 'flex', gap: '10px', color: '#5F6368', alignItems: 'center' }}>
                      <Search size={15} style={{ cursor: 'pointer' }} title="Search" />
                      <Filter size={15} style={{ cursor: 'pointer' }} title="Filter" />
                      <LayoutGrid size={15} style={{ cursor: 'pointer' }} title="Columns" />
                      <FileText size={15} style={{ cursor: 'pointer' }} title="Export" />
                      <Maximize2 size={15} style={{ cursor: 'pointer' }} title="Fullscreen" onClick={(e) => {
                        const container = e.currentTarget.closest('.widget-container');
                        if (container) {
                          if (!document.fullscreenElement) container.requestFullscreen().catch(() => {});
                          else document.exitFullscreen().catch(() => {});
                        }
                      }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#5F6368', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid #E0E0E0' }}>
                    <Clock size={14} />
                    <span>Realtime - last 30 days</span>
                  </div>

                  <div className="widget-body tb-table-body" style={{ flex: 1, overflowX: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #E0E0E0', textAlign: 'left', color: '#5F6368' }}>
                          <th style={{ padding: '6px 4px', width: 28 }}><input type="checkbox" style={{ accentColor: '#2563EB' }} /></th>
                          <th style={{ padding: '6px 8px', fontWeight: 500 }}>Created time</th>
                          <th style={{ padding: '6px 8px', fontWeight: 500 }}>Originator</th>
                          <th style={{ padding: '6px 8px', fontWeight: 500 }}>Type</th>
                          <th style={{ padding: '6px 8px', fontWeight: 500 }}>Severity</th>
                          <th style={{ padding: '6px 8px', fontWeight: 500 }}>Status</th>
                          <th style={{ padding: '6px 8px', fontWeight: 500 }}>Assignee</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats?.alarms?.list && stats.alarms.list.length > 0 ? (
                          stats.alarms.list.map(a => (
                            <tr key={a.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                              <td style={{ padding: 6 }}><input type="checkbox" /></td>
                              <td style={{ padding: 6 }}>{new Date(a.createdTime).toLocaleDateString()}</td>
                              <td style={{ padding: 6 }}>{a.originatorName}</td>
                              <td style={{ padding: 6 }}>{a.type}</td>
                              <td style={{ padding: 6 }}><span style={{ color: a.severity === 'CRITICAL' ? '#EF4444' : '#F59E0B', fontWeight: 600 }}>{a.severity}</span></td>
                              <td style={{ padding: 6 }}>{a.status}</td>
                              <td style={{ padding: 6 }}>System</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} style={{ textAlign: 'center', padding: '36px 16px', color: '#5F6368', fontSize: '13px', fontWeight: 400 }}>
                              No alarms found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    <div style={{ borderTop: '1px solid #E0E0E0', paddingTop: '8px', marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px', color: '#5F6368', fontSize: '12px' }}>
                      <span>1 - 0 of 0</span>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <ChevronsLeft size={16} style={{ cursor: 'pointer', opacity: 0.5 }} title="First page" />
                        <ChevronLeft size={16} style={{ cursor: 'pointer', opacity: 0.5 }} title="Previous page" />
                        <ChevronRight size={16} style={{ cursor: 'pointer', opacity: 0.5 }} title="Next page" />
                        <ChevronsRight size={16} style={{ cursor: 'pointer', opacity: 0.5 }} title="Last page" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            case 'button': {
              return (
                <RpcButtonWidgetComponent widget={widget} config={config} color={color} WidgetHeader={WidgetHeader} />
              );
            }

            default:
              return (
                <div className="widget" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFF', padding: '16px', height: '100%' }}>
                  <WidgetHeader title={widget.title} color={color} />
                  <div className="widget-body" style={{ flex: 1, minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', padding: 16, fontSize: 12 }}>
                    ThingsBoard Custom Widget ({widget.type})
                  </div>
                </div>
              );
          }
        })()}
      </div>
    );
  };

  if (!computedWidgets || computedWidgets.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8', border: '2px dashed var(--color-border)', borderRadius: 12 }}>
        No widgets on this dashboard. Add some from the library!
      </div>
    );
  }

  const layoutItems = computedWidgets.map(w => ({
    i: String(w.id),
    x: w.layout.x,
    y: w.layout.y,
    w: w.layout.w,
    h: w.layout.h,
    static: !isEditMode
  }));

  const gridLayouts = {
    lg: layoutItems,
    md: layoutItems,
    sm: layoutItems,
    xs: layoutItems,
    xxs: layoutItems
  };

  return (
    <ResponsiveReactGridLayout
      className="layout"
      layouts={gridLayouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
      rowHeight={80}
      onLayoutChange={(currentLayout) => {
        if (onLayoutChange && isEditMode) {
          onLayoutChange(currentLayout);
        }
      }}
      isDraggable={isEditMode}
      isResizable={isEditMode}
      margin={[16, 16]}
      containerPadding={[0, 0]}
    >
      {computedWidgets.map(renderWidget)}
    </ResponsiveReactGridLayout>
  );
}
