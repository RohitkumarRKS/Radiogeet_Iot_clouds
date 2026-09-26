import { useState } from 'react';
import { PaintRoller, Save, Image, Palette } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function WhiteLabeling() {
  const toast = useToast();
  const [form, setForm] = useState({
    title: 'CloudBoard IoT',
    logoUrl: '',
    primaryColor: '#3b82f6',
    customCss: '',
    showFooter: true,
  });

  const handleSave = (e) => {
    e.preventDefault();
    toast.showToast('White Labeling branding settings saved!', 'success');
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">White Labeling</h1>
          <p className="page-subtitle">Customize application title, logo, primary color scheme, and custom domain branding</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Custom UI Branding</span>
          <PaintRoller size={16} style={{ color: 'var(--color-primary)' }} />
        </div>
        <form onSubmit={handleSave} className="card-body">
          <div className="form-group">
            <label className="form-label">Application Title</label>
            <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="form-label">Custom Logo Image (Upload PNG / SVG or URL)</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input className="form-input" value={form.logoUrl} onChange={e => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://example.com/company-logo.png or upload below" style={{ flex: 1 }} />
              <label className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '8px 14px', whiteSpace: 'nowrap' }}>
                <Image size={16} /> Browse PNG File
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/svg+xml"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setForm({ ...form, logoUrl: reader.result });
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
            {form.logoUrl && (
              <div style={{ marginTop: 8, padding: 6, background: '#f8fafc', borderRadius: 6, border: '1px solid #cbd5e1', display: 'inline-block' }}>
                <img src={form.logoUrl} alt="Logo Preview" style={{ height: 36, objectFit: 'contain' }} />
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Brand Primary Accent Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input type="color" value={form.primaryColor} onChange={e => setForm({ ...form, primaryColor: e.target.value })} style={{ width: 48, height: 38, padding: 2, borderRadius: 6, border: '1px solid var(--color-border)', background: 'none', cursor: 'pointer' }} />
              <input className="form-input" value={form.primaryColor} onChange={e => setForm({ ...form, primaryColor: e.target.value })} style={{ width: 140 }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Custom CSS Overrides</label>
            <textarea className="form-textarea" rows={4} value={form.customCss} onChange={e => setForm({ ...form, customCss: e.target.value })} placeholder="/* Insert custom CSS styling */" />
          </div>

          <button type="submit" className="btn btn-primary"><Save size={16} /> Save Branding</button>
        </form>
      </div>
    </div>
  );
}
