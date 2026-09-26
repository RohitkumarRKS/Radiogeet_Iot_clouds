import { useState, useEffect } from 'react';
import { ArrowRightLeft, Plus, Trash2, Search, CheckCircle2 } from 'lucide-react';
import api from '../../api/axios';
import { useAuthModal } from '../../components/Common/AuthModal';

export default function IntegrationList() {
  const { requireAuth } = useAuthModal();
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'MQTT', host: 'broker.hivemq.com', port: 1883 });

  const fetchIntegrations = () => {
    setLoading(true);
    api.get('/integrations', { params: { search } })
      .then(r => setIntegrations(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchIntegrations(); }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    requireAuth(async () => {
      await api.post('/integrations', { name: form.name, type: form.type, configuration: { host: form.host, port: form.port } });
      setShowModal(false);
      setForm({ name: '', type: 'MQTT', host: 'broker.hivemq.com', port: 1883 });
      fetchIntegrations();
    }, 'add an Integration');
  };

  const handleDelete = async (id) => {
    requireAuth(async () => {
      if (confirm('Delete integration?')) {
        await api.delete(`/integrations/${id}`);
        fetchIntegrations();
      }
    }, 'delete integration');
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Integrations</h1>
          <p className="page-subtitle">Connect external MQTT brokers, HTTP webhooks, Kafka streams, and CoAP endpoints</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Integration</button>
      </div>

      <div className="data-table-container">
        <div className="data-table-toolbar">
          <div className="search-input-wrapper">
            <Search size={14} className="search-input-icon" />
            <input className="search-input" placeholder="Search integrations..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Integration Type</th><th>Status</th><th>Target Endpoint</th><th style={{ width: 60 }}></th></tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <tr key={i}><td colSpan={5}><div className="skeleton" style={{ height: 20 }} /></td></tr>)
            ) : integrations.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="empty-state">
                    <ArrowRightLeft size={48} className="empty-state-icon" />
                    <div className="empty-state-title">No integrations configured</div>
                    <div className="empty-state-desc">Stream telemetry directly from external cloud platforms and MQTT brokers</div>
                  </div>
                </td>
              </tr>
            ) : (
              integrations.map(i => (
                <tr key={i.id}>
                  <td style={{ fontWeight: 500 }}>{i.name}</td>
                  <td><span className="badge badge-info">{i.type}</span></td>
                  <td><span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={12} /> {i.status}</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }}>{i.configuration?.host || 'http://localhost:8080'}</td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => handleDelete(i.id)}><Trash2 size={14} /></button></td>
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
              <h2 className="modal-title">Create Integration</h2>
              <button type="button" className="modal-close" onClick={() => setShowModal(false)} aria-label="Close modal">✕</button>

            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Integration Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required autoFocus placeholder="e.g. HiveMQ External Stream" />
                </div>
                <div className="form-group">
                  <label className="form-label">Integration Type</label>
                  <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="MQTT">MQTT Integration</option>
                    <option value="HTTP">HTTP Webhook Integration</option>
                    <option value="KAFKA">Apache Kafka Integration</option>
                    <option value="COAP">CoAP Server Integration</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Broker Host / Endpoint</label>
                  <input className="form-input" value={form.host} onChange={e => setForm({ ...form, host: e.target.value })} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Integration</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
