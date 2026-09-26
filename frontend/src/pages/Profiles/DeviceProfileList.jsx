import { useState } from 'react';
import { Smartphone, Plus, Trash2, Search, Cpu } from 'lucide-react';
import { useAuthModal } from '../../components/Common/AuthModal';

export default function DeviceProfileList() {
  const { requireAuth } = useAuthModal();
  const [profiles, setProfiles] = useState([
    { id: 'dp-1', name: 'Default Device Profile', transport: 'DEFAULT', type: 'DEFAULT', ruleChain: 'Root Rule Chain', devices: 5 },
    { id: 'dp-2', name: 'Temperature Sensor Profile', transport: 'MQTT', type: 'SENSOR', ruleChain: 'Thermostat Rule Chain', devices: 3 },
  ]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', transport: 'MQTT', type: 'DEFAULT' });

  const filtered = profiles.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = (e) => {
    e.preventDefault();
    requireAuth(() => {
      const newP = {
        id: `dp-${Date.now()}`,
        name: form.name,
        transport: form.transport,
        type: form.type,
        ruleChain: 'Root Rule Chain',
        devices: 0,
      };
      setProfiles([...profiles, newP]);
      setShowModal(false);
      setForm({ name: '', transport: 'MQTT', type: 'DEFAULT' });
    }, 'add a Device Profile');
  };

  const handleDelete = (id) => {
    requireAuth(() => {
      if (confirm('Delete device profile?')) setProfiles(profiles.filter(p => p.id !== id));
    }, 'delete device profile');
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Device Profiles</h1>
          <p className="page-subtitle">Define device transport rules, alarm rules, and telemetry processing behaviors</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Device Profile</button>
      </div>

      <div className="data-table-container">
        <div className="data-table-toolbar">
          <div className="search-input-wrapper">
            <Search size={14} className="search-input-icon" />
            <input className="search-input" placeholder="Search profiles..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Transport Type</th><th>Profile Type</th><th>Default Rule Chain</th><th>Associated Devices</th><th style={{ width: 60 }}></th></tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 500 }}>{p.name}</td>
                <td><span className="badge badge-info">{p.transport}</span></td>
                <td><span className="badge badge-warning">{p.type}</span></td>
                <td style={{ color: 'var(--color-primary-light)' }}>{p.ruleChain}</td>
                <td>{p.devices} devices</td>
                <td><button className="btn btn-ghost btn-sm" onClick={() => handleDelete(p.id)}><Trash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create Device Profile</h2>
              <button type="button" className="modal-close" onClick={() => setShowModal(false)} aria-label="Close modal">✕</button>

            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Profile Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required autoFocus placeholder="e.g. Smart Meter Profile" />
                </div>
                <div className="form-group">
                  <label className="form-label">Transport Type</label>
                  <select className="form-select" value={form.transport} onChange={e => setForm({ ...form, transport: e.target.value })}>
                    <option value="DEFAULT">DEFAULT (HTTP / MQTT / CoAP)</option>
                    <option value="MQTT">MQTT Dedicated</option>
                    <option value="COAP">CoAP Protocol</option>
                    <option value="LWM2M">LwM2M Protocol</option>
                    <option value="SNMP">SNMP Gateway</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
