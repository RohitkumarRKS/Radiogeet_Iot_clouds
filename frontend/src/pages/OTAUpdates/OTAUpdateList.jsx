import { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Search, FileCode, CheckCircle2 } from 'lucide-react';
import api from '../../api/axios';
import { useAuthModal } from '../../components/Common/AuthModal';

export default function OTAUpdateList() {
  const { requireAuth } = useAuthModal();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', version: '', type: 'FIRMWARE', checksumAlgorithm: 'SHA256', checksum: '' });

  const fetchPackages = () => {
    setLoading(true);
    api.get('/ota-packages', { params: { search } })
      .then(r => setPackages(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPackages(); }, [search]);

  const handleCreate = (e) => {
    e.preventDefault();
    requireAuth(async () => {
      await api.post('/ota-packages', {
        title: form.title,
        version: form.version,
        type: form.type,
        checksumAlgorithm: form.checksumAlgorithm,
        checksum: form.checksum || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      });
      setShowModal(false);
      setForm({ title: '', version: '', type: 'FIRMWARE', checksumAlgorithm: 'SHA256', checksum: '' });
      fetchPackages();
    }, 'upload an OTA Package');
  };

  const handleDelete = (id) => {
    requireAuth(async () => {
      if (confirm('Delete OTA package?')) {
        await api.delete(`/ota-packages/${id}`);
        fetchPackages();
      }
    }, 'delete this OTA package');
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">OTA Updates</h1>
          <p className="page-subtitle">Over-the-air firmware and software update distribution packages</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Upload Package</button>
      </div>

      <div className="data-table-container">
        <div className="data-table-toolbar">
          <div className="search-input-wrapper">
            <Search size={14} className="search-input-icon" />
            <input className="search-input" placeholder="Search packages..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr><th>Title</th><th>Version</th><th>Type</th><th>Checksum (SHA256)</th><th>Created</th><th style={{ width: 60 }}></th></tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <tr key={i}><td colSpan={6}><div className="skeleton" style={{ height: 20 }} /></td></tr>)
            ) : packages.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">
                    <Package size={48} className="empty-state-icon" />
                    <div className="empty-state-title">No OTA packages uploaded</div>
                    <div className="empty-state-desc">Upload binary firmware or software packages to distribute remote updates</div>
                  </div>
                </td>
              </tr>
            ) : (
              packages.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500 }}>{p.title}</td>
                  <td><span className="badge badge-info">v{p.version}</span></td>
                  <td><span className="badge badge-warning">{p.type}</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>{p.checksum ? `${p.checksum.slice(0, 16)}...` : '—'}</td>
                  <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => handleDelete(p.id)}><Trash2 size={14} /></button></td>
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
              <h2 className="modal-title">Upload OTA Package</h2>
              <button type="button" className="modal-close" onClick={() => setShowModal(false)} aria-label="Close modal">✕</button>

            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required autoFocus placeholder="e.g. ESP32 Sensor Firmware v2.1" />
                </div>
                <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="form-label">Version *</label>
                    <input className="form-input" value={form.version} onChange={e => setForm({ ...form, version: e.target.value })} required placeholder="2.1.0" />
                  </div>
                  <div>
                    <label className="form-label">Package Type</label>
                    <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                      <option value="FIRMWARE">Firmware Binary</option>
                      <option value="SOFTWARE">Software Package</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">SHA256 Checksum</label>
                  <input className="form-input" value={form.checksum} onChange={e => setForm({ ...form, checksum: e.target.value })} placeholder="Auto-generated if left blank" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Upload Package</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
