import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { AlertTriangle, Check, X, RefreshCw, Filter, Plus } from 'lucide-react';
import { useAuthModal } from '../../components/Common/AuthModal';

const severityColors = {
  CRITICAL: 'badge-critical',
  MAJOR: 'badge-major',
  MINOR: 'badge-minor',
  WARNING: 'badge-warning',
  INDETERMINATE: 'badge-inactive',
};

export default function AlarmList() {
  const { requireAuth } = useAuthModal();
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [severity, setSeverity] = useState('');
  const [status, setStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [devices, setDevices] = useState([]);
  const [form, setForm] = useState({ type: 'High Temperature Alarm', severity: 'CRITICAL', deviceId: '', message: 'Temperature threshold exceeded' });

  const fetchAlarms = () => {
    setLoading(true);
    api.get('/alarms', { params: { page, pageSize: 20, severity: severity || undefined, status: status || undefined } })
      .then(res => { setAlarms(res.data.data); setTotal(res.data.totalElements); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlarms();
    api.get('/devices').then(r => setDevices(r.data.data || [])).catch(() => {});
  }, [page, severity, status]);

  const handleAck = async (id) => {
    await api.put(`/alarms/${id}/ack`);
    fetchAlarms();
  };

  const handleClear = async (id) => {
    await api.put(`/alarms/${id}/clear`);
    fetchAlarms();
  };

  const handleCreateAlarm = (e) => {
    e.preventDefault();
    requireAuth(async () => {
      const targetId = form.deviceId || (devices[0]?.id || null);
      await api.post('/alarms', {
        originatorType: 'DEVICE',
        originatorId: targetId,
        type: form.type,
        severity: form.severity,
        detail: { message: form.message },
      });
      setShowModal(false);
      setForm({ type: 'High Temperature Alarm', severity: 'CRITICAL', deviceId: '', message: 'Temperature threshold exceeded' });
      fetchAlarms();
    }, 'create an Alarm');
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Alarms</h1>
          <p className="page-subtitle">{total} alarms total</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={fetchAlarms}><RefreshCw size={14} /> Refresh</button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Create Alarm</button>
        </div>
      </div>

      <div className="data-table-container">
        <div className="data-table-toolbar">
          <div className="data-table-toolbar-left">
            <Filter size={14} style={{ color: 'var(--color-text-tertiary)' }} />
            <select className="form-select" style={{ width: 140, padding: '6px 32px 6px 10px' }} value={severity} onChange={(e) => { setSeverity(e.target.value); setPage(0); }}>
              <option value="">All Severity</option>
              <option value="CRITICAL">Critical</option>
              <option value="MAJOR">Major</option>
              <option value="MINOR">Minor</option>
              <option value="WARNING">Warning</option>
            </select>
            <select className="form-select" style={{ width: 150, padding: '6px 32px 6px 10px' }} value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
              <option value="">All Status</option>
              <option value="ACTIVE_UNACK">Active Unack</option>
              <option value="ACTIVE_ACK">Active Ack</option>
              <option value="CLEARED_UNACK">Cleared Unack</option>
              <option value="CLEARED_ACK">Cleared Ack</option>
            </select>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Severity</th>
              <th>Type</th>
              <th>Originator</th>
              <th>Status</th>
              <th>Started</th>
              <th>Details</th>
              <th style={{ width: 100 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 16, width: '60%' }} /></td>)}</tr>
              ))
            ) : alarms.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="empty-state">
                    <div className="empty-state-icon"><AlertTriangle size={48} /></div>
                    <div className="empty-state-title">No alarms found</div>
                    <div className="empty-state-desc">All systems operating normally</div>
                  </div>
                </td>
              </tr>
            ) : (
              alarms.map(a => (
                <tr key={a.id}>
                  <td><span className={`badge ${severityColors[a.severity]}`}>{a.severity}</span></td>
                  <td style={{ fontWeight: 500 }}>{a.type}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{a.originatorName || 'Device'}</td>
                  <td>
                    <span className={`badge ${a.status.includes('ACTIVE') ? 'badge-danger' : 'badge-success'}`}>
                      {a.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>
                    {new Date(a.startTs).toLocaleString()}
                  </td>
                  <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {a.detail?.message || '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {a.status.includes('UNACK') && (
                        <button className="btn btn-ghost btn-sm" onClick={() => handleAck(a.id)} title="Acknowledge">
                          <Check size={14} />
                        </button>
                      )}
                      {a.status.includes('ACTIVE') && (
                        <button className="btn btn-ghost btn-sm" onClick={() => handleClear(a.id)} title="Clear">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {total > 20 && (
          <div className="data-table-pagination">
            <span>{total} total alarms</span>
            <div className="data-table-pagination-controls">
              <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
              <button className="btn btn-ghost btn-sm" disabled={(page + 1) * 20 >= total} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create Test Alarm</h2>
              <button type="button" className="modal-close" onClick={() => setShowModal(false)} aria-label="Close modal">✕</button>

            </div>
            <form onSubmit={handleCreateAlarm}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Alarm Type *</label>
                  <input className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} required autoFocus />
                </div>
                <div className="form-group">
                  <label className="form-label">Severity</label>
                  <select className="form-select" value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}>
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="MAJOR">MAJOR</option>
                    <option value="MINOR">MINOR</option>
                    <option value="WARNING">WARNING</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Target Device</label>
                  <select className="form-select" value={form.deviceId} onChange={e => setForm({ ...form, deviceId: e.target.value })}>
                    {devices.map(d => <option key={d.id} value={d.id}>{d.name} ({d.type})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Detail Message</label>
                  <input className="form-input" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Alarm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
