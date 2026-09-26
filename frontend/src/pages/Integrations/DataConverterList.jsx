import { useState } from 'react';
import { RefreshCw, Plus, Trash2, Search, Code2 } from 'lucide-react';
import { useAuthModal } from '../../components/Common/AuthModal';

export default function DataConverterList() {
  const { requireAuth } = useAuthModal();
  const [converters, setConverters] = useState([
    { id: 'dc-1', name: 'JSON Telemetry Uplink Converter', type: 'UPLINK', debugMode: true, created: '2026-09-20' },
    { id: 'dc-2', name: 'Modbus Hex Downlink Converter', type: 'DOWNLINK', debugMode: false, created: '2026-09-21' },
  ]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'UPLINK' });

  const filtered = converters.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = (e) => {
    e.preventDefault();
    requireAuth(() => {
      const newC = { id: `dc-${Date.now()}`, name: form.name, type: form.type, debugMode: false, created: new Date().toISOString().split('T')[0] };
      setConverters([...converters, newC]);
      setShowModal(false);
      setForm({ name: '', type: 'UPLINK' });
    }, 'add a Data Converter');
  };

  const handleDelete = (id) => {
    requireAuth(() => {
      if (confirm('Delete converter script?')) setConverters(converters.filter(c => c.id !== id));
    }, 'delete converter script');
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Data Converters</h1>
          <p className="page-subtitle">Custom JavaScript data converters to transform raw payload bytes into telemetry JSON</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Converter</button>
      </div>

      <div className="data-table-container">
        <div className="data-table-toolbar">
          <div className="search-input-wrapper">
            <Search size={14} className="search-input-icon" />
            <input className="search-input" placeholder="Search converters..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Converter Type</th><th>Debug Mode</th><th>Created</th><th style={{ width: 60 }}></th></tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 500 }}>{c.name}</td>
                <td><span className={`badge ${c.type === 'UPLINK' ? 'badge-info' : 'badge-warning'}`}>{c.type}</span></td>
                <td><span className={`badge ${c.debugMode ? 'badge-success' : 'badge-inactive'}`}>{c.debugMode ? 'ENABLED' : 'DISABLED'}</span></td>
                <td style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)' }}>{c.created}</td>
                <td><button className="btn btn-ghost btn-sm" onClick={() => handleDelete(c.id)}><Trash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create Data Converter</h2>
              <button type="button" className="modal-close" onClick={() => setShowModal(false)} aria-label="Close modal">✕</button>

            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Converter Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required autoFocus placeholder="e.g. Hex Payload Decoder" />
                </div>
                <div className="form-group">
                  <label className="form-label">Converter Type</label>
                  <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="UPLINK">Uplink (Payload to Telemetry)</option>
                    <option value="DOWNLINK">Downlink (Command to Device Bytes)</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Converter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
