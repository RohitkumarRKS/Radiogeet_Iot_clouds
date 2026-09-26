import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { GitBranch, Plus, Trash2, Star, Edit } from 'lucide-react';

export default function RuleChainList() {
  const [chains, setChains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const navigate = useNavigate();

  const fetch = () => {
    setLoading(true);
    api.get('/rule-chains').then(r => setChains(r.data.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/rule-chains', form);
    setShowModal(false);
    setForm({ name: '', description: '' });
    fetch();
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div><h1 className="page-title">Rule Chains</h1><p className="page-subtitle">{chains.length} rule chains</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Rule Chain</button>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Root</th><th>Description</th><th>Modified</th><th style={{ width: 100 }}>Actions</th></tr></thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <tr key={i}>{Array.from({ length: 5 }).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 16, width: '60%' }} /></td>)}</tr>)
            ) : chains.length === 0 ? (
              <tr><td colSpan={5}><div className="empty-state"><GitBranch size={48} className="empty-state-icon" /><div className="empty-state-title">No rule chains</div></div></td></tr>
            ) : chains.map(c => (
              <tr key={c.id} onClick={() => navigate(`/rule-chains/${c.id}`)}>
                <td style={{ fontWeight: 500 }}>{c.name}</td>
                <td>{c.isRoot ? <span className="badge badge-warning"><Star size={10} /> Root</span> : '—'}</td>
                <td style={{ color: 'var(--color-text-secondary)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.description || '—'}</td>
                <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>{new Date(c.updatedAt).toLocaleDateString()}</td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); navigate(`/rule-chains/${c.id}`); }}><Edit size={14} /></button>
                  {!c.isRoot && <button className="btn btn-ghost btn-sm" onClick={async (e) => { e.stopPropagation(); if (confirm('Delete?')) { await api.delete(`/rule-chains/${c.id}`); fetch(); } }}><Trash2 size={14} /></button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2 className="modal-title">Create Rule Chain</h2><button type="button" className="modal-close" onClick={() => setShowModal(false)} aria-label="Close modal">✕</button></div>

            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required autoFocus /></div>
                <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
