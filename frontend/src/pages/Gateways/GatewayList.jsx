import { useState } from 'react';
import { Network, Plus, Trash2, Search, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuthModal } from '../../components/Common/AuthModal';

export default function GatewayList() {
  const { requireAuth } = useAuthModal();
  const [gateways, setGateways] = useState([
    { id: 'gw-1', name: 'Industrial IoT Gateway Alpha', type: 'Modbus Gateway', status: 'ONLINE', connectedDevices: 12, ip: '192.168.1.104', lastSeen: 'Just now' },
    { id: 'gw-2', name: 'Building Edge Gateway Beta', type: 'BACnet Gateway', status: 'ONLINE', connectedDevices: 8, ip: '192.168.1.115', lastSeen: '2 mins ago' },
  ]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'Modbus Gateway', ip: '' });

  const filtered = gateways.filter(g => g.name.toLowerCase().includes(search.toLowerCase()) || g.type.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = (e) => {
    e.preventDefault();
    requireAuth(() => {
      const newGw = {
        id: `gw-${Date.now()}`,
        name: form.name,
        type: form.type,
        status: 'ONLINE',
        connectedDevices: 0,
        ip: form.ip || '192.168.1.200',
        lastSeen: 'Just now',
      };
      setGateways([newGw, ...gateways]);
      setShowModal(false);
      setForm({ name: '', type: 'Modbus Gateway', ip: '' });
    }, 'add a new Gateway');
  };

  const handleDelete = (id) => {
    requireAuth(() => {
      if (confirm('Delete gateway connection?')) {
        setGateways(gateways.filter(g => g.id !== id));
      }
    }, 'delete this gateway');
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gateways</h1>
          <p className="page-subtitle">Manage edge protocol gateways and device connectivity bridges</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Gateway</button>
      </div>

      <div className="data-table-container">
        <div className="data-table-toolbar">
          <div className="search-input-wrapper">
            <Search size={14} className="search-input-icon" />
            <input className="search-input" placeholder="Search gateways..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Protocol Type</th>
              <th>Status</th>
              <th>Connected Devices</th>
              <th>IP Address</th>
              <th>Last Activity</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="empty-state">
                    <Network size={48} className="empty-state-icon" />
                    <div className="empty-state-title">No gateways found</div>
                    <div className="empty-state-desc">Add a gateway to connect local OPC-UA, Modbus, or BACnet networks</div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map(g => (
                <tr key={g.id}>
                  <td style={{ fontWeight: 500 }}>{g.name}</td>
                  <td><span className="badge badge-info">{g.type}</span></td>
                  <td>
                    <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle size={12} /> {g.status}
                    </span>
                  </td>
                  <td>{g.connectedDevices} devices</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }}>{g.ip}</td>
                  <td style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)' }}>{g.lastSeen}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(g.id)} title="Delete Gateway">
                      <Trash2 size={14} />
                    </button>
                  </td>
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
              <h2 className="modal-title">Add Protocol Gateway</h2>
              <button type="button" className="modal-close" onClick={() => setShowModal(false)} aria-label="Close modal">✕</button>

            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Gateway Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required autoFocus placeholder="e.g. Factory Floor Gateway" />
                </div>
                <div className="form-group">
                  <label className="form-label">Protocol Type</label>
                  <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="Modbus Gateway">Modbus TCP / RTU</option>
                    <option value="BACnet Gateway">BACnet IP</option>
                    <option value="OPC-UA Server Bridge">OPC-UA Server Bridge</option>
                    <option value="MQTT Edge Broker">MQTT Edge Broker</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">IP Address</label>
                  <input className="form-input" value={form.ip} onChange={e => setForm({ ...form, ip: e.target.value })} placeholder="192.168.1.100" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Connect Gateway</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
