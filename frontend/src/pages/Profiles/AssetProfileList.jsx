import { useState } from 'react';
import { Building2, Plus, Trash2, Search } from 'lucide-react';
import { useAuthModal } from '../../components/Common/AuthModal';

export default function AssetProfileList() {
  const { requireAuth } = useAuthModal();
  const [profiles, setProfiles] = useState([
    { id: 'ap-1', name: 'Building Asset Profile', type: 'BUILDING', ruleChain: 'Root Rule Chain', assets: 4 },
    { id: 'ap-2', name: 'Facility Zone Profile', type: 'ZONE', ruleChain: 'Root Rule Chain', assets: 2 },
  ]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'BUILDING' });

  const filtered = profiles.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = (e) => {
    e.preventDefault();
    requireAuth(() => {
      const newP = { id: `ap-${Date.now()}`, name: form.name, type: form.type, ruleChain: 'Root Rule Chain', assets: 0 };
      setProfiles([...profiles, newP]);
      setShowModal(false);
      setForm({ name: '', type: 'BUILDING' });
    }, 'add an Asset Profile');
  };

  const handleDelete = (id) => {
    requireAuth(() => {
      if (confirm('Delete asset profile?')) setProfiles(profiles.filter(p => p.id !== id));
    }, 'delete asset profile');
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Asset Profiles</h1>
          <p className="page-subtitle">Manage asset grouping classifications and attributes</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Asset Profile</button>
      </div>

      <div className="data-table-container">
        <div className="data-table-toolbar">
          <div className="search-input-wrapper">
            <Search size={14} className="search-input-icon" />
            <input className="search-input" placeholder="Search profiles..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Profile Type</th><th>Default Rule Chain</th><th>Assets Count</th><th style={{ width: 60 }}></th></tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 500 }}>{p.name}</td>
                <td><span className="badge badge-info">{p.type}</span></td>
                <td style={{ color: 'var(--color-primary-light)' }}>{p.ruleChain}</td>
                <td>{p.assets} assets</td>
                <td><button className="btn btn-ghost btn-sm" onClick={() => handleDelete(p.id)}><Trash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create Asset Profile</h2>
              <button type="button" className="modal-close" onClick={() => setShowModal(false)} aria-label="Close modal">✕</button>

            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Profile Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required autoFocus placeholder="e.g. Warehouse Profile" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
