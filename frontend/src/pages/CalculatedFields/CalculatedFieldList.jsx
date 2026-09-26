import { useState } from 'react';
import { FunctionSquare, Plus, Trash2, Search } from 'lucide-react';
import { useAuthModal } from '../../components/Common/AuthModal';

export default function CalculatedFieldList() {
  const { requireAuth } = useAuthModal();
  const [fields, setFields] = useState([
    { id: 'cf-1', name: 'Power Factor Calculation', expression: 'voltage * current * 0.85', outputKey: 'powerFactor', status: 'ACTIVE' },
    { id: 'cf-2', name: 'Fahrenheit Conversion', expression: '(temperature * 9/5) + 32', outputKey: 'temp_f', status: 'ACTIVE' },
  ]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', expression: '', outputKey: '' });

  const filtered = fields.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = (e) => {
    e.preventDefault();
    requireAuth(() => {
      const newF = { id: `cf-${Date.now()}`, name: form.name, expression: form.expression, outputKey: form.outputKey, status: 'ACTIVE' };
      setFields([...fields, newF]);
      setShowModal(false);
      setForm({ name: '', expression: '', outputKey: '' });
    }, 'add a Calculated Field');
  };

  const handleDelete = (id) => {
    requireAuth(() => {
      if (confirm('Delete calculated field rule?')) setFields(fields.filter(f => f.id !== id));
    }, 'delete calculated field');
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Calculated Fields</h1>
          <p className="page-subtitle">Derive telemetry values using dynamic mathematical expressions and formulas</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Calculated Field</button>
      </div>

      <div className="data-table-container">
        <div className="data-table-toolbar">
          <div className="search-input-wrapper">
            <Search size={14} className="search-input-icon" />
            <input className="search-input" placeholder="Search fields..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Formula Expression</th><th>Output Key</th><th>Status</th><th style={{ width: 60 }}></th></tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <tr key={f.id}>
                <td style={{ fontWeight: 500 }}>{f.name}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--color-secondary-light)' }}>{f.expression}</td>
                <td style={{ fontWeight: 600 }}>{f.outputKey}</td>
                <td><span className="badge badge-success">{f.status}</span></td>
                <td><button className="btn btn-ghost btn-sm" onClick={() => handleDelete(f.id)}><Trash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create Calculated Field</h2>
              <button type="button" className="modal-close" onClick={() => setShowModal(false)} aria-label="Close modal">✕</button>

            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Field Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required autoFocus placeholder="e.g. Total Power Draw" />
                </div>
                <div className="form-group">
                  <label className="form-label">Formula Expression *</label>
                  <input className="form-input" value={form.expression} onChange={e => setForm({ ...form, expression: e.target.value })} required placeholder="e.g. voltage * current" />
                </div>
                <div className="form-group">
                  <label className="form-label">Output Telemetry Key *</label>
                  <input className="form-input" value={form.outputKey} onChange={e => setForm({ ...form, outputKey: e.target.value })} required placeholder="e.g. power_watts" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Field</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
