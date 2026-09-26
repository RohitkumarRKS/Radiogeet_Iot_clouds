import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { ArrowLeft, Copy, RefreshCw, Key, Activity, Send, AlertTriangle, Zap, Terminal, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useToast } from '../../context/ToastContext';
import { useAuthModal } from '../../components/Common/AuthModal';
import { useWebSocket } from '../../context/WebSocketContext';

export default function DeviceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { requireAuth } = useAuthModal();
  const { subscribe } = useWebSocket();
  const [device, setDevice] = useState(null);
  const [tab, setTab] = useState('details');
  const [telemetry, setTelemetry] = useState([]);
  const [latestTelemetry, setLatestTelemetry] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState(null);

  // RPC states
  const [rpcMethod, setRpcMethod] = useState('setGpioStatus');
  const [rpcParams, setRpcParams] = useState('{\n  "pin": 12,\n  "enabled": true\n}');
  const [rpcLogs, setRpcLogs] = useState([]);
  const [rpcSending, setRpcSending] = useState(false);

  const handleSendRpc = async (e, customMethod = null, customParams = null) => {
    if (e && e.preventDefault) e.preventDefault();
    setRpcSending(true);
    const methodToUse = customMethod || rpcMethod;
    let paramsToUse = customParams;
    if (!paramsToUse) {
      try {
        paramsToUse = rpcParams.trim() ? JSON.parse(rpcParams) : {};
      } catch {
        toast.showToast('Invalid JSON parameters string', 'error');
        setRpcSending(false);
        return;
      }
    }

    try {
      const res = await api.post(`/devices/${id}/rpc`, {
        method: methodToUse,
        params: paramsToUse
      });
      const logEntry = {
        id: res.data.requestId || Date.now(),
        ts: new Date().toLocaleTimeString(),
        method: methodToUse,
        params: paramsToUse,
        status: 'DELIVERED',
        targetDevice: res.data.targetDevice || device?.name || 'Device'
      };
      setRpcLogs(prev => [logEntry, ...prev]);
      toast.showToast(`RPC Command '${methodToUse}' sent!`, 'success');
    } catch (err) {
      toast.showToast(`RPC Error: ${err.response?.data?.error || err.message}`, 'error');
    } finally {
      setRpcSending(false);
    }
  };

  // Modal states
  const [showTelemetryModal, setShowTelemetryModal] = useState(false);
  const [showAlarmModal, setShowAlarmModal] = useState(false);
  const [telemetryPayload, setTelemetryPayload] = useState('{\n  "temperature": 26.5,\n  "humidity": 55.0,\n  "voltage": 220.4\n}');
  const [alarmForm, setAlarmForm] = useState({ type: 'High Temperature Alarm', severity: 'CRITICAL', message: 'Temperature exceeded threshold 50°C' });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get(`/devices/${id}`),
      api.get(`/telemetry/${id}/latest`),
      api.get(`/alarms/entity/${id}`),
      api.get(`/devices/${id}/credentials`),
    ]).then(([devRes, telRes, alarmRes, credRes]) => {
      setDevice(devRes.data);
      setLatestTelemetry(telRes.data);
      setAlarms(alarmRes.data.data || []);
      setCredentials(credRes.data);
    }).catch((err) => {
      if (err.response?.status === 404) navigate('/devices');
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [id]);

  useEffect(() => {
    if (tab === 'telemetry' && id) {
      const endTs = Date.now();
      const startTs = endTs - 24 * 3600000;
      api.get(`/telemetry/${id}/timeseries`, { params: { startTs, endTs, limit: 200 } })
        .then(res => {
          const grouped = res.data;
          const allTs = new Set();
          Object.values(grouped).forEach(arr => arr.forEach(p => allTs.add(p.ts)));
          const sorted = [...allTs].sort();
          const chartData = sorted.map(ts => {
            const point = { ts, time: new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
            Object.entries(grouped).forEach(([key, arr]) => {
              const found = arr.find(p => p.ts === ts);
              if (found) point[key] = parseFloat(found.value.toFixed(2));
            });
            return point;
          });
          setTelemetry(chartData);
        })
        .catch(console.error);
    }
  }, [tab, id]);

  // Subscribe to real-time WebSocket telemetry updates for this device
  useEffect(() => {
    if (!id || !subscribe) return;
    let lastTs = null;

    const unsubscribe = subscribe(id, (event) => {
      if (event.type === 'TELEMETRY_UPDATE' && Array.isArray(event.data)) {
        lastTs = Date.now();
        setLatestTelemetry((prev) => {
          const next = [...prev];
          event.data.forEach((item) => {
            const idx = next.findIndex((t) => t.key === item.key);
            const newEntry = { key: item.key, value: item.value, timestamp: item.ts || new Date().toISOString() };
            if (idx !== -1) {
              next[idx] = newEntry;
            } else {
              next.push(newEntry);
            }
          });
          return next;
        });

        setTelemetry((prev) => {
          const timeStr = new Date(event.data[0]?.ts || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const newPoint = { ts: event.data[0]?.ts || Date.now(), time: timeStr };
          event.data.forEach((item) => {
            newPoint[item.key] = typeof item.value === 'number' ? parseFloat(item.value.toFixed(2)) : item.value;
          });
          return [...prev, newPoint];
        });
      }
    });

    const watchdog = setInterval(() => {
      if (lastTs && Date.now() - lastTs > 3000) {
        setLatestTelemetry(prev => prev.map(t => ({ ...t, value: 0 })));
        lastTs = null;
      }
    }, 500);

    return () => {
      if (unsubscribe) unsubscribe();
      clearInterval(watchdog);
    };
  }, [id, subscribe]);

  const copyToken = () => {
    if (credentials?.accessToken) {
      navigator.clipboard.writeText(credentials.accessToken);
      toast.showToast('Access token copied to clipboard!', 'success');
    }
  };

  const handleSendTelemetry = (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(telemetryPayload);
      api.post(`/telemetry/${id}`, parsed).then(() => {
        toast.showToast('Telemetry sent successfully!', 'success');
        setShowTelemetryModal(false);
        loadData();
      }).catch(err => {
        toast.showToast(`Error: ${err.message}`, 'error');
      });
    } catch {
      toast.showToast('Invalid JSON payload formatting', 'error');
    }
  };

  const handleCreateAlarm = (e) => {
    e.preventDefault();
    requireAuth(async () => {
      await api.post('/alarms', {
        originatorType: 'DEVICE',
        originatorId: id,
        type: alarmForm.type,
        severity: alarmForm.severity,
        detail: { message: alarmForm.message },
      });
      toast.showToast('Alarm generated successfully!', 'success');
      setShowAlarmModal(false);
      loadData();
    }, 'generate an Alarm');
  };

  if (loading || !device) {
    return (
      <div className="animate-fadeIn">
        <div className="skeleton" style={{ height: 32, width: 200, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 400, borderRadius: 12 }} />
      </div>
    );
  }

  const telemetryKeys = latestTelemetry.map(t => t.key);
  const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/devices')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">{device.name}</h1>
            <p className="page-subtitle">
              <span className={`badge ${device.isActive ? 'badge-active' : 'badge-inactive'}`} style={{ marginRight: 8 }}>
                <span className="badge-dot" /> {device.isActive ? 'Active' : 'Inactive'}
              </span>
              {device.type} • {device.label || 'No label'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => setShowTelemetryModal(true)}>
            <Send size={14} /> Send Telemetry
          </button>
          <button className="btn btn-primary" onClick={() => setShowAlarmModal(true)}>
            <AlertTriangle size={14} /> Trigger Alarm
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['details', 'telemetry', 'latest', 'alarms', 'rpc'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'rpc' ? 'RPC Control' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {/* Details Tab */}
        {tab === 'details' && (
          <div className="card">
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
                {[
                  ['Name', device.name],
                  ['Type', device.type],
                  ['Label', device.label || '—'],
                  ['Profile', device.DeviceProfile?.name || '—'],
                  ['Gateway', device.isGateway ? 'Yes' : 'No'],
                  ['Customer', device.Customer?.name || 'Unassigned'],
                  ['Created', new Date(device.createdAt).toLocaleString()],
                  ['Last Activity', device.lastActivityTime ? new Date(device.lastActivityTime).toLocaleString() : 'Never'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{label}</div>
                    <div style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-primary)' }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Access Token */}
              <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-5)', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                  <Key size={16} style={{ color: 'var(--color-warning)' }} />
                  <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Device Access Token</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <code style={{
                    flex: 1, background: 'var(--color-bg-primary)', padding: 'var(--space-3) var(--space-4)',
                    borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-border)',
                    fontSize: 'var(--font-size-sm)', fontFamily: 'var(--font-mono)', color: '#2563EB', fontWeight: 600,
                  }}>
                    {credentials?.accessToken || device?.accessToken || '••••••••••••••••••••'}
                  </code>
                  <button className="btn btn-secondary btn-sm" onClick={copyToken} title="Copy Token">
                    <Copy size={14} /> Copy Token
                  </button>
                </div>
              </div>

              {/* MQTT & HTTP Device Connection Guide */}
              <div style={{ marginTop: '24px', padding: '20px', background: '#F8FAFC', border: '1px solid #DBEAFE', borderRadius: '10px' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#2563EB' }} />
                  ThingsBoard Compatible MQTT & HTTP Integration Guide
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', background: '#FFF', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                  <div><strong>MQTT Protocol:</strong> TCP Port 1883</div>
                  <div><strong>MQTT Topic:</strong> <code style={{ color: '#2563EB' }}>v1/devices/me/telemetry</code></div>
                  <div><strong>HTTP Telemetry URL:</strong> <code style={{ color: '#2563EB' }}>http://localhost:2004/api/telemetry/v1/{credentials?.accessToken || device?.accessToken || 'TOKEN'}/telemetry</code></div>
                  <div><strong>Payload Format:</strong> JSON key-value pairs</div>
                </div>

                {/* mosquitto CLI */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Mosquitto MQTT Command Line:</div>
                  <pre style={{ background: '#0F1E36', color: '#38BDF8', padding: '12px', borderRadius: '6px', fontSize: '12px', overflowX: 'auto', margin: 0, fontFamily: 'monospace' }}>
{`mosquitto_pub -h localhost -p 1883 -t v1/devices/me/telemetry -u "${credentials?.accessToken || device?.accessToken || 'TOKEN'}" -m '{"temperature": 26.5, "humidity": 58.0}'`}
                  </pre>
                </div>

                {/* Python MQTT */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Python paho-mqtt Client Code:</div>
                  <pre style={{ background: '#0F1E36', color: '#A7F3D0', padding: '12px', borderRadius: '6px', fontSize: '12px', overflowX: 'auto', margin: 0, fontFamily: 'monospace' }}>
{`import paho.mqtt.client as mqtt, json
client = mqtt.Client()
client.username_pw_set("${credentials?.accessToken || device?.accessToken || 'TOKEN'}")
client.connect("localhost", 1883, 60)
client.publish("v1/devices/me/telemetry", json.dumps({"temperature": 27.2, "humidity": 54.0}))`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Telemetry Chart Tab */}
        {tab === 'telemetry' && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Telemetry (Last 24 Hours)</span>
              <Activity size={16} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div className="card-body" style={{ height: 400 }}>
              {telemetry.length === 0 ? (
                <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                  <div className="empty-state-title">No telemetry data</div>
                  <div className="empty-state-desc">Use "Send Telemetry" button above to push test readings</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={telemetry}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="time" stroke="var(--color-text-tertiary)" fontSize={11} tick={{ fill: 'var(--color-text-tertiary)' }} />
                    <YAxis stroke="var(--color-text-tertiary)" fontSize={11} tick={{ fill: 'var(--color-text-tertiary)' }} />
                    <Tooltip contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
                    {telemetryKeys.map((key, idx) => (
                      <Line key={key} type="monotone" dataKey={key} stroke={chartColors[idx % chartColors.length]} strokeWidth={2} dot={false} name={key} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* Latest Telemetry Tab */}
        {tab === 'latest' && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Latest Telemetry Values</span>
              <button className="btn btn-ghost btn-sm" onClick={() => api.get(`/telemetry/${id}/latest`).then(r => setLatestTelemetry(r.data))}>
                <RefreshCw size={14} />
              </button>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>Key</th><th>Value</th><th>Last Updated</th></tr>
              </thead>
              <tbody>
                {latestTelemetry.length === 0 ? (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', padding: 'var(--space-8)' }}>No telemetry data available</td></tr>
                ) : (
                  latestTelemetry.map((t) => (
                    <tr key={t.key}>
                      <td style={{ fontWeight: 500 }}>{t.key}</td>
                      <td><span style={{ color: 'var(--color-secondary-light)', fontFamily: 'var(--font-mono)' }}>{typeof t.value === 'number' ? t.value.toFixed(2) : t.value}</span></td>
                      <td style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)' }}>{new Date(t.timestamp).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Alarms Tab */}
        {tab === 'alarms' && (
          <div className="card">
            <div className="card-header"><span className="card-title">Device Alarms</span></div>
            <table className="data-table">
              <thead>
                <tr><th>Type</th><th>Severity</th><th>Status</th><th>Started</th></tr>
              </thead>
              <tbody>
                {alarms.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', padding: 'var(--space-8)' }}>No alarms for this device</td></tr>
                ) : (
                  alarms.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 500 }}>{a.type}</td>
                      <td><span className={`badge badge-${a.severity === 'CRITICAL' ? 'critical' : a.severity === 'MAJOR' ? 'major' : a.severity === 'MINOR' ? 'minor' : 'warning'}`}>{a.severity}</span></td>
                      <td><span className={`badge ${a.status.includes('ACTIVE') ? 'badge-danger' : 'badge-inactive'}`}>{a.status.replace(/_/g, ' ')}</span></td>
                      <td style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)' }}>{new Date(a.startTs).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* RPC Control Tab */}
        {tab === 'rpc' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
            {/* RPC Command Dispatcher Card */}
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Zap size={18} style={{ color: 'var(--color-primary)' }} /> Send 2-Way RPC Command
                </span>
                <span style={{ fontSize: 11, background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                  MQTT / HTTP Ready
                </span>
              </div>

              <div className="card-body">
                {/* Quick Action Presets */}
                <div style={{ marginBottom: 16 }}>
                  <label className="form-label" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
                    Quick Action Presets
                  </label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleSendRpc(null, 'setGpioStatus', { pin: 12, enabled: true })}
                    >
                      Relay 1 ON
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleSendRpc(null, 'setGpioStatus', { pin: 12, enabled: false })}
                    >
                      Relay 1 OFF
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleSendRpc(null, 'reboot', { delayMs: 1000 })}
                    >
                      Reboot Hardware
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleSendRpc(null, 'setTemperatureTarget', { targetTemp: 24.5 })}
                    >
                      Set Temp 24.5°C
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSendRpc}>
                  <div className="form-group" style={{ marginBottom: 14 }}>
                    <label className="form-label">RPC Method Name *</label>
                    <input
                      className="form-input"
                      value={rpcMethod}
                      onChange={e => setRpcMethod(e.target.value)}
                      placeholder="e.g. setGpioStatus, reboot, getValue"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label className="form-label">RPC Parameters (JSON Object)</label>
                    <textarea
                      className="form-textarea"
                      rows={5}
                      value={rpcParams}
                      onChange={e => setRpcParams(e.target.value)}
                      placeholder="{}"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={rpcSending}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px' }}
                  >
                    <Zap size={16} /> {rpcSending ? 'Dispatching RPC...' : 'Execute RPC Command'}
                  </button>
                </form>
              </div>
            </div>

            {/* RPC Execution History Log */}
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Terminal size={18} style={{ color: 'var(--color-secondary-light)' }} /> RPC Dispatch Log
                </span>
                {rpcLogs.length > 0 && (
                  <button className="btn btn-ghost btn-sm" onClick={() => setRpcLogs([])} style={{ fontSize: 11 }}>
                    Clear Log
                  </button>
                )}
              </div>

              <div className="card-body" style={{ maxHeight: 380, overflowY: 'auto', padding: 0 }}>
                {rpcLogs.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 13 }}>
                    No RPC commands sent yet in this session. Trigger a command above or click an RPC widget button on the dashboard.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {rpcLogs.map((log, index) => (
                      <div
                        key={log.id + '-' + index}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid var(--color-border)',
                          background: index % 2 === 0 ? 'var(--color-bg-primary)' : 'transparent',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-primary-light)' }}>
                            {log.method}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="badge badge-active" style={{ fontSize: 10, padding: '2px 6px' }}>
                              <CheckCircle size={10} style={{ marginRight: 2 }} /> {log.status}
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{log.ts}</span>
                          </div>
                        </div>

                        <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', background: 'var(--color-bg-tertiary)', padding: '6px 10px', borderRadius: 4 }}>
                          {JSON.stringify(log.params)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Send Telemetry Modal */}
      {showTelemetryModal && (
        <div className="modal-overlay">
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Send Telemetry Data</h2>
              <button type="button" className="modal-close" onClick={() => setShowTelemetryModal(false)} aria-label="Close modal">✕</button>
            </div>
            <form onSubmit={handleSendTelemetry}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Telemetry JSON Payload *</label>
                  <textarea className="form-textarea" rows={6} value={telemetryPayload} onChange={e => setTelemetryPayload(e.target.value)} required style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTelemetryModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Send size={14} /> Send Telemetry</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trigger Alarm Modal */}
      {showAlarmModal && (
        <div className="modal-overlay">
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Trigger Test Alarm</h2>
              <button type="button" className="modal-close" onClick={() => setShowAlarmModal(false)} aria-label="Close modal">✕</button>

            </div>
            <form onSubmit={handleCreateAlarm}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Alarm Type *</label>
                  <input className="form-input" value={alarmForm.type} onChange={e => setAlarmForm({ ...alarmForm, type: e.target.value })} required autoFocus />
                </div>
                <div className="form-group">
                  <label className="form-label">Severity</label>
                  <select className="form-select" value={alarmForm.severity} onChange={e => setAlarmForm({ ...alarmForm, severity: e.target.value })}>
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="MAJOR">MAJOR</option>
                    <option value="MINOR">MINOR</option>
                    <option value="WARNING">WARNING</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Alarm Detail Message</label>
                  <input className="form-input" value={alarmForm.message} onChange={e => setAlarmForm({ ...alarmForm, message: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAlarmModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Generate Alarm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
