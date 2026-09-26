import { useState } from 'react';

export default function DeviceForm({ initialData = {}, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: initialData.name || '',
    type: initialData.type || 'default',
    label: initialData.label || '',
    isGateway: initialData.isGateway || false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label">Name *</label>
          <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label">Type</label>
          <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="default">Default</option>
            <option value="sensor">Sensor</option>
            <option value="gateway">Gateway</option>
            <option value="actuator">Actuator</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Label</label>
          <input className="form-input" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} />
        </div>
        <label className="form-checkbox">
          <input type="checkbox" checked={form.isGateway} onChange={e => setForm({ ...form, isGateway: e.target.checked })} />
          Is Gateway Device
        </label>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">{initialData.id ? 'Update' : 'Create'}</button>
      </div>
    </form>
  );
}
