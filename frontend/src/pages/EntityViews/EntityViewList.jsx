import { useState, useEffect } from 'react';
import { Eye, Plus, Trash2, Search, Building2, MonitorSmartphone } from 'lucide-react';
import api from '../../api/axios';
import { useAuthModal } from '../../components/Common/AuthModal';

export default function EntityViewList() {
  const { requireAuth } = useAuthModal();
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [devices, setDevices] = useState([]);
  const [form, setForm] = useState({ name: '', type: 'default', entityType: 'DEVICE', entityId: '', keys: 'temperature, humidity' });

  const fetchViews = () => {
    setLoading(true);
    api.get('/entity-views', { params: { search } })
      .then(r => setViews(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchViews();
    api.get('/devices').then(r => setDevices(r.data.data || [])).catch(() => {});
  }, [search]);

  const handleCreate = (e) => {
    e.preventDefault();
    requireAuth(async () => {
      const keysArray = form.keys.split(',').map(k => k.trim()).filter(Boolean);
      await api.post('/entity-views', {
        name: form.name,
        type: form.type,
        entityType: form.entityType,
        entityId: form.entityId || (devices[0]?.id || null),
        keys: keysArray,
      });
      setShowModal(false);
      setForm({ name: '', type: 'default', entityType: 'DEVICE', entityId: '', keys: 'temperature, humidity' });
      fetchViews();
    }, 'create an Entity View');
  };

  const handleDelete = (id) => {
    requireAuth(async () => {
      if (confirm('Delete entity view?')) {
        await api.delete(`/entity-views/${id}`);
        fetchViews();
      }
    }, 'delete this entity view');
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Entity Views</h1>
          <p className="page-subtitle">Read-only views with restricted attribute and telemetry key visibility</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Create Entity View</button>
      </div>

      <div className="data-table-container">
        <div className="data-table-toolbar">
          <div className="search-input-wrapper">
            <Search size={14} className="search-input-icon" />
            <input className="search-input" placeholder="Search entity views..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Type</th><th>Entity Type</th><th>Exposed Keys</th><th>Customer</th><th>Created</th><th style={{ width: 60 }}></th></tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <tr key={i}><td colSpan={7}><div className="skeleton" style={{ height: 20 }} /></td></tr>)
            ) : views.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="empty-state">
                    <Eye size={48} className="empty-state-icon" />
                    <div className="empty-state-title">No entity views configured</div>
                    <div className="empty-state-desc">Create entity views to limit device attribute access for specific users</div>
                  </div>
                </td>
              </tr>
            ) : (
              views.map(v => (
                <tr key={v.id}>
                  <td style={{ fontWeight: 500 }}>{v.name}</td>
                  <td><span className="badge badge-info">{v.type}</span></td>
                  <td>
                    <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <MonitorSmartphone size={12} /> {v.entityType}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-primary-light)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }}>
                    {Array.isArray(v.keys) ? v.keys.join(', ') : 'All Keys'}
                  </td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{v.Customer?.name || 'Unassigned'}</td>
                  <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>{new Date(v.createdAt).toLocaleDateString()}</td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => handleDelete(v.id)}><Trash2 size={14} /></button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create Entity View</h2>
              <button type="button" className="modal-close" onClick={() => setShowModal(false)} aria-label="Close modal">✕</button>

            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">View Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required autoFocus placeholder="e.g. Temperature Only View" />
                </div>
                <div className="form-group">
                  <label className="form-label">Target Device</label>
                  <select className="form-select" value={form.entityId} onChange={e => setForm({ ...form, entityId: e.target.value })}>
                    {devices.map(d => <option key={d.id} value={d.id}>{d.name} ({d.type})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Allowed Telemetry Keys (Comma Separated)</label>
                  <input className="form-input" value={form.keys} onChange={e => setForm({ ...form, keys: e.target.value })} placeholder="temperature, humidity, voltage" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create View</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
