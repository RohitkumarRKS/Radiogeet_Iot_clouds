import { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ImportDevicesModal({ onClose, onImportSuccess }) {
  const [csvContent, setCsvContent] = useState(
    'Name,Device Profile,Label,Access Token\nSensor-Node-01,Default,Temperature Sensor,token_sensor01\nSensor-Node-02,Smart Meter,Water Meter,token_sensor02'
  );
  const [importing, setImporting] = useState(false);
  const [resultMsg, setResultMsg] = useState(null);

  const handleImport = (e) => {
    e.preventDefault();
    setImporting(true);

    setTimeout(() => {
      const lines = csvContent.trim().split('\n').slice(1);
      const importedCount = lines.filter(line => line.trim().length > 0).length;
      
      setImporting(false);
      setResultMsg(`Successfully imported ${importedCount} devices!`);
      setTimeout(() => {
        if (onImportSuccess) onImportSuccess();
        onClose();
      }, 1500);
    }, 800);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <span className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSpreadsheet size={18} style={{ color: 'var(--color-primary)' }} />
            Import Devices from CSV / JSON
          </span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleImport}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              Paste CSV records below or upload a .csv file containing device credentials.
            </p>

            {resultMsg ? (
              <div style={{
                padding: '16px', borderRadius: 8, background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid var(--color-success)', color: 'var(--color-success)',
                display: 'flex', alignItems: 'center', gap: '10px'
              }}>
                <CheckCircle2 size={20} />
                <span style={{ fontWeight: 600 }}>{resultMsg}</span>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">CSV Content (Name, Device Profile, Label, Access Token)</label>
                <textarea
                  className="form-input"
                  rows={6}
                  style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)' }}
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={importing || resultMsg}>
              <Upload size={14} /> {importing ? 'Importing Devices...' : 'Start Import'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
