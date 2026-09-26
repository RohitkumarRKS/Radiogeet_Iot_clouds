import { useState, useEffect } from 'react';
import {
  Network, Plus, Trash2, Search, CheckCircle2, XCircle, RefreshCw,
  Copy, Cpu, Activity, Eye, Server, Radio, ShieldCheck, ChevronRight,
  X, Layers, Zap, Info, ArrowUpRight, Sliders
} from 'lucide-react';
import ThingsBoardGatewayConfigModal from './ThingsBoardGatewayConfigModal';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { useAuthModal } from '../../components/Common/AuthModal';
import { useWebSocket } from '../../context/WebSocketContext';

export default function GatewayList() {
  const toast = useToast();
  const { requireAuth } = useAuthModal();
  const { subscribe } = useWebSocket();

  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [subDevicesData, setSubDevicesData] = useState([]);
  const [revealedTokens, setRevealedTokens] = useState({});
  const [configModalGateway, setConfigModalGateway] = useState(null);

  const [form, setForm] = useState({
    name: '',
    protocolType: 'Modbus TCP / RTU',
    ip: '192.168.1.120',
    port: '502',
    pollInterval: '5000',
    description: '',
  });

  const loadGateways = async () => {
    try {
      setLoading(true);
      const res = await api.get('/gateways');
      setGateways(res.data || []);
    } catch (err) {
      console.error('Failed to load gateways:', err);
      toast?.showToast?.('Failed to load gateways', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGateways();
  }, []);

  // Listen for real-time gateway and device status changes via WebSocket
  useEffect(() => {
    if (!subscribe) return;

    const handleWsEvent = (event) => {
      if (event.type === 'DEVICE_DISCONNECTED' || event.type === 'TELEMETRY_UPDATE') {
        // Refresh gateway list to keep sub-device telemetry & status 100% in sync
        api.get('/gateways').then(res => setGateways(res.data || [])).catch(() => {});
      }
    };

    const unsubGlobal = subscribe('__global__', handleWsEvent);
    return () => {
      if (unsubGlobal) unsubGlobal();
    };
  }, [subscribe]);

  const handleProtocolChange = (protocol) => {
    let defaultPort = '502';
    if (protocol.includes('OPC-UA')) defaultPort = '4840';
    if (protocol.includes('BACnet')) defaultPort = '47808';
    if (protocol.includes('MQTT')) defaultPort = '1883';
    if (protocol.includes('CAN')) defaultPort = '29536';

    setForm({
      ...form,
      protocolType: protocol,
      port: defaultPort,
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    requireAuth(async () => {
      try {
        await api.post('/gateways', form);
        toast?.showToast?.(`Gateway "${form.name}" created successfully!`, 'success');
        setShowAddModal(false);
        setForm({
          name: '',
          protocolType: 'Modbus TCP / RTU',
          ip: '192.168.1.120',
          port: '502',
          pollInterval: '5000',
          description: '',
        });
        loadGateways();
      } catch (err) {
        toast?.showToast?.(err.response?.data?.error || 'Failed to create gateway', 'error');
      }
    }, 'add a new Gateway');
  };

  const handleDelete = (id, name) => {
    requireAuth(async () => {
      if (!confirm(`Are you sure you want to remove Gateway "${name}"? Sub-devices will be unlinked.`)) return;
      try {
        await api.delete(`/gateways/${id}`);
        toast?.showToast?.('Gateway removed successfully', 'success');
        if (selectedGateway?.id === id) setSelectedGateway(null);
        loadGateways();
      } catch (err) {
        toast?.showToast?.('Failed to delete gateway', 'error');
      }
    }, 'delete this gateway');
  };

  const handleRegenerateToken = async (id, e) => {
    e?.stopPropagation();
    requireAuth(async () => {
      if (!confirm('Regenerate gateway access token? Physical gateway must be updated with the new token.')) return;
      try {
        const res = await api.post(`/gateways/${id}/credentials`);
        toast?.showToast?.('New Access Token generated!', 'success');
        loadGateways();
        if (selectedGateway?.id === id) {
          setSelectedGateway(prev => ({ ...prev, accessToken: res.data.accessToken }));
        }
      } catch (err) {
        toast?.showToast?.('Failed to regenerate token', 'error');
      }
    }, 'regenerate token');
  };

  const copyToClipboard = (text, label = 'Access token') => {
    navigator.clipboard.writeText(text);
    toast?.showToast?.(`${label} copied to clipboard!`, 'success');
  };

  const openGatewayDrawer = async (gw) => {
    setSelectedGateway(gw);
    setDetailLoading(true);
    try {
      const res = await api.get(`/gateways/${gw.id}`);
      setSelectedGateway(res.data);
      setSubDevicesData(res.data.subDevices || []);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleRevealToken = (id, e) => {
    e?.stopPropagation();
    setRevealedTokens(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtered list
  const filtered = gateways.filter(g =>
    g.name?.toLowerCase().includes(search.toLowerCase()) ||
    g.protocolType?.toLowerCase().includes(search.toLowerCase()) ||
    g.ip?.toLowerCase().includes(search.toLowerCase())
  );

  // Statistics
  const totalGateways = gateways.length;
  const onlineGateways = gateways.filter(g => g.status === 'ONLINE').length;
  const totalSubDevices = gateways.reduce((acc, g) => acc + (g.connectedDevices || 0), 0);

  return (
    <div className="animate-fadeIn">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Industrial Edge Gateways</h1>
          <p className="page-subtitle">
            Manage hardware protocol bridges (Modbus RS485/TCP, OPC-UA, BACnet, MQTT) and their attached sub-devices
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={loadGateways} title="Refresh gateway list">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add Gateway
          </button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: 12, borderRadius: 10, background: 'rgba(59, 130, 246, 0.12)', color: 'var(--color-primary)' }}>
            <Network size={24} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Gateways</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{totalGateways}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: 12, borderRadius: 10, background: 'rgba(16, 185, 129, 0.12)', color: 'var(--color-success)' }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Active Online</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-success)' }}>
              {onlineGateways} <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>/ {totalGateways}</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: 12, borderRadius: 10, background: 'rgba(245, 158, 11, 0.12)', color: 'var(--color-warning)' }}>
            <Cpu size={24} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Connected Sub-Devices</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-warning)' }}>{totalSubDevices}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: 12, borderRadius: 10, background: 'rgba(139, 92, 246, 0.12)', color: 'var(--color-secondary)' }}>
            <Radio size={24} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>MQTT Port</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)' }}>1883 / 2004</div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="data-table-container">
        <div className="data-table-toolbar">
          <div className="search-input-wrapper">
            <Search size={14} className="search-input-icon" />
            <input
              className="search-input"
              placeholder="Search gateways by name, protocol, or IP..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Gateway Name</th>
              <th>Protocol Type</th>
              <th>Status</th>
              <th>Endpoint / IP</th>
              <th>Connected Sub-Devices</th>
              <th>Access Token</th>
              <th>Last Activity</th>
              <th style={{ width: 100, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '32px' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto', color: 'var(--color-primary)' }} />
                  <div style={{ marginTop: 8, color: 'var(--color-text-secondary)' }}>Loading gateways...</div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="empty-state">
                    <Network size={48} className="empty-state-icon" />
                    <div className="empty-state-title">No industrial gateways found</div>
                    <div className="empty-state-desc">
                      Click "+ Add Gateway" to configure a Modbus RS485, OPC-UA, or BACnet hardware gateway.
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map(g => (
                <tr
                  key={g.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => openGatewayDrawer(g)}
                >
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Server size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                      {g.name}
                    </div>
                    {g.description && (
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                        {g.description}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-info" style={{ fontFamily: 'var(--font-mono)' }}>
                      {g.protocolType}
                    </span>
                  </td>
                  <td>
                    {g.status === 'ONLINE' ? (
                      <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <span className="badge-dot" style={{ background: 'var(--color-success)' }} /> ONLINE
                      </span>
                    ) : (
                      <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <span className="badge-dot" style={{ background: 'var(--color-danger)' }} /> OFFLINE
                      </span>
                    )}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }}>
                    {g.ip}:{g.port}
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: g.connectedDevices > 0 ? 'rgba(59, 130, 246, 0.15)' : 'var(--color-bg-secondary)',
                        color: g.connectedDevices > 0 ? 'var(--color-primary-light)' : 'var(--color-text-tertiary)',
                        fontWeight: 600
                      }}
                    >
                      {g.connectedDevices} Machines
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={e => e.stopPropagation()}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }}>
                        {revealedTokens[g.id] ? g.accessToken : '••••••••••••••••'}
                      </span>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: 4 }}
                        onClick={(e) => toggleRevealToken(g.id, e)}
                        title={revealedTokens[g.id] ? 'Hide Token' : 'Reveal Token'}
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: 4 }}
                        onClick={() => copyToClipboard(g.accessToken, 'Gateway token')}
                        title="Copy Access Token"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </td>
                  <td style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-xs)' }}>
                    {g.lastSeen}
                  </td>
                  <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{
                          backgroundColor: '#00695c',
                          color: '#ffffff',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: 4,
                          fontSize: '11px',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          cursor: 'pointer'
                        }}
                        onClick={() => setConfigModalGateway(g)}
                        title="Open ThingsBoard Cloud Configuration"
                      >
                        <Sliders size={12} /> Config
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => openGatewayDrawer(g)}
                        title="View Sub-Devices & Protocol Specs"
                      >
                        <ChevronRight size={16} />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleDelete(g.id, g.name)}
                        title="Delete Gateway"
                        style={{ color: 'var(--color-danger)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-over / Modal: Sub-Devices & Protocol Details */}
      {selectedGateway && (
        <div className="modal-overlay" onClick={() => setSelectedGateway(null)}>
          <div
            className="modal"
            style={{ maxWidth: 800, width: '90%' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Server size={22} style={{ color: 'var(--color-primary)' }} />
                <div>
                  <h2 className="modal-title" style={{ margin: 0 }}>{selectedGateway.name}</h2>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                    Protocol: <strong>{selectedGateway.protocolType}</strong> • IP: <code>{selectedGateway.ip}:{selectedGateway.port}</code>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{
                    backgroundColor: '#00695c',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 4,
                    cursor: 'pointer'
                  }}
                  onClick={() => setConfigModalGateway(selectedGateway)}
                >
                  <Sliders size={13} /> ThingsBoard Config
                </button>
                <button type="button" className="modal-close" onClick={() => setSelectedGateway(null)}>✕</button>
              </div>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Credentials & Topic Box */}
              <div style={{ padding: 14, borderRadius: 8, background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Gateway Hardware Credentials</span>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '11px', height: 24, padding: '0 8px' }}
                    onClick={(e) => handleRegenerateToken(selectedGateway.id, e)}
                  >
                    Regenerate Token
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--color-bg-tertiary)', padding: '8px 12px', borderRadius: 6 }}>
                  <code style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-primary-light)' }}>
                    {selectedGateway.accessToken}
                  </code>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => copyToClipboard(selectedGateway.accessToken, 'Access Token')}
                  >
                    <Copy size={13} /> Copy Token
                  </button>
                </div>

                <div style={{ marginTop: 10, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
                  📡 <strong>MQTT Ingestion Topic:</strong> <code style={{ color: 'var(--color-text-primary)' }}>v1/gateway/telemetry</code>
                </div>
              </div>

              {/* Connected Sub-devices List */}
              <div>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Connected Sub-Devices & Sensors ({selectedGateway.connectedDevicesCount || subDevicesData.length})</span>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>Auto-discovered via Gateway MQTT stream</span>
                </div>

                {detailLoading ? (
                  <div style={{ textAlign: 'center', padding: 24 }}>
                    <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto' }} />
                  </div>
                ) : subDevicesData.length === 0 ? (
                  <div style={{ padding: 20, textAlign: 'center', border: '1px dashed var(--color-border)', borderRadius: 8, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                    No machines connected behind this gateway yet.
                    <div style={{ marginTop: 4, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
                      When this Gateway publishes payload on <code>v1/gateway/telemetry</code>, attached Modbus slaves or PLCs will appear here automatically!
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                    {subDevicesData.map((sd) => (
                      <div
                        key={sd.id}
                        style={{
                          padding: '10px 14px', borderRadius: 8, background: 'var(--color-bg-secondary)',
                          border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>{sd.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                            {sd.type} • Last Seen: {sd.lastSeen}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {sd.status === 'ONLINE' ? (
                            <span className="badge badge-success" style={{ fontSize: '11px' }}>ONLINE</span>
                          ) : (
                            <span className="badge badge-danger" style={{ fontSize: '11px' }}>OFFLINE</span>
                          )}
                          <a
                            href={`/devices/${sd.id}`}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: 4 }}
                            title="Open Device Telemetry View"
                          >
                            <ArrowUpRight size={14} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sample Gateway MQTT JSON Payload Generator */}
              <div style={{ background: 'var(--color-bg-tertiary)', padding: 12, borderRadius: 8, border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  📝 Industrial Gateway Sample Payload (ThingsBoard Gateway Format)
                </div>
                <pre style={{ margin: 0, padding: 10, borderRadius: 6, background: '#0a0d14', color: '#10b981', fontFamily: 'var(--font-mono)', fontSize: '11px', overflowX: 'auto' }}>
{`// MQTT Client Settings:
// Host: <your-server-ip> | Port: 1883 | Username: ${selectedGateway.accessToken}
// Publish Topic: v1/gateway/telemetry

{
  "Energy_Meter_01": [
    { "values": { "voltage_V": 415.2, "current_A": 24.5, "powerFactor": 0.94 } }
  ],
  "Chiller_Pump_02": { "temperature": 6.8, "motor_status": true }
}`}
                </pre>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedGateway(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Gateway Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Network size={20} style={{ color: 'var(--color-primary)' }} />
                <h2 className="modal-title">Add Industrial Edge Gateway</h2>
              </div>
              <button type="button" className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Gateway Name *</label>
                  <input
                    className="form-input"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                    autoFocus
                    placeholder="e.g. Factory Floor RS485 Gateway Alpha"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Industrial Protocol Type</label>
                  <select
                    className="form-select"
                    value={form.protocolType}
                    onChange={e => handleProtocolChange(e.target.value)}
                  >
                    <option value="Modbus TCP / RTU">Modbus TCP / RTU (RS485 Serial)</option>
                    <option value="OPC-UA Server Bridge">OPC-UA Server Bridge (SCADA / PLC)</option>
                    <option value="BACnet IP">BACnet IP (Building Automation)</option>
                    <option value="MQTT Edge Broker">MQTT Edge Broker / Bridge</option>
                    <option value="CAN Bus / J1939">CAN Bus / J1939 (Automotive / Heavy Equipment)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
                  <div className="form-group">
                    <label className="form-label">IP Address / Host</label>
                    <input
                      className="form-input"
                      value={form.ip}
                      onChange={e => setForm({ ...form, ip: e.target.value })}
                      placeholder="192.168.1.120"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Port</label>
                    <input
                      className="form-input"
                      value={form.port}
                      onChange={e => setForm({ ...form, port: e.target.value })}
                      placeholder="502"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Hardware Polling Interval (ms)</label>
                  <input
                    className="form-input"
                    type="number"
                    value={form.pollInterval}
                    onChange={e => setForm({ ...form, pollInterval: e.target.value })}
                    placeholder="5000"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Plant Location</label>
                  <input
                    className="form-input"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="e.g. Substation MCC Room, Main Line Breakers"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Connect & Save Gateway</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ThingsBoard Cloud Gateway General Configuration Modal */}
      {configModalGateway && (
        <ThingsBoardGatewayConfigModal
          gateway={configModalGateway}
          onClose={() => setConfigModalGateway(null)}
          onUpdated={loadGateways}
        />
      )}
    </div>
  );
}
