import { useState } from 'react';
import { Shield, Lock, Key, Save } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function SecuritySettings() {
  const toast = useToast();
  const [settings, setSettings] = useState({
    minPasswordLength: 8,
    requireNumbers: true,
    requireSpecialChars: false,
    jwtExpirationHours: 24,
    enable2FA: false,
    maxFailedAttempts: 5,
  });

  const handleSave = (e) => {
    e.preventDefault();
    toast.showToast('Security policy settings updated successfully!', 'success');
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Security Settings</h1>
          <p className="page-subtitle">Configure password policies, JWT token expiration, and two-factor authentication rules</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Authentication & Security Policy</span>
          <Shield size={16} style={{ color: 'var(--color-primary)' }} />
        </div>
        <form onSubmit={handleSave} className="card-body">
          <div className="form-group">
            <label className="form-label">Minimum Password Length</label>
            <input type="number" className="form-input" value={settings.minPasswordLength} onChange={e => setSettings({ ...settings, minPasswordLength: Number(e.target.value) })} min={6} max={32} />
          </div>

          <div className="form-group">
            <label className="form-label">JWT Token Expiration (Hours)</label>
            <input type="number" className="form-input" value={settings.jwtExpirationHours} onChange={e => setSettings({ ...settings, jwtExpirationHours: Number(e.target.value) })} min={1} max={720} />
          </div>

          <div className="form-group">
            <label className="form-label">Max Failed Login Attempts Before Lockout</label>
            <input type="number" className="form-input" value={settings.maxFailedAttempts} onChange={e => setSettings({ ...settings, maxFailedAttempts: Number(e.target.value) })} min={3} max={10} />
          </div>

          <button type="submit" className="btn btn-primary"><Save size={16} /> Save Security Policies</button>
        </form>
      </div>
    </div>
  );
}
