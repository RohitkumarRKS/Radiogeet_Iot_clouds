import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Users, Plus, Trash2, Search, Mail, Phone, MapPin } from 'lucide-react';

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', country: '', city: '' });

  const fetch = () => {
    setLoading(true);
    api.get('/customers').then(r => setCustomers(r.data.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/customers', form);
    setShowModal(false);
    setForm({ name: '', email: '', phone: '', country: '', city: '' });
    fetch();
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div><h1 className="page-title">Customers</h1><p className="page-subtitle">{customers.length} customers</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Customer</button>
      </div>
      <div className="data-table-container">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Location</th><th>Created</th><th style={{ width: 50 }}></th></tr></thead>
          <tbody>
            {loading ? Array.from({ length: 3 }).map((_, i) => <tr key={i}>{Array.from({ length: 6 }).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 16, width: '60%' }} /></td>)}</tr>) :
            customers.length === 0 ? <tr><td colSpan={6}><div className="empty-state"><Users size={48} className="empty-state-icon" /><div className="empty-state-title">No customers</div></div></td></tr> :
            customers.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 500 }}>{c.name}</td>
                <td style={{ color: 'var(--color-text-secondary)' }}>{c.email || '—'}</td>
                <td style={{ color: 'var(--color-text-secondary)' }}>{c.phone || '—'}</td>
                <td style={{ color: 'var(--color-text-secondary)' }}>{[c.city, c.country].filter(Boolean).join(', ') || '—'}</td>
                <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                <td><button className="btn btn-ghost btn-sm" onClick={async () => { if (confirm('Delete?')) { await api.delete(`/customers/${c.id}`); fetch(); } }}><Trash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2 className="modal-title">Add Customer</h2><button type="button" className="modal-close" onClick={() => setShowModal(false)} aria-label="Close modal">✕</button></div>

            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required autoFocus /></div>
                <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group"><label className="form-label">Country</label><input className="form-input" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">City</label><input className="form-input" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
                </div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
