import { Smartphone, QrCode, Sparkles } from 'lucide-react';

export default function MobileCenter() {
  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mobile Center</h1>
          <p className="page-subtitle">Configure mobile application branding, push notifications, and QR launcher</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-5)' }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Mobile App Customization</span></div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Application Title</label>
              <input className="form-input" defaultValue="CloudBoard Mobile" />
            </div>
            <div className="form-group">
              <label className="form-label">iOS / Android App Secret Key</label>
              <input className="form-input" defaultValue="mb_sec_99382183921938129" readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">Push Notification Provider</label>
              <select className="form-select" defaultValue="FCM">
                <option value="FCM">Firebase Cloud Messaging (FCM)</option>
                <option value="APNS">Apple Push Notification Service (APNs)</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={() => alert('Mobile settings saved!')}>Save Mobile Settings</button>
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <div style={{ margin: '0 auto var(--space-4)', width: 140, height: 140, background: '#ffffff', padding: 12, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <QrCode size={110} color="#0f172a" />
          </div>
          <div style={{ fontWeight: 600, fontSize: 'var(--font-size-base)', marginBottom: 4 }}>Scan to Open Mobile App</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>Supports iOS 15+ and Android 10+</div>
        </div>
      </div>
    </div>
  );
}
