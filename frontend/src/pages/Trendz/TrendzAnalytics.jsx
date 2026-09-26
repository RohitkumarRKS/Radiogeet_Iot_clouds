import { useState } from 'react';
import { Hexagon, BarChart2, TrendingUp, Filter, Download } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';

const mockAnalyticsData = [
  { time: '00:00', temperature: 22.4, energy: 450, alarms: 1 },
  { time: '04:00', temperature: 21.8, energy: 410, alarms: 0 },
  { time: '08:00', temperature: 24.5, energy: 680, alarms: 2 },
  { time: '12:00', temperature: 28.9, energy: 890, alarms: 4 },
  { time: '16:00', temperature: 27.2, energy: 780, alarms: 1 },
  { time: '20:00', temperature: 23.6, energy: 520, alarms: 0 },
];

export default function TrendzAnalytics() {
  const [chartType, setChartType] = useState('bar');
  const [metric, setMetric] = useState('temperature');

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Trendz Analytics</h1>
          <p className="page-subtitle">Advanced time-series anomaly detection, energy forecasting, and visual intelligence</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => alert('Exporting analytics CSV report...')}><Download size={14} /> Export Report</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Filter size={16} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontWeight: 600 }}>Analytics Query Controls</span>
          </div>
        </div>
        <div className="card-body" style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label className="form-label" style={{ marginBottom: 4 }}>Chart Type</label>
            <select className="form-select" value={chartType} onChange={e => setChartType(e.target.value)} style={{ width: 140 }}>
              <option value="bar">Bar Chart</option>
              <option value="area">Area Trend</option>
            </select>
          </div>
          <div>
            <label className="form-label" style={{ marginBottom: 4 }}>Telemetry Metric</label>
            <select className="form-select" value={metric} onChange={e => setMetric(e.target.value)} style={{ width: 160 }}>
              <option value="temperature">Temperature (°C)</option>
              <option value="energy">Power Draw (W)</option>
              <option value="alarms">Alarm Events</option>
            </select>
          </div>
          <div>
            <label className="form-label" style={{ marginBottom: 4 }}>Time Range</label>
            <select className="form-select" defaultValue="24h" style={{ width: 140 }}>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">{metric.toUpperCase()} Analytics Visualization</span>
          <TrendingUp size={16} style={{ color: 'var(--color-success)' }} />
        </div>
        <div className="card-body" style={{ height: 380 }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={mockAnalyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="time" stroke="var(--color-text-tertiary)" fontSize={11} />
                <YAxis stroke="var(--color-text-tertiary)" fontSize={11} />
                <Tooltip contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 8 }} />
                <Bar dataKey={metric} fill="var(--color-primary-light)" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <AreaChart data={mockAnalyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="time" stroke="var(--color-text-tertiary)" fontSize={11} />
                <YAxis stroke="var(--color-text-tertiary)" fontSize={11} />
                <Tooltip contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 8 }} />
                <Area type="monotone" dataKey={metric} stroke="var(--color-primary)" fill="rgba(59, 130, 246, 0.2)" strokeWidth={2} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
