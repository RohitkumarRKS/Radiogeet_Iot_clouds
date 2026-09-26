import { Activity, Zap, Server, ShieldCheck } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const apiTrafficData = [
  { time: '00:00', requests: 1200, websocket: 450 },
  { time: '04:00', requests: 980, websocket: 420 },
  { time: '08:00', requests: 3400, websocket: 1200 },
  { time: '12:00', requests: 5600, websocket: 2100 },
  { time: '16:00', requests: 4800, websocket: 1800 },
  { time: '20:00', requests: 2100, websocket: 850 },
];

export default function ApiUsage() {
  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">API Usage & Metrics</h1>
          <p className="page-subtitle">Monitor REST API call volumes, rate limiting quotas, and WebSocket connection bandwidth</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-primary-light)' }}><Activity size={24} /></div>
          <div>
            <div className="stat-value">18,080</div>
            <div className="stat-label">REST API Calls Today</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}><Server size={24} /></div>
          <div>
            <div className="stat-value">6,820</div>
            <div className="stat-label">Active WebSocket Messages</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)' }}><Zap size={24} /></div>
          <div>
            <div className="stat-value">0.12 ms</div>
            <div className="stat-label">Avg API Latency</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Hourly Request Volume (Last 24h)</span></div>
        <div className="card-body" style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={apiTrafficData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="time" stroke="var(--color-text-tertiary)" fontSize={11} />
              <YAxis stroke="var(--color-text-tertiary)" fontSize={11} />
              <Tooltip contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 8 }} />
              <Area type="monotone" dataKey="requests" stroke="var(--color-primary)" fill="rgba(59, 130, 246, 0.2)" strokeWidth={2} name="REST Requests" />
              <Area type="monotone" dataKey="websocket" stroke="var(--color-success)" fill="rgba(16, 185, 129, 0.2)" strokeWidth={2} name="WS Messages" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
