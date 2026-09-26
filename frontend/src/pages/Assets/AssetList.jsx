import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Building2, Plus, Trash2, Search } from 'lucide-react';

export default function AssetList() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'building', label: '' });

  const fetch = () => {
    setLoading(true);
    api.get('/assets', { params: { search } }).then(r => setAssets(r.data.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/assets', form);
    setShowModal(false);
    setForm({ name: '', type: 'building', label: '' });
    fetch();
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div><h1 className="page-title">Assets</h1><p className="page-subtitle">{assets.length} assets</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Asset</button>
      </div>
      <div className="data-table-container">
        <div className="data-table-toolbar">
          <div className="search-input-wrapper">
            <Search size={14} className="search-input-icon" />
            <input className="search-input" placeholder="Search assets..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <table className="data-table">
          <thead><tr><th>Name</th><th>Type</th><th>Label</th><th>Customer</th><th>Created</th><th style={{ width: 50 }}></th></tr></thead>
          <tbody>
            {loading ? Array.from({ length: 3 }).map((_, i) => <tr key={i}>{Array.from({ length: 6 }).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 16, width: '60%' }} /></td>)}</tr>) :
            assets.length === 0 ? <tr><td colSpan={6}><div className="empty-state"><Building2 size={48} className="empty-state-icon" /><div className="empty-state-title">No assets</div><div className="empty-state-desc">Create assets to organize your IoT infrastructure</div></div></td></tr> :
            assets.map(a => (
              <tr key={a.id}>
                <td style={{ fontWeight: 500 }}>{a.name}</td>
                <td><span className="badge badge-info">{a.type}</span></td>
                <td style={{ color: 'var(--color-text-secondary)' }}>{a.label || '—'}</td>
                <td style={{ color: 'var(--color-text-secondary)' }}>{a.Customer?.name || 'Unassigned'}</td>
                <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                <td><button className="btn btn-ghost btn-sm" onClick={async () => { if (confirm('Delete?')) { await api.delete(`/assets/${a.id}`); fetch(); } }}><Trash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2 className="modal-title">Add Asset</h2><button type="button" className="modal-close" onClick={() => setShowModal(false)} aria-label="Close modal">✕</button></div>

            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required autoFocus /></div>
                <div className="form-group"><label className="form-label">Type</label><input className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Label</label><input className="form-input" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} /></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
