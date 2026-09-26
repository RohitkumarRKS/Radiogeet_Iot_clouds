import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Bell, Check, CheckCheck, Trash2, AlertTriangle, Cpu, GitBranch, Info } from 'lucide-react';

const typeIcons = { ALARM: AlertTriangle, ENTITY_ACTION: Cpu, RULE_ENGINE: GitBranch, SYSTEM: Info };
const typeColors = { ALARM: 'var(--color-danger)', ENTITY_ACTION: 'var(--color-primary)', RULE_ENGINE: 'var(--color-success)', SYSTEM: 'var(--color-info)' };

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetch = () => {
    setLoading(true);
    api.get('/notifications').then(r => { setNotifications(r.data.data); setUnreadCount(r.data.unreadCount); }).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const markRead = async (id) => { await api.put(`/notifications/${id}/read`); fetch(); };
  const markAllRead = async () => { await api.put('/notifications/read-all'); fetch(); };
  const handleDelete = async (id) => { await api.delete(`/notifications/${id}`); fetch(); };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div><h1 className="page-title">Notifications</h1><p className="page-subtitle">{unreadCount} unread</p></div>
        {unreadCount > 0 && <button className="btn btn-secondary" onClick={markAllRead}><CheckCheck size={14} /> Mark All Read</button>}
      </div>

      <div className="card">
        {loading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 60, margin: 8, borderRadius: 8 }} />) :
        notifications.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--space-12)' }}>
            <Bell size={48} className="empty-state-icon" />
            <div className="empty-state-title">No notifications</div>
          </div>
        ) : notifications.map(n => {
          const Icon = typeIcons[n.type] || Bell;
          const color = typeColors[n.type] || 'var(--color-text-secondary)';
          return (
            <div key={n.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)', padding: 'var(--space-4) var(--space-5)',
              borderBottom: '1px solid var(--color-border)',
              background: n.status === 'UNREAD' ? 'var(--color-bg-hover)' : 'transparent',
              transition: 'background 0.2s',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: n.status === 'UNREAD' ? 600 : 400, fontSize: 'var(--font-size-sm)', marginBottom: 2 }}>{n.subject}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 4 }}>{n.message}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>{new Date(n.createdAt).toLocaleString()}</div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {n.status === 'UNREAD' && <button className="btn btn-ghost btn-sm" onClick={() => markRead(n.id)} title="Mark Read"><Check size={14} /></button>}
                <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(n.id)} title="Delete"><Trash2 size={14} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
