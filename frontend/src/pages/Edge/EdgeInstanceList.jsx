import { useState } from 'react';
import { Router, Plus, Trash2, Search, CheckCircle } from 'lucide-react';
import { useAuthModal } from '../../components/Common/AuthModal';

export default function EdgeInstanceList() {
  const { requireAuth } = useAuthModal();
  const [instances, setInstances] = useState([
    { id: 'edge-1', name: 'Factory Floor Edge Instance', type: 'LINUX_ARM', syncStatus: 'IN_SYNC', version: '3.6.1', devices: 14 },
    { id: 'edge-2', name: 'Microgrid Substation Edge', type: 'DOCKER', syncStatus: 'IN_SYNC', version: '3.6.1', devices: 6 },
  ]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'DOCKER' });

  const filtered = instances.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = (e) => {
    e.preventDefault();
    requireAuth(() => {
      const newE = { id: `edge-${Date.now()}`, name: form.name, type: form.type, syncStatus: 'IN_SYNC', version: '3.6.1', devices: 0 };
      setInstances([...instances, newE]);
      setShowModal(false);
      setForm({ name: '', type: 'DOCKER' });
    }, 'add an Edge Instance');
  };

  const handleDelete = (id) => {
    requireAuth(() => {
      if (confirm('Unlink edge instance?')) setInstances(instances.filter(i => i.id !== id));
    }, 'delete edge instance');
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Edge Instances</h1>
          <p className="page-subtitle">Manage decentralized RadioGeet Edge computing nodes and local rule engine sync</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Edge Instance</button>
      </div>

      <div className="data-table-container">
        <div className="data-table-toolbar">
          <div className="search-input-wrapper">
            <Search size={14} className="search-input-icon" />
            <input className="search-input" placeholder="Search edge nodes..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Deployment Type</th><th>Cloud Sync Status</th><th>Edge Version</th><th>Local Devices</th><th style={{ width: 60 }}></th></tr>
          </thead>
          <tbody>
            {filtered.map(i => (
              <tr key={i.id}>
                <td style={{ fontWeight: 500 }}>{i.name}</td>
                <td><span className="badge badge-info">{i.type}</span></td>
                <td><span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><CheckCircle size={12} /> {i.syncStatus}</span></td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>v{i.version}</td>
                <td>{i.devices} devices</td>
                <td><button className="btn btn-ghost btn-sm" onClick={() => handleDelete(i.id)}><Trash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Provision Edge Node</h2>
              <button type="button" className="modal-close" onClick={() => setShowModal(false)} aria-label="Close modal">✕</button>

            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Instance Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required autoFocus placeholder="e.g. Remote Solar Farm Edge" />
                </div>
                <div className="form-group">
                  <label className="form-label">Deployment Type</label>
                  <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="DOCKER">Docker Container</option>
                    <option value="LINUX_ARM">Linux ARM (Raspberry Pi / IPC)</option>
                    <option value="KUBERNETES">Kubernetes Cluster Node</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Provision Node</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
