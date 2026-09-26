import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
  Cpu, Plus, Search, RefreshCw, Trash2, Key, UserCheck, Zap, Download,
  Upload, CheckSquare, Square, Eye, FileJson, ShieldAlert
} from 'lucide-react';
import { useWebSocket } from '../../context/WebSocketContext';
import DeviceCredentialsModal from '../../components/Modals/DeviceCredentialsModal';
import ImportDevicesModal from '../../components/Modals/ImportDevicesModal';
import AddDeviceModal from '../../components/Modals/AddDeviceModal';

export default function DeviceList() {
  const { subscribe } = useWebSocket();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  // Real-time device activity update via WebSocket
  useEffect(() => {
    if (!subscribe) return;
    const unsub = subscribe('__global__', (event) => {
      if (event.type === 'TELEMETRY_UPDATE' && event.entityId) {
        setDevices(prev => prev.map(d => {
          if (d.id === event.entityId) {
            return { ...d, isActive: true, lastActivityTime: new Date().toISOString() };
          }
          return d;
        }));
      }
    });
    return () => unsub && unsub();
  }, [subscribe]);
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedCredDevice, setSelectedCredDevice] = useState(null);
  const [simulatingDevice, setSimulatingDevice] = useState(null);
  const [simTelemetry, setSimTelemetry] = useState('{"temperature": 26.5, "humidity": 58.2}');
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);
  const [form, setForm] = useState({ name: '', type: 'default', label: '' });
  const [profiles, setProfiles] = useState([]);
  const navigate = useNavigate();
  const pageSize = 15;

  const fetchDevices = () => {
    setLoading(true);
    api.get('/devices', { params: { page, pageSize, search } })
      .then(res => {
        setDevices(res.data.data);
        setTotal(res.data.totalElements);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 2000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { fetchDevices(); }, [page, search]);
  useEffect(() => {
    api.get('/devices/profiles').then(res => setProfiles(res.data.data)).catch(() => {});
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/devices', form);
      setShowAddModal(false);
      setForm({ name: '', type: 'default', label: '' });
      fetchDevices();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create device');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete device "${name}"?`)) return;
    try {
      await api.delete(`/devices/${id}`);
      fetchDevices();
    } catch {
      alert('Failed to delete device');
    }
  };

  const handleExportJson = (device, e) => {
    e.stopPropagation();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(device, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `device_${device.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePushSimulatedTelemetry = async (e) => {
    e.preventDefault();
    if (!simulatingDevice) return;
    try {
      const payload = JSON.parse(simTelemetry);
      await api.post(`/telemetry/v1/${simulatingDevice.accessToken || 'token'}/telemetry`, payload);
      alert('Telemetry sent successfully!');
      setSimulatingDevice(null);
      fetchDevices();
    } catch {
      alert('Failed to push telemetry. Ensure JSON is valid.');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === devices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(devices.map(d => d.id));
    }
  };

  const toggleSelectDevice = (id, e) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.length} selected devices?`)) return;
    for (const id of selectedIds) {
      try { await api.delete(`/devices/${id}`); } catch {}
    }
    setSelectedIds([]);
    fetchDevices();
  };

  const formatTime = (ts) => {
    if (!ts) return 'Never';
    const d = new Date(ts);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="animate-fadeIn">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Devices Management</h1>
          <p className="page-subtitle">{total} registered IoT devices</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={fetchDevices}><RefreshCw size={14} /> Refresh</button>
          <button className="btn btn-outline" onClick={() => setShowImportModal(true)}>
            <Upload size={14} /> Import CSV
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)} id="add-device-btn">
            <Plus size={16} /> Add Device
          </button>
        </div>
      </div>

      <div className="data-table-container">
        {/* Table Toolbar */}
        <div className="data-table-toolbar" style={{ justifyContent: 'space-between' }}>
          <div className="data-table-toolbar-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="search-input-wrapper">
              <Search size={14} className="search-input-icon" />
              <input
                className="search-input"
                placeholder="Search devices by name or type..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              />
            </div>

            {selectedIds.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '12px', borderLeft: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-primary)' }}>
                  {selectedIds.length} Selected
                </span>
                <button className="btn btn-danger btn-sm" onClick={handleBulkDelete}>
                  <Trash2 size={13} /> Bulk Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Data Table */}
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={toggleSelectAll}>
                  {selectedIds.length > 0 && selectedIds.length === devices.length ? (
                    <CheckSquare size={16} color="var(--color-primary)" />
                  ) : (
                    <Square size={16} />
                  )}
                </button>
              </th>
              <th>Name</th>
              <th>Type</th>
              <th>Label</th>
              <th>Profile</th>
              <th>Status</th>
              <th>Last Activity</th>
              <th style={{ textAlign: 'right', width: 140, paddingRight: 16 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j}><div className="skeleton" style={{ height: 16, width: '70%' }} /></td>
                  ))}
                </tr>
              ))
            ) : devices.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="empty-state">
                    <div className="empty-state-icon"><Cpu size={48} /></div>
                    <div className="empty-state-title">No devices found</div>
                    <div className="empty-state-desc">Create your first device or import from CSV to get started</div>
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                      <Plus size={16} /> Add Device
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              devices.map((device) => {
                const isSelected = selectedIds.includes(device.id);
                const isOnline = device.lastActivityTime && (Date.now() - new Date(device.lastActivityTime).getTime() < 6000);
                return (
                  <tr
                    key={device.id}
                    onClick={() => navigate(`/devices/${device.id}`)}
                    style={{ background: isSelected ? 'rgba(16, 96, 255, 0.05)' : undefined }}
                  >
                    <td onClick={(e) => toggleSelectDevice(device.id, e)}>
                      {isSelected ? <CheckSquare size={16} color="var(--color-primary)" /> : <Square size={16} />}
                    </td>
                    <td style={{ fontWeight: 600 }}>{device.name}</td>
                    <td><span className="badge badge-info">{device.type}</span></td>
                    <td style={{ color: 'var(--color-text-secondary)' }}>{device.label || '—'}</td>
                    <td style={{ color: 'var(--color-text-secondary)' }}>{device.DeviceProfile?.name || 'Default'}</td>
                    <td>
                      <span className={`badge ${isOnline ? 'badge-active' : 'badge-inactive'}`}>
                        <span className="badge-dot" />
                        {isOnline ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                      {formatTime(device.lastActivityTime)}
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: 16 }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => setSelectedCredDevice(device)}
                          title="Manage Credentials"
                        >
                          <Key size={14} style={{ color: 'var(--color-primary)' }} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => setSimulatingDevice(device)}
                          title="Push Simulated Telemetry"
                        >
                          <Zap size={14} style={{ color: '#f59e0b' }} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={(e) => handleExportJson(device, e)}
                          title="Export JSON"
                        >
                          <FileJson size={14} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => handleDelete(device.id, device.name)}
                          title="Delete Device"
                        >
                          <Trash2 size={14} style={{ color: 'var(--color-danger)' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {total > pageSize && (
          <div className="data-table-pagination">
            <span>Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, total)} of {total}</span>
            <div className="data-table-pagination-controls">
              <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button>
              <button className="btn btn-ghost btn-sm" disabled={(page + 1) * pageSize >= total} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Add Device */}
      {showAddModal && (
        <AddDeviceModal
          onClose={() => setShowAddModal(false)}
          onDeviceCreated={() => fetchDevices()}
          profiles={profiles}
        />
      )}

      {/* MODAL: Manage Credentials */}
      {selectedCredDevice && (
        <DeviceCredentialsModal
          device={selectedCredDevice}
          onClose={() => setSelectedCredDevice(null)}
          onSave={() => fetchDevices()}
        />
      )}

      {/* MODAL: CSV Import */}
      {showImportModal && (
        <ImportDevicesModal
          onClose={() => setShowImportModal(false)}
          onImportSuccess={() => fetchDevices()}
        />
      )}

      {/* MODAL: Push Simulated Telemetry */}
      {simulatingDevice && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <span className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} style={{ color: '#f59e0b' }} />
                Push Telemetry — {simulatingDevice.name}
              </span>
              <button className="modal-close" onClick={() => setSimulatingDevice(null)}>×</button>
            </div>
            <form onSubmit={handlePushSimulatedTelemetry}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Telemetry JSON Payload</label>
                  <textarea
                    className="form-input"
                    rows={5}
                    style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)' }}
                    value={simTelemetry}
                    onChange={(e) => setSimTelemetry(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setSimulatingDevice(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Push Telemetry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
