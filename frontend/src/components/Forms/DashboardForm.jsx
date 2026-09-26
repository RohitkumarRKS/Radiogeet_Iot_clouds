import { useState } from 'react';

export default function DashboardForm({ initialData = {}, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label">Title *</label>
          <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">{initialData.id ? 'Update' : 'Create'}</button>
      </div>
    </form>
  );
}
