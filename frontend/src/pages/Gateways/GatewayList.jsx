import { useState, useEffect } from 'react';
import {
  Network, Plus, Trash2, Search, RotateCw, Settings, Terminal,
  Lock, Copy, Check, Eye, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Server, Shield, Radio, ArrowUpRight
} from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { useAuthModal } from '../../components/Common/AuthModal';
import { useWebSocket } from '../../context/WebSocketContext';
import GatewayConfigModal from './GatewayConfigModal';

export default function GatewayList() {
  const toast = useToast();
  const { requireAuth } = useAuthModal();
  const { subscribe } = useWebSocket();

  // State
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);

  // Pagination State (matching Image 1)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [configModalGateway, setConfigModalGateway] = useState(null);
  const [credentialsGateway, setCredentialsGateway] = useState(null);
  const [terminalGateway, setTerminalGateway] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Copied token state for credentials modal
  const [copiedToken, setCopiedToken] = useState(false);

  // Terminal state
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState([
    'RadioGeet Edge Gateway OS v3.6.2 (Linux 6.1.0-edge-arm64)',
    'Connected to gateway daemon via secure shell channel.',
    'Type "help" for a list of available diagnostic commands.\n'
  ]);

  // Add Gateway Form State
  const [form, setForm] = useState({
    name: '',
    protocolType: 'Modbus TCP / RTU',
    ip: '192.168.1.120',
    port: '502',
    pollInterval: '5000',
    description: '',
  });

  // User Brand Colors
  const BRAND_NAVY = '#0F1E36';
  const BRAND_PRIMARY = '#2563EB';
  const BRAND_PRIMARY_DARK = '#1D4ED8';

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

  // Real-time synchronization
  useEffect(() => {
    if (!subscribe) return;
    const handleWsEvent = (event) => {
      if (event.type === 'DEVICE_DISCONNECTED' || event.type === 'TELEMETRY_UPDATE') {
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
      if (!confirm(`Are you sure you want to delete Gateway "${name}"?`)) return;
      try {
        await api.delete(`/gateways/${id}`);
        toast?.showToast?.('Gateway removed successfully', 'success');
        loadGateways();
      } catch (err) {
        toast?.showToast?.('Failed to delete gateway', 'error');
      }
    }, 'delete this gateway');
  };

  const handleRegenerateToken = async (id) => {
    requireAuth(async () => {
      if (!confirm('Regenerate gateway access token? Physical gateway device must be updated with the new token.')) return;
      try {
        const res = await api.post(`/gateways/${id}/credentials`);
        toast?.showToast?.('New Access Token generated!', 'success');
        loadGateways();
        if (credentialsGateway?.id === id) {
          setCredentialsGateway(prev => ({ ...prev, accessToken: res.data.accessToken }));
        }
      } catch (err) {
        toast?.showToast?.('Failed to regenerate token', 'error');
      }
    }, 'regenerate token');
  };

  const copyToClipboard = (text, label = 'Access token') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    toast?.showToast?.(`${label} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedToken(false), 2000);
  };

  // Format date exactly like Image 1: "YYYY-MM-DD HH:mm:ss"
  const formatDate = (dateStr) => {
    if (!dateStr) return '2026-09-26 12:00:00';
    const d = new Date(dateStr);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  // Filtered gateways
  const filtered = gateways.filter(g =>
    g.name?.toLowerCase().includes(search.toLowerCase()) ||
    g.protocolType?.toLowerCase().includes(search.toLowerCase()) ||
    g.ip?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination calculation
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentItems = filtered.slice(startIndex, endIndex);

  // Terminal command execution
  const handleTerminalSubmit = (e) => {
    e.preventDefault();
    const cmd = terminalInput.trim().toLowerCase();
    if (!cmd) return;

    let output = '';
    if (cmd === 'help') {
      output = 'Available commands: status, uptime, connectors, top, ping, clear, reboot';
    } else if (cmd === 'status') {
      output = `Gateway: ${terminalGateway?.name}\nDaemon: Active (Running)\nBridge: MQTT on port 1883\nConnected Sub-Devices: ${terminalGateway?.connectedDevices || 0}`;
    } else if (cmd === 'uptime') {
      output = 'Uptime: 4 days, 16 hours, 28 minutes. Load average: 0.12, 0.08, 0.05';
    } else if (cmd === 'connectors') {
      output = 'Active connectors:\n- [modbus-1] Modbus RS485 Master: CONNECTED (Port 502)\n- [mqtt-1] MQTT Edge Bridge: CONNECTED (Port 1883)';
    } else if (cmd === 'top') {
      output = 'CPU: 3.8% user, 1.2% sys | Mem: 44.5% (228MB/512MB) | Buffer: 0 pending';
    } else if (cmd === 'clear') {
      setTerminalLogs([]);
      setTerminalInput('');
      return;
    } else if (cmd === 'reboot') {
      output = 'Broadcasting SIGTERM to gateway daemon... Daemon restarted in 820ms.';
    } else {
      output = `bash: ${cmd}: command not found. Type "help" for diagnostic commands.`;
    }

    setTerminalLogs(prev => [...prev, `$ ${terminalInput}`, output]);
    setTerminalInput('');
  };

  return (
    <div style={{ padding: '20px 24px', maxWidth: 1400, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      {/* ============================================================== */}
      {/* PAGE HEADER: Matching Image 1 Topbar Banner                    */}
      {/* ============================================================== */}
      <div
        style={{
          background: BRAND_NAVY,
          color: '#ffffff',
          borderRadius: 8,
          padding: '16px 20px',
          marginBottom: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          boxShadow: '0 2px 6px rgba(15, 30, 54, 0.12)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, opacity: 0.85, fontWeight: 500 }}>
          <Network size={16} />
          <span>Gateways</span>
        </div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '-0.2px' }}>
          Gateway List
        </h1>
      </div>

      {/* ============================================================== */}
      {/* MAIN CARD: Matching Image 1 Table & Toolbar                     */}
      {/* ============================================================== */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden'
        }}
      >
        {/* Card Header Toolbar (Matching Image 1) */}
        <div
          style={{
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f1f5f9',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>
            Gateway list
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {showSearchInput && (
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search gateways..."
                autoFocus
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: 13,
                  outline: 'none',
                  width: 180,
                  transition: 'all 0.15s'
                }}
              />
            )}

            {/* Search Toggle Button */}
            <button
              type="button"
              onClick={() => setShowSearchInput(!showSearchInput)}
              style={{
                border: 'none',
                background: showSearchInput ? '#f1f5f9' : 'transparent',
                color: '#475569',
                cursor: 'pointer',
                padding: 8,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Search Gateways"
            >
              <Search size={18} />
            </button>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={loadGateways}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#475569',
                cursor: 'pointer',
                padding: 8,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Refresh Gateway List"
            >
              <RotateCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>

            {/* + Add Gateway Button (Exact Image 1 Style in User's Theme) */}
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              style={{
                backgroundColor: BRAND_NAVY,
                color: '#ffffff',
                border: 'none',
                borderRadius: 6,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(15, 30, 54, 0.25)',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = BRAND_PRIMARY}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = BRAND_NAVY}
            >
              <Plus size={16} /> Add Gateway
            </button>
          </div>
        </div>

        {/* Table View (Matching Columns of Image 1) */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ color: '#64748b', borderBottom: '1px solid #e2e8f0', background: '#fafbfc' }}>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Created time</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Gateway name</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Enabled Connectors</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Version</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    <RotateCw size={24} className="animate-spin" style={{ margin: '0 auto 8px', color: BRAND_PRIMARY }} />
                    <div>Loading gateways...</div>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    <Server size={36} style={{ margin: '0 auto 8px', opacity: 0.6 }} />
                    <div style={{ fontWeight: 600, color: '#475569' }}>No gateways found</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>Click "+ Add Gateway" to configure an industrial edge gateway.</div>
                  </td>
                </tr>
              ) : (
                currentItems.map(g => {
                  const isOnline = g.status === 'ONLINE' || g.isActive;
                  const enabledConnectorsCount = g.additionalInfo?.gatewayConfig?.connectors?.filter(c => c.enabled)?.length ?? (isOnline ? 2 : 0);
                  const version = g.additionalInfo?.version || 'v3.6.2';

                  return (
                    <tr
                      key={g.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* Created time (YYYY-MM-DD HH:mm:ss) */}
                      <td style={{ padding: '14px 20px', color: '#334155', fontFamily: 'inherit' }}>
                        {formatDate(g.createdAt)}
                      </td>

                      {/* Gateway name */}
                      <td style={{ padding: '14px 20px', fontWeight: 600, color: '#1e293b' }}>
                        {g.name}
                      </td>

                      {/* Status (Exact Badge from Image 1: soft green Active or soft red Inactive) */}
                      <td style={{ padding: '14px 20px' }}>
                        {isOnline ? (
                          <span
                            style={{
                              padding: '4px 14px',
                              borderRadius: 16,
                              fontSize: 12,
                              fontWeight: 600,
                              backgroundColor: '#ecfdf5',
                              color: '#059669',
                              display: 'inline-block'
                            }}
                          >
                            Active
                          </span>
                        ) : (
                          <span
                            style={{
                              padding: '4px 14px',
                              borderRadius: 16,
                              fontSize: 12,
                              fontWeight: 600,
                              backgroundColor: '#fef2f2',
                              color: '#dc2626',
                              display: 'inline-block'
                            }}
                          >
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Enabled Connectors */}
                      <td style={{ padding: '14px 20px', color: '#334155' }}>
                        {enabledConnectorsCount}
                      </td>

                      {/* Version */}
                      <td style={{ padding: '14px 20px', color: '#64748b' }}>
                        {version}
                      </td>

                      {/* Actions: [ >_ Terminal ] [ ⚙️ Settings ] [ 🔒 Lock ] [ 🗑️ Delete ] */}
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                          {/* 1. Terminal Icon (>_) */}
                          <button
                            type="button"
                            onClick={() => setTerminalGateway(g)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#475569',
                              cursor: 'pointer',
                              padding: 4,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Open Remote Shell Terminal"
                          >
                            <Terminal size={17} />
                          </button>

                          {/* 2. Settings Icon (⚙️) - OPENS IMAGE 2 GENERAL CONFIGURATION */}
                          <button
                            type="button"
                            onClick={() => setConfigModalGateway(g)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#475569',
                              cursor: 'pointer',
                              padding: 4,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="General Configuration"
                          >
                            <Settings size={17} />
                          </button>

                          {/* 3. Lock Icon (🔒) - Opens Credentials */}
                          <button
                            type="button"
                            onClick={() => setCredentialsGateway(g)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#475569',
                              cursor: 'pointer',
                              padding: 4,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Gateway Access Credentials"
                          >
                            <Lock size={17} />
                          </button>

                          {/* 4. Delete Icon (🗑️) */}
                          <button
                            type="button"
                            onClick={() => handleDelete(g.id, g.name)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#475569',
                              cursor: 'pointer',
                              padding: 4,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Delete Gateway"
                          >
                            <Trash2 size={17} />
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

        {/* ============================================================== */}
        {/* PAGINATION FOOTER: Exact match of Image 1                       */}
        {/* ============================================================== */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 20,
            fontSize: 12,
            color: '#64748b'
          }}
        >
          {/* Items per page */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Items per page:</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                border: '1px solid #cbd5e1',
                borderRadius: 4,
                padding: '3px 6px',
                fontSize: 12,
                color: '#334155',
                outline: 'none',
                background: '#ffffff'
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Current Range: "1 - 3 of 3" */}
          <div>
            {totalItems === 0 ? '0 of 0' : `${startIndex + 1} – ${endIndex} of ${totalItems}`}
          </div>

          {/* Pagination Navigation: |<  <  >  >| */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(1)}
              style={{
                border: 'none',
                background: 'transparent',
                color: currentPage <= 1 ? '#cbd5e1' : '#475569',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center'
              }}
              title="First Page"
            >
              <ChevronsLeft size={16} />
            </button>

            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              style={{
                border: 'none',
                background: 'transparent',
                color: currentPage <= 1 ? '#cbd5e1' : '#475569',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center'
              }}
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              style={{
                border: 'none',
                background: 'transparent',
                color: currentPage >= totalPages ? '#cbd5e1' : '#475569',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center'
              }}
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(totalPages)}
              style={{
                border: 'none',
                background: 'transparent',
                color: currentPage >= totalPages ? '#cbd5e1' : '#475569',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center'
              }}
              title="Last Page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: GENERAL CONFIGURATION (Image 2)                       */}
      {/* ============================================================== */}
      {configModalGateway && (
        <GatewayConfigModal
          gateway={configModalGateway}
          onClose={() => setConfigModalGateway(null)}
          onUpdated={loadGateways}
        />
      )}

      {/* ============================================================== */}
      {/* MODAL 2: CREDENTIALS (Lock Icon Click)                         */}
      {/* ============================================================== */}
      {credentialsGateway && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 30, 54, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            backdropFilter: 'blur(3px)'
          }}
          onClick={() => setCredentialsGateway(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 520,
              background: '#ffffff',
              borderRadius: 10,
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              fontFamily: "'Inter', sans-serif"
            }}
            onClick={e => e.stopPropagation()}
          >
            <div
              style={{
                background: BRAND_NAVY,
                color: '#ffffff',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 600 }}>
                <Lock size={18} />
                <span>Gateway Credentials</span>
              </div>
              <button
                type="button"
                onClick={() => setCredentialsGateway(null)}
                style={{ border: 'none', background: 'transparent', color: '#ffffff', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Gateway Name</label>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginTop: 2 }}>{credentialsGateway.name}</div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Access Token</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px' }}>
                  <code style={{ flex: 1, fontFamily: 'monospace', fontSize: 13, color: BRAND_PRIMARY_DARK }}>
                    {credentialsGateway.accessToken}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(credentialsGateway.accessToken, 'Access Token')}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: copiedToken ? '#10b981' : '#64748b' }}
                  >
                    {copiedToken ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ fontSize: 12, color: '#64748b', background: '#f1f5f9', padding: '10px 12px', borderRadius: 6 }}>
                📡 <strong>MQTT Telemetry Topic:</strong> <code style={{ color: BRAND_PRIMARY }}>v1/gateway/telemetry</code>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => handleRegenerateToken(credentialsGateway.id)}
                  style={{ border: 'none', background: 'transparent', color: BRAND_PRIMARY, fontSize: 12, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Regenerate Token
                </button>

                <button
                  type="button"
                  onClick={() => setCredentialsGateway(null)}
                  style={{
                    backgroundColor: BRAND_NAVY,
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 18px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: REMOTE SHELL TERMINAL (Terminal Icon Click)           */}
      {/* ============================================================== */}
      {terminalGateway && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 30, 54, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            backdropFilter: 'blur(3px)'
          }}
          onClick={() => setTerminalGateway(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 720,
              background: '#0B132B',
              borderRadius: 10,
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
              fontFamily: "'Inter', sans-serif",
              border: '1px solid #1E293B'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div
              style={{
                background: '#070D1F',
                color: '#ffffff',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #1E293B'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600 }}>
                <Terminal size={16} style={{ color: BRAND_PRIMARY }} />
                <span>Remote Shell: {terminalGateway.name} (IP: {terminalGateway.ip || '192.168.1.120'})</span>
              </div>
              <button
                type="button"
                onClick={() => setTerminalGateway(null)}
                style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                padding: 16,
                minHeight: 260,
                maxHeight: 380,
                overflowY: 'auto',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize: 13,
                color: '#38BDF8',
                display: 'flex',
                flexDirection: 'column',
                gap: 6
              }}
            >
              {terminalLogs.map((log, i) => (
                <div key={i} style={{ whiteSpace: 'pre-wrap', color: log.startsWith('$') ? '#ffffff' : '#94A3B8' }}>
                  {log}
                </div>
              ))}
            </div>

            <form
              onSubmit={handleTerminalSubmit}
              style={{
                display: 'flex',
                borderTop: '1px solid #1E293B',
                background: '#070D1F',
                padding: '8px 14px'
              }}
            >
              <span style={{ color: '#10B981', fontFamily: 'monospace', padding: '6px 8px 6px 0', fontSize: 13, fontWeight: 700 }}>
                admin@edge:~$
              </span>
              <input
                type="text"
                value={terminalInput}
                onChange={e => setTerminalInput(e.target.value)}
                placeholder="Type command (e.g. status, uptime, connectors, top, clear)..."
                autoFocus
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontFamily: 'monospace',
                  fontSize: 13
                }}
              />
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: ADD GATEWAY (Matching User's Brand Colors)            */}
      {/* ============================================================== */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 30, 54, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            backdropFilter: 'blur(3px)'
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 520,
              background: '#ffffff',
              borderRadius: 10,
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              fontFamily: "'Inter', sans-serif"
            }}
            onClick={e => e.stopPropagation()}
          >
            <div
              style={{
                background: BRAND_NAVY,
                color: '#ffffff',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 600 }}>
                <Network size={18} />
                <span>Add Gateway</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ border: 'none', background: 'transparent', color: '#ffffff', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Gateway Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. rohit or Plant Floor Modbus Gateway 01"
                    style={{
                      width: '100%',
                      marginTop: 4,
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Industrial Protocol Type</label>
                  <select
                    value={form.protocolType}
                    onChange={e => handleProtocolChange(e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: 4,
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  >
                    <option value="Modbus TCP / RTU">Modbus TCP / RTU (RS485 Serial)</option>
                    <option value="OPC-UA Server Bridge">OPC-UA Server Bridge (SCADA / PLC)</option>
                    <option value="BACnet IP">BACnet IP (Building Automation)</option>
                    <option value="MQTT Edge Broker">MQTT Edge Broker / Bridge</option>
                    <option value="CAN Bus / J1939">CAN Bus / J1939 (Heavy Machinery)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>IP Address / Host</label>
                    <input
                      type="text"
                      value={form.ip}
                      onChange={e => setForm({ ...form, ip: e.target.value })}
                      placeholder="192.168.1.120"
                      style={{
                        width: '100%',
                        marginTop: 4,
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        fontSize: 13,
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Port</label>
                    <input
                      type="number"
                      value={form.port}
                      onChange={e => setForm({ ...form, port: e.target.value })}
                      placeholder="502"
                      style={{
                        width: '100%',
                        marginTop: 4,
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        fontSize: 13,
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Hardware Polling Interval (ms)</label>
                  <input
                    type="number"
                    value={form.pollInterval}
                    onChange={e => setForm({ ...form, pollInterval: e.target.value })}
                    placeholder="5000"
                    style={{
                      width: '100%',
                      marginTop: 4,
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Description / Plant Location</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="e.g. Substation MCC Room, Main Line Breakers"
                    style={{
                      width: '100%',
                      marginTop: 4,
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  padding: '12px 20px',
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 12
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#64748b',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: BRAND_NAVY,
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 18px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(15, 30, 54, 0.2)'
                  }}
                >
                  Save Gateway
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
