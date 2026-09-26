import { useState } from 'react';
import { FileText, Plus, Trash2, Search, Download } from 'lucide-react';
import { useAuthModal } from '../../components/Common/AuthModal';

export default function ResourceLibrary() {
  const { requireAuth } = useAuthModal();
  const [resources, setResources] = useState([
    { id: 'res-1', title: 'Standard LwM2M Object Definition', key: 'lwm2m-temp-sensor.json', type: 'LWM2M_MODEL', size: '14.2 KB' },
    { id: 'res-2', title: 'Default Device Certificate Authority', key: 'cloudboard-ca.pem', type: 'CERTIFICATE', size: '2.4 KB' },
  ]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', key: '', type: 'LWM2M_MODEL' });

  const filtered = resources.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = (e) => {
    e.preventDefault();
    requireAuth(() => {
      const newR = { id: `res-${Date.now()}`, title: form.title, key: form.key, type: form.type, size: '4.8 KB' };
      setResources([...resources, newR]);
      setShowModal(false);
      setForm({ title: '', key: '', type: 'LWM2M_MODEL' });
    }, 'upload a Resource');
  };

  const handleDelete = (id) => {
    requireAuth(() => {
      if (confirm('Delete resource file?')) setResources(resources.filter(r => r.id !== id));
    }, 'delete resource');
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Resource Library</h1>
          <p className="page-subtitle">Repository for system scripts, LwM2M object schemas, and SSL certificates</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Resource</button>
      </div>

      <div className="data-table-container">
        <div className="data-table-toolbar">
          <div className="search-input-wrapper">
            <Search size={14} className="search-input-icon" />
            <input className="search-input" placeholder="Search resources..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr><th>Title</th><th>Resource Key</th><th>Type</th><th>File Size</th><th style={{ width: 60 }}></th></tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id}>
                <td style={{ fontWeight: 500 }}>{r.title}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }}>{r.key}</td>
                <td><span className="badge badge-info">{r.type}</span></td>
                <td>{r.size}</td>
                <td><button className="btn btn-ghost btn-sm" onClick={() => handleDelete(r.id)}><Trash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Upload Resource</h2>
              <button type="button" className="modal-close" onClick={() => setShowModal(false)} aria-label="Close modal">✕</button>

            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required autoFocus placeholder="e.g. Modbus Gateway Schema" />
                </div>
                <div className="form-group">
                  <label className="form-label">Resource Key Filename *</label>
                  <input className="form-input" value={form.key} onChange={e => setForm({ ...form, key: e.target.value })} required placeholder="e.g. modbus-schema.json" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Upload File</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
