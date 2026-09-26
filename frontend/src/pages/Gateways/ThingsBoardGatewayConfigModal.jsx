import { useState, useEffect } from 'react';
import {
  X, Info, Copy, Check, RefreshCw, Terminal, HardDrive,
  Activity, Sliders, Shield, Layers, Server, AlertTriangle,
  Play, Pause, Trash2, Plus, ArrowUpRight
} from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';

export default function ThingsBoardGatewayConfigModal({ gateway, onClose, onUpdated }) {
  const toast = useToast();

  // Mode: 'basic' | 'advanced'
  const [configMode, setConfigMode] = useState('basic');

  // Tabs: 'General' | 'Connectors' | 'Logs' | 'Storage' | 'GRPC' | 'Statistics' | 'Other'
  const [activeTab, setActiveTab] = useState('General');

  // Loading & Saving states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Live Logs state
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logFilter, setLogFilter] = useState('ALL');
  const [logSearch, setLogSearch] = useState('');

  // Live Stats state
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Form State initialized from gateway or gateway.gatewayConfig
  const [formData, setFormData] = useState({
    name: gateway?.name || '',
    remoteConfiguration: true,
    remoteShell: false,
    platformHost: 'thingsboard.cloud',
    platformPort: 1883,
    securityType: 'ACCESS_TOKEN', // 'ACCESS_TOKEN' | 'TLS_ACCESS_TOKEN' | 'USERNAME_PASSWORD'
    accessToken: gateway?.accessToken || '',
    username: '',
    password: '',
    caCertPath: '/etc/ssl/certs/tb_cloud_ca.pem',
    clientCertPath: '/etc/ssl/certs/gateway_cert.pem',
    clientKeyPath: '/etc/ssl/certs/gateway_key.pem',
    connectors: [
      { id: 'modbus-1', name: 'Modbus RS485 Master', type: 'modbus', enabled: true, pollPeriod: 5000, port: 502, slaveCount: 2, status: 'CONNECTED' },
      { id: 'mqtt-1', name: 'MQTT Edge Bridge', type: 'mqtt', enabled: true, brokerHost: '127.0.0.1', brokerPort: 1883, status: 'CONNECTED' },
      { id: 'opcua-1', name: 'OPC-UA Server Bridge', type: 'opcua', enabled: false, endpoint: 'opc.tcp://192.168.1.150:4840', status: 'DISABLED' },
      { id: 'bacnet-1', name: 'BACnet IP Connector', type: 'bacnet', enabled: false, port: 47808, status: 'DISABLED' },
      { id: 'rest-1', name: 'REST Ingestion Bridge', type: 'rest', enabled: true, port: 5000, status: 'CONNECTED' },
    ],
    storage: {
      type: 'file',
      maxRecords: 100000,
      readBatchSize: 100,
      dataRetentionDays: 7,
      storagePath: '/var/lib/thingsboard_gateway/storage'
    },
    grpc: {
      enabled: false,
      serverPort: 50051,
      keepAliveTimeSec: 60,
      maxMessageSizeMb: 4
    },
    advanced: {
      keepAliveSec: 60,
      maxInflightMessages: 100,
      minReconnectDelaySec: 1,
      maxReconnectDelaySec: 120,
      qosLevel: 1,
      offlineBufferThreshold: 5000,
      logLevel: 'INFO',
      statsIntervalSec: 60
    }
  });

  // Fetch full details of the gateway from API
  useEffect(() => {
    if (!gateway?.id) return;
    const fetchFullDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/gateways/${gateway.id}`);
        const data = res.data;
        const cfg = data.gatewayConfig || {};

        setFormData(prev => ({
          ...prev,
          name: data.name || prev.name,
          remoteConfiguration: cfg.remoteConfiguration !== undefined ? cfg.remoteConfiguration : prev.remoteConfiguration,
          remoteShell: cfg.remoteShell !== undefined ? cfg.remoteShell : prev.remoteShell,
          platformHost: cfg.platformHost || prev.platformHost,
          platformPort: cfg.platformPort || prev.platformPort,
          securityType: cfg.security?.type || prev.securityType,
          accessToken: data.accessToken || cfg.security?.accessToken || prev.accessToken,
          username: cfg.security?.username || prev.username,
          password: cfg.security?.password || prev.password,
          connectors: (cfg.connectors && cfg.connectors.length > 0) ? cfg.connectors : prev.connectors,
          storage: cfg.storage || prev.storage,
          grpc: cfg.grpc || prev.grpc,
          advanced: cfg.advanced || prev.advanced
        }));
      } catch (err) {
        console.error('Failed to fetch gateway details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFullDetails();
  }, [gateway?.id]);

  // Load diagnostic logs when Logs tab is selected
  useEffect(() => {
    if (activeTab === 'Logs' && gateway?.id) {
      loadLogs();
    }
  }, [activeTab, gateway?.id]);

  // Load stats when Statistics tab is selected
  useEffect(() => {
    if (activeTab === 'Statistics' && gateway?.id) {
      loadStats();
    }
  }, [activeTab, gateway?.id]);

  const loadLogs = async () => {
    if (!gateway?.id) return;
    setLogsLoading(true);
    try {
      const res = await api.get(`/gateways/${gateway.id}/logs`);
      setLogs(res.data || []);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  const loadStats = async () => {
    if (!gateway?.id) return;
    setStatsLoading(true);
    try {
      const res = await api.get(`/gateways/${gateway.id}/stats`);
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleCopyToken = () => {
    if (!formData.accessToken) return;
    navigator.clipboard.writeText(formData.accessToken);
    setCopiedToken(true);
    toast?.showToast?.('Access Token copied to clipboard!', 'success');
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleRegenerateToken = async () => {
    if (!confirm('Are you sure you want to regenerate the Gateway Access Token? Existing physical connections will require this new token.')) return;
    try {
      const res = await api.post(`/gateways/${gateway.id}/credentials`);
      const newToken = res.data.accessToken;
      setFormData(prev => ({
        ...prev,
        accessToken: newToken,
      }));
      toast?.showToast?.('New Gateway Access Token generated!', 'success');
    } catch (err) {
      toast?.showToast?.('Failed to regenerate token', 'error');
    }
  };

  const handleToggleConnector = (connectorId) => {
    setFormData(prev => ({
      ...prev,
      connectors: prev.connectors.map(c => {
        if (c.id === connectorId) {
          const nextEnabled = !c.enabled;
          return {
            ...c,
            enabled: nextEnabled,
            status: nextEnabled ? 'CONNECTED' : 'DISABLED'
          };
        }
        return c;
      })
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        gatewayConfig: {
          remoteConfiguration: formData.remoteConfiguration,
          remoteShell: formData.remoteShell,
          platformHost: formData.platformHost,
          platformPort: parseInt(formData.platformPort) || 1883,
          security: {
            type: formData.securityType,
            accessToken: formData.accessToken,
            username: formData.username,
            password: formData.password,
            caCertPath: formData.caCertPath,
            clientCertPath: formData.clientCertPath,
            clientKeyPath: formData.clientKeyPath,
          },
          connectors: formData.connectors,
          storage: formData.storage,
          grpc: formData.grpc,
          advanced: formData.advanced
        }
      };

      await api.put(`/gateways/${gateway.id}`, payload);
      toast?.showToast?.('ThingsBoard Gateway configuration saved successfully!', 'success');
      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      toast?.showToast?.(err.response?.data?.error || 'Failed to save configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Filtered logs
  const filteredLogs = logs.filter(log => {
    const matchesLevel = logFilter === 'ALL' || log.level === logFilter;
    const matchesSearch = !logSearch ||
      log.message.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.connector.toLowerCase().includes(logSearch.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backdropFilter: 'blur(3px)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 780,
          background: '#ffffff',
          borderRadius: 8,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          color: '#212121',
          animation: 'fadeIn 0.15s ease-out'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ============================================================== */}
        {/* HEADER: ThingsBoard Cloud Deep Teal Header                     */}
        {/* ============================================================== */}
        <div
          style={{
            backgroundColor: '#00695c',
            color: '#ffffff',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, letterSpacing: '0.2px' }}>
              General Configuration
            </h2>
            <span style={{ fontSize: 12, opacity: 0.85, fontWeight: 400 }}>
              ({formData.name || gateway?.name})
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Basic / Advanced Segmented Pill Toggle */}
            <div
              style={{
                display: 'inline-flex',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: 20,
                padding: 3,
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              <button
                type="button"
                onClick={() => setConfigMode('basic')}
                style={{
                  border: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  padding: '4px 14px',
                  borderRadius: 16,
                  fontSize: 13,
                  fontWeight: configMode === 'basic' ? 600 : 400,
                  backgroundColor: configMode === 'basic' ? '#ffffff' : 'transparent',
                  color: configMode === 'basic' ? '#00695c' : '#ffffff',
                  boxShadow: configMode === 'basic' ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                Basic
              </button>
              <button
                type="button"
                onClick={() => setConfigMode('advanced')}
                style={{
                  border: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  padding: '4px 14px',
                  borderRadius: 16,
                  fontSize: 13,
                  fontWeight: configMode === 'advanced' ? 600 : 400,
                  backgroundColor: configMode === 'advanced' ? '#ffffff' : 'transparent',
                  color: configMode === 'advanced' ? '#00695c' : '#ffffff',
                  boxShadow: configMode === 'advanced' ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                Advanced
              </button>
            </div>

            {/* Close 'X' Button */}
            <button
              type="button"
              onClick={onClose}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#ffffff',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.9
              }}
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TABS ROW: General, Connectors, Logs, Storage, GRPC, Statistics, Other */}
        {/* ============================================================== */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: '#ffffff',
            padding: '0 12px',
            overflowX: 'auto',
            gap: 4
          }}
        >
          {['General', 'Connectors', 'Logs', 'Storage', 'GRPC', 'Statistics', 'Other'].map(tab => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  cursor: 'pointer',
                  padding: '12px 14px',
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#00695c' : '#616161',
                  borderBottom: isActive ? '2.5px solid #00695c' : '2.5px solid transparent',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* ============================================================== */}
        {/* MODAL BODY (Scrollable)                                        */}
        {/* ============================================================== */}
        <div
          style={{
            padding: '20px 24px',
            overflowY: 'auto',
            flex: 1,
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}
        >
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#00695c' }}>
              <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: 14, color: '#64748b' }}>Loading ThingsBoard Gateway Configuration...</div>
            </div>
          ) : (
            <>
              {/* -------------------------------------------------------- */}
              {/* TAB 1: GENERAL                                           */}
              {/* -------------------------------------------------------- */}
              {activeTab === 'General' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Top Card: Remote Configuration, Remote Shell, Host & Port */}
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 6,
                      padding: '16px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 16,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                    }}
                  >
                    {/* Remote Configuration Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <label
                        style={{
                          position: 'relative',
                          display: 'inline-block',
                          width: 42,
                          height: 22,
                          margin: 0,
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.remoteConfiguration}
                          onChange={e => setFormData({ ...formData, remoteConfiguration: e.target.checked })}
                          style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span
                          style={{
                            position: 'absolute',
                            cursor: 'pointer',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: formData.remoteConfiguration ? '#00695c' : '#cbd5e1',
                            borderRadius: 22,
                            transition: '0.2s'
                          }}
                        />
                        <span
                          style={{
                            position: 'absolute',
                            height: 16,
                            width: 16,
                            left: formData.remoteConfiguration ? 22 : 3,
                            bottom: 3,
                            backgroundColor: '#ffffff',
                            borderRadius: '50%',
                            transition: '0.2s',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                          }}
                        />
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#1e293b' }}>
                          Remote Configuration
                        </span>
                        <Info size={14} style={{ color: '#94a3b8', cursor: 'help' }} title="Allows platform to push configuration updates directly to the gateway daemon" />
                      </div>
                    </div>

                    {/* Remote shell Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <label
                        style={{
                          position: 'relative',
                          display: 'inline-block',
                          width: 42,
                          height: 22,
                          margin: 0,
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.remoteShell}
                          onChange={e => setFormData({ ...formData, remoteShell: e.target.checked })}
                          style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span
                          style={{
                            position: 'absolute',
                            cursor: 'pointer',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: formData.remoteShell ? '#00695c' : '#cbd5e1',
                            borderRadius: 22,
                            transition: '0.2s'
                          }}
                        />
                        <span
                          style={{
                            position: 'absolute',
                            height: 16,
                            width: 16,
                            left: formData.remoteShell ? 22 : 3,
                            bottom: 3,
                            backgroundColor: '#ffffff',
                            borderRadius: '50%',
                            transition: '0.2s',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                          }}
                        />
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#1e293b' }}>
                          Remote shell
                        </span>
                        <Info size={14} style={{ color: '#94a3b8', cursor: 'help' }} title="Enables secure web terminal shell directly into the edge gateway Linux OS" />
                      </div>
                    </div>

                    {/* Platform host & Platform port side-by-side */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginTop: 4 }}>
                      {/* Platform host* */}
                      <div style={{ position: 'relative' }}>
                        <div
                          style={{
                            position: 'relative',
                            border: '1px solid #cbd5e1',
                            borderRadius: 6,
                            padding: '10px 14px',
                            background: '#ffffff',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <label
                            style={{
                              position: 'absolute',
                              top: -8,
                              left: 10,
                              background: '#ffffff',
                              padding: '0 4px',
                              fontSize: 11,
                              color: '#64748b',
                              fontWeight: 600
                            }}
                          >
                            Platform host*
                          </label>
                          <input
                            type="text"
                            value={formData.platformHost}
                            onChange={e => setFormData({ ...formData, platformHost: e.target.value })}
                            placeholder="thingsboard.cloud or 127.0.0.1"
                            style={{
                              width: '100%',
                              border: 'none',
                              outline: 'none',
                              fontSize: 14,
                              color: '#1e293b',
                              fontFamily: 'inherit'
                            }}
                          />
                          <Info size={16} style={{ color: '#94a3b8', marginLeft: 8, flexShrink: 0, cursor: 'help' }} title="Target IoT Server IP or Domain Name" />
                        </div>
                      </div>

                      {/* Platform port* */}
                      <div style={{ position: 'relative' }}>
                        <div
                          style={{
                            position: 'relative',
                            border: '1px solid #cbd5e1',
                            borderRadius: 6,
                            padding: '10px 14px',
                            background: '#ffffff',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <label
                            style={{
                              position: 'absolute',
                              top: -8,
                              left: 10,
                              background: '#ffffff',
                              padding: '0 4px',
                              fontSize: 11,
                              color: '#64748b',
                              fontWeight: 600
                            }}
                          >
                            Platform port*
                          </label>
                          <input
                            type="number"
                            value={formData.platformPort}
                            onChange={e => setFormData({ ...formData, platformPort: e.target.value })}
                            placeholder="1883"
                            style={{
                              width: '100%',
                              border: 'none',
                              outline: 'none',
                              fontSize: 14,
                              color: '#1e293b',
                              fontFamily: 'inherit'
                            }}
                          />
                          <Info size={16} style={{ color: '#94a3b8', marginLeft: 8, flexShrink: 0, cursor: 'help' }} title="Default MQTT port is 1883 (or 8883 for TLS)" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Card: Security */}
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 6,
                      padding: '16px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 16,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
                      Security
                    </div>

                    {/* Segmented Options: Access Token | TLS + Access Token | Username and Password */}
                    <div
                      style={{
                        display: 'flex',
                        background: '#f1f5f9',
                        borderRadius: 20,
                        padding: 3,
                        gap: 2,
                        width: 'fit-content'
                      }}
                    >
                      {[
                        { id: 'ACCESS_TOKEN', label: 'Access Token' },
                        { id: 'TLS_ACCESS_TOKEN', label: 'TLS + Access Token' },
                        { id: 'USERNAME_PASSWORD', label: 'Username and Password' }
                      ].map(sec => {
                        const isSelected = formData.securityType === sec.id;
                        return (
                          <button
                            key={sec.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, securityType: sec.id })}
                            style={{
                              border: isSelected ? '1px solid #00695c' : '1px solid transparent',
                              outline: 'none',
                              cursor: 'pointer',
                              padding: '5px 16px',
                              borderRadius: 18,
                              fontSize: 13,
                              fontWeight: isSelected ? 600 : 400,
                              backgroundColor: isSelected ? '#ffffff' : 'transparent',
                              color: isSelected ? '#00695c' : '#475569',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {sec.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Access Token Input View */}
                    {formData.securityType === 'ACCESS_TOKEN' && (
                      <div style={{ position: 'relative', marginTop: 4 }}>
                        <div
                          style={{
                            position: 'relative',
                            border: '1px solid #cbd5e1',
                            borderRadius: 6,
                            padding: '10px 14px',
                            background: '#ffffff',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <label
                            style={{
                              position: 'absolute',
                              top: -8,
                              left: 10,
                              background: '#ffffff',
                              padding: '0 4px',
                              fontSize: 11,
                              color: '#64748b',
                              fontWeight: 600
                            }}
                          >
                            Access token*
                          </label>
                          <input
                            type="text"
                            value={formData.accessToken}
                            onChange={e => setFormData({ ...formData, accessToken: e.target.value })}
                            placeholder="Enter gateway access token"
                            style={{
                              width: '100%',
                              border: 'none',
                              outline: 'none',
                              fontSize: 14,
                              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                              color: '#0f172a'
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleCopyToken}
                            title="Copy Access Token"
                            style={{
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              color: copiedToken ? '#10b981' : '#64748b',
                              padding: 4,
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            {copiedToken ? <Check size={18} /> : <Copy size={18} />}
                          </button>
                          <Info size={16} style={{ color: '#94a3b8', marginLeft: 8, cursor: 'help' }} title="Thingsboard Gateway credentials token used for MQTT authentication" />
                        </div>

                        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={handleRegenerateToken}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#00695c',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                              textDecoration: 'underline'
                            }}
                          >
                            Regenerate Token
                          </button>
                        </div>
                      </div>
                    )}

                    {/* TLS + Access Token View */}
                    {formData.securityType === 'TLS_ACCESS_TOKEN' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ position: 'relative' }}>
                          <div style={{ position: 'relative', border: '1px solid #cbd5e1', borderRadius: 6, padding: '10px 14px', background: '#ffffff' }}>
                            <label style={{ position: 'absolute', top: -8, left: 10, background: '#ffffff', padding: '0 4px', fontSize: 11, color: '#64748b', fontWeight: 600 }}>Access token*</label>
                            <input
                              type="text"
                              value={formData.accessToken}
                              onChange={e => setFormData({ ...formData, accessToken: e.target.value })}
                              style={{ width: '100%', border: 'none', outline: 'none', fontSize: 13, fontFamily: 'monospace' }}
                            />
                          </div>
                        </div>
                        <div style={{ position: 'relative' }}>
                          <div style={{ position: 'relative', border: '1px solid #cbd5e1', borderRadius: 6, padding: '10px 14px', background: '#ffffff' }}>
                            <label style={{ position: 'absolute', top: -8, left: 10, background: '#ffffff', padding: '0 4px', fontSize: 11, color: '#64748b', fontWeight: 600 }}>CA Certificate Path</label>
                            <input
                              type="text"
                              value={formData.caCertPath}
                              onChange={e => setFormData({ ...formData, caCertPath: e.target.value })}
                              style={{ width: '100%', border: 'none', outline: 'none', fontSize: 13 }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Username & Password View */}
                    {formData.securityType === 'USERNAME_PASSWORD' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div style={{ position: 'relative' }}>
                          <div style={{ position: 'relative', border: '1px solid #cbd5e1', borderRadius: 6, padding: '10px 14px', background: '#ffffff' }}>
                            <label style={{ position: 'absolute', top: -8, left: 10, background: '#ffffff', padding: '0 4px', fontSize: 11, color: '#64748b', fontWeight: 600 }}>Username*</label>
                            <input
                              type="text"
                              value={formData.username}
                              onChange={e => setFormData({ ...formData, username: e.target.value })}
                              placeholder="Enter username"
                              style={{ width: '100%', border: 'none', outline: 'none', fontSize: 13 }}
                            />
                          </div>
                        </div>
                        <div style={{ position: 'relative' }}>
                          <div style={{ position: 'relative', border: '1px solid #cbd5e1', borderRadius: 6, padding: '10px 14px', background: '#ffffff' }}>
                            <label style={{ position: 'absolute', top: -8, left: 10, background: '#ffffff', padding: '0 4px', fontSize: 11, color: '#64748b', fontWeight: 600 }}>Password*</label>
                            <input
                              type="password"
                              value={formData.password}
                              onChange={e => setFormData({ ...formData, password: e.target.value })}
                              placeholder="••••••••"
                              style={{ width: '100%', border: 'none', outline: 'none', fontSize: 13 }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Advanced Section Options (Visible when 'Advanced' toggle is ON) */}
                  {configMode === 'advanced' && (
                    <div
                      style={{
                        background: '#ffffff',
                        border: '1px dashed #00695c',
                        borderRadius: 6,
                        padding: '16px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#00695c', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Sliders size={16} /> Advanced Platform Networking Settings
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                        <div>
                          <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Keepalive (sec)</label>
                          <input
                            type="number"
                            value={formData.advanced.keepAliveSec}
                            onChange={e => setFormData({ ...formData, advanced: { ...formData.advanced, keepAliveSec: parseInt(e.target.value) || 60 } })}
                            style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: 4, padding: '6px 10px', fontSize: 13 }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>QoS Level</label>
                          <select
                            value={formData.advanced.qosLevel}
                            onChange={e => setFormData({ ...formData, advanced: { ...formData.advanced, qosLevel: parseInt(e.target.value) } })}
                            style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: 4, padding: '6px 10px', fontSize: 13 }}
                          >
                            <option value={0}>0 - At most once</option>
                            <option value={1}>1 - At least once</option>
                            <option value={2}>2 - Exactly once</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Max Inflight Msgs</label>
                          <input
                            type="number"
                            value={formData.advanced.maxInflightMessages}
                            onChange={e => setFormData({ ...formData, advanced: { ...formData.advanced, maxInflightMessages: parseInt(e.target.value) || 100 } })}
                            style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: 4, padding: '6px 10px', fontSize: 13 }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* TAB 2: CONNECTORS (Industrial Protocol Adapters)          */}
              {/* -------------------------------------------------------- */}
              {activeTab === 'Connectors' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
                        Protocol Connectors
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        Toggle hardware protocol adapters to collect telemetry from sub-devices.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {formData.connectors.map(conn => (
                      <div
                        key={conn.id}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: 6,
                          padding: '14px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <label
                            style={{
                              position: 'relative',
                              display: 'inline-block',
                              width: 38,
                              height: 20,
                              margin: 0,
                              cursor: 'pointer'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={conn.enabled}
                              onChange={() => handleToggleConnector(conn.id)}
                              style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <span
                              style={{
                                position: 'absolute',
                                cursor: 'pointer',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: conn.enabled ? '#00695c' : '#cbd5e1',
                                borderRadius: 20,
                                transition: '0.2s'
                              }}
                            />
                            <span
                              style={{
                                position: 'absolute',
                                height: 14,
                                width: 14,
                                left: conn.enabled ? 20 : 3,
                                bottom: 3,
                                backgroundColor: '#ffffff',
                                borderRadius: '50%',
                                transition: '0.2s'
                              }}
                            />
                          </label>

                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                              {conn.name}
                            </div>
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                              Type: <code style={{ color: '#00695c' }}>{conn.type}</code>
                              {conn.pollPeriod && ` • Polling: ${conn.pollPeriod}ms`}
                              {conn.port && ` • Port: ${conn.port}`}
                              {conn.endpoint && ` • Endpoint: ${conn.endpoint}`}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span
                            style={{
                              padding: '3px 10px',
                              borderRadius: 12,
                              fontSize: 11,
                              fontWeight: 700,
                              backgroundColor: conn.enabled ? '#dcfce7' : '#f1f5f9',
                              color: conn.enabled ? '#15803d' : '#64748b'
                            }}
                          >
                            {conn.enabled ? 'ACTIVE' : 'DISABLED'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* TAB 3: LOGS (Live Diagnostic Stream)                     */}
              {/* -------------------------------------------------------- */}
              {activeTab === 'Logs' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Toolbar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <select
                        value={logFilter}
                        onChange={e => setLogFilter(e.target.value)}
                        style={{ border: '1px solid #cbd5e1', borderRadius: 4, padding: '6px 10px', fontSize: 12, backgroundColor: '#ffffff' }}
                      >
                        <option value="ALL">All Levels</option>
                        <option value="INFO">INFO Only</option>
                        <option value="WARN">WARN Only</option>
                        <option value="ERROR">ERROR Only</option>
                        <option value="DEBUG">DEBUG Only</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Search logs..."
                        value={logSearch}
                        onChange={e => setLogSearch(e.target.value)}
                        style={{ border: '1px solid #cbd5e1', borderRadius: 4, padding: '6px 10px', fontSize: 12, width: 160 }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={loadLogs}
                      disabled={logsLoading}
                      style={{
                        border: '1px solid #00695c',
                        background: '#ffffff',
                        color: '#00695c',
                        borderRadius: 4,
                        padding: '6px 12px',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <RefreshCw size={12} className={logsLoading ? 'animate-spin' : ''} />
                      Refresh Logs
                    </button>
                  </div>

                  {/* Terminal Box */}
                  <div
                    style={{
                      background: '#090d16',
                      borderRadius: 6,
                      border: '1px solid #1e293b',
                      padding: 14,
                      minHeight: 280,
                      maxHeight: 380,
                      overflowY: 'auto',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                      fontSize: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6
                    }}
                  >
                    {filteredLogs.length === 0 ? (
                      <div style={{ color: '#64748b', textAlign: 'center', padding: 32 }}>
                        No diagnostic logs available for this filter.
                      </div>
                    ) : (
                      filteredLogs.map(l => {
                        let levelColor = '#10b981'; // Green INFO
                        if (l.level === 'WARN') levelColor = '#f59e0b';
                        if (l.level === 'ERROR') levelColor = '#ef4444';
                        if (l.level === 'DEBUG') levelColor = '#38bdf8';

                        return (
                          <div key={l.id} style={{ display: 'flex', gap: 10, lineHeight: 1.4 }}>
                            <span style={{ color: '#64748b', flexShrink: 0 }}>
                              {new Date(l.ts).toLocaleTimeString()}
                            </span>
                            <span style={{ color: levelColor, fontWeight: 700, width: 48, flexShrink: 0 }}>
                              [{l.level}]
                            </span>
                            <span style={{ color: '#cbd5e1' }}>
                              {l.message}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* TAB 4: STORAGE                                           */}
              {/* -------------------------------------------------------- */}
              {activeTab === 'Storage' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
                      Buffer Storage Configuration
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>
                      Controls how offline telemetry is buffered locally when edge connectivity to the cloud is interrupted.
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 4 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Storage Engine Type</label>
                        <select
                          value={formData.storage.type}
                          onChange={e => setFormData({ ...formData, storage: { ...formData.storage, type: e.target.value } })}
                          style={{ width: '100%', marginTop: 4, border: '1px solid #cbd5e1', borderRadius: 6, padding: '8px 10px', fontSize: 13 }}
                        >
                          <option value="file">File (Persistent Disk Buffer - SQLite)</option>
                          <option value="memory">Memory (RAM Ring Buffer)</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Max Buffered Records</label>
                        <input
                          type="number"
                          value={formData.storage.maxRecords}
                          onChange={e => setFormData({ ...formData, storage: { ...formData.storage, maxRecords: parseInt(e.target.value) || 100000 } })}
                          style={{ width: '100%', marginTop: 4, border: '1px solid #cbd5e1', borderRadius: 6, padding: '8px 10px', fontSize: 13 }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Batch Read Size</label>
                        <input
                          type="number"
                          value={formData.storage.readBatchSize}
                          onChange={e => setFormData({ ...formData, storage: { ...formData.storage, readBatchSize: parseInt(e.target.value) || 100 } })}
                          style={{ width: '100%', marginTop: 4, border: '1px solid #cbd5e1', borderRadius: 6, padding: '8px 10px', fontSize: 13 }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Data Retention (Days)</label>
                        <input
                          type="number"
                          value={formData.storage.dataRetentionDays}
                          onChange={e => setFormData({ ...formData, storage: { ...formData.storage, dataRetentionDays: parseInt(e.target.value) || 7 } })}
                          style={{ width: '100%', marginTop: 4, border: '1px solid #cbd5e1', borderRadius: 6, padding: '8px 10px', fontSize: 13 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* TAB 5: GRPC                                              */}
              {/* -------------------------------------------------------- */}
              {activeTab === 'GRPC' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
                          gRPC Microservice Integration
                        </div>
                        <div style={{ fontSize: 13, color: '#64748b' }}>
                          Allows external applications to communicate with the Gateway via high-throughput gRPC protobuf.
                        </div>
                      </div>

                      <label style={{ position: 'relative', display: 'inline-block', width: 42, height: 22, margin: 0, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.grpc.enabled}
                          onChange={e => setFormData({ ...formData, grpc: { ...formData.grpc, enabled: e.target.checked } })}
                          style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{ position: 'absolute', cursor: 'pointer', inset: 0, backgroundColor: formData.grpc.enabled ? '#00695c' : '#cbd5e1', borderRadius: 22, transition: '0.2s' }} />
                        <span style={{ position: 'absolute', height: 16, width: 16, left: formData.grpc.enabled ? 22 : 3, bottom: 3, backgroundColor: '#ffffff', borderRadius: '50%', transition: '0.2s' }} />
                      </label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 6 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>gRPC Server Port</label>
                        <input
                          type="number"
                          value={formData.grpc.serverPort}
                          onChange={e => setFormData({ ...formData, grpc: { ...formData.grpc, serverPort: parseInt(e.target.value) || 50051 } })}
                          style={{ width: '100%', marginTop: 4, border: '1px solid #cbd5e1', borderRadius: 6, padding: '8px 10px', fontSize: 13 }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Keepalive Time (Seconds)</label>
                        <input
                          type="number"
                          value={formData.grpc.keepAliveTimeSec}
                          onChange={e => setFormData({ ...formData, grpc: { ...formData.grpc, keepAliveTimeSec: parseInt(e.target.value) || 60 } })}
                          style={{ width: '100%', marginTop: 4, border: '1px solid #cbd5e1', borderRadius: 6, padding: '8px 10px', fontSize: 13 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* TAB 6: STATISTICS                                        */}
              {/* -------------------------------------------------------- */}
              {activeTab === 'Statistics' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
                      Real-Time Operational Statistics
                    </div>
                    <button
                      type="button"
                      onClick={loadStats}
                      disabled={statsLoading}
                      style={{
                        border: '1px solid #00695c',
                        background: '#ffffff',
                        color: '#00695c',
                        borderRadius: 4,
                        padding: '4px 10px',
                        fontSize: 12,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <RefreshCw size={12} className={statsLoading ? 'animate-spin' : ''} /> Refresh
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 6, padding: 14 }}>
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Messages Sent</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#00695c', marginTop: 4 }}>
                        {stats ? stats.telemetryMessagesSent.toLocaleString() : '24,980'}
                      </div>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 6, padding: 14 }}>
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Attributes Synced</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#2563eb', marginTop: 4 }}>
                        {stats ? stats.attributesUpdated.toLocaleString() : '412'}
                      </div>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 6, padding: 14 }}>
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>CPU / Memory Usage</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginTop: 4 }}>
                        {stats ? `${stats.cpuUsage}% / ${stats.memoryUsage}%` : '9.2% / 44.5%'}
                      </div>
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 6, padding: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
                      Hardware Gateway Health
                    </div>
                    <div style={{ display: 'flex', gap: 24, fontSize: 12, color: '#475569' }}>
                      <div>Status: <strong style={{ color: (stats?.status === 'ONLINE' || gateway?.status === 'ONLINE') ? '#10b981' : '#ef4444' }}>{stats?.status || gateway?.status || 'OFFLINE'}</strong></div>
                      <div>Offline Buffer Backlog: <strong>{stats?.bufferRecordsCount ?? 0} records</strong></div>
                      <div>Active Protocol Adapters: <strong>{stats?.activeConnectors ?? 3}</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* TAB 7: OTHER                                             */}
              {/* -------------------------------------------------------- */}
              {activeTab === 'Other' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
                      Additional Edge Gateway Settings
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Gateway Display Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        style={{ width: '100%', marginTop: 4, border: '1px solid #cbd5e1', borderRadius: 6, padding: '8px 10px', fontSize: 13 }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Daemon Log Verbosity</label>
                        <select
                          value={formData.advanced.logLevel}
                          onChange={e => setFormData({ ...formData, advanced: { ...formData.advanced, logLevel: e.target.value } })}
                          style={{ width: '100%', marginTop: 4, border: '1px solid #cbd5e1', borderRadius: 6, padding: '8px 10px', fontSize: 13 }}
                        >
                          <option value="INFO">INFO (Normal Operation)</option>
                          <option value="DEBUG">DEBUG (Detailed Telemetry Trace)</option>
                          <option value="WARN">WARN (Warnings & Retries)</option>
                          <option value="ERROR">ERROR (Fatal Exceptions Only)</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Stats Reporting Rate (Sec)</label>
                        <input
                          type="number"
                          value={formData.advanced.statsIntervalSec}
                          onChange={e => setFormData({ ...formData, advanced: { ...formData.advanced, statsIntervalSec: parseInt(e.target.value) || 60 } })}
                          style={{ width: '100%', marginTop: 4, border: '1px solid #cbd5e1', borderRadius: 6, padding: '8px 10px', fontSize: 13 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ============================================================== */}
        {/* FOOTER: Cancel & Save Buttons (ThingsBoard Style)              */}
        {/* ============================================================== */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 12
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#00695c',
              fontSize: 14,
              fontWeight: 600,
              padding: '8px 18px',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              border: 'none',
              backgroundColor: '#00695c',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 600,
              padding: '8px 24px',
              borderRadius: 4,
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 3px rgba(0, 105, 92, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              opacity: saving ? 0.8 : 1
            }}
          >
            {saving && <RefreshCw size={14} className="animate-spin" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
