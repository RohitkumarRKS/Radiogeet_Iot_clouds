import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FileText, Search } from 'lucide-react';

const actionColors = {
  ADDED: 'badge-success', UPDATED: 'badge-info', DELETED: 'badge-danger',
  LOGIN: 'badge-info', LOGOUT: 'badge-inactive', ASSIGNED: 'badge-warning',
};

export default function AuditLogList() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/audit-logs', { params: { search } }).then(r => setLogs(r.data.data)).catch(console.error).finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div><h1 className="page-title">Audit Logs</h1><p className="page-subtitle">Activity history and security logs</p></div>
      </div>
      <div className="data-table-container">
        <div className="data-table-toolbar">
          <div className="search-input-wrapper">
            <Search size={14} className="search-input-icon" />
            <input className="search-input" placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <table className="data-table">
          <thead><tr><th>User</th><th>Action</th><th>Entity Type</th><th>Entity</th><th>Status</th><th>Time</th></tr></thead>
          <tbody>
            {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}>{Array.from({ length: 6 }).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 16, width: '60%' }} /></td>)}</tr>) :
            logs.length === 0 ? <tr><td colSpan={6}><div className="empty-state"><FileText size={48} className="empty-state-icon" /><div className="empty-state-title">No audit logs</div></div></td></tr> :
            logs.map(l => (
              <tr key={l.id}>
                <td style={{ fontWeight: 500 }}>{l.userName}</td>
                <td><span className={`badge ${actionColors[l.actionType] || 'badge-info'}`}>{l.actionType}</span></td>
                <td style={{ color: 'var(--color-text-secondary)' }}>{l.entityType}</td>
                <td style={{ color: 'var(--color-text-secondary)' }}>{l.entityName || '—'}</td>
                <td><span className={`badge ${l.actionStatus === 'SUCCESS' ? 'badge-success' : 'badge-danger'}`}>{l.actionStatus}</span></td>
                <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>{new Date(l.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
