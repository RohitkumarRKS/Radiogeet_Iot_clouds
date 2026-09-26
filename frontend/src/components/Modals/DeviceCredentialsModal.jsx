import { useState } from 'react';
import { Key, Copy, Check, RefreshCw, ShieldCheck, Zap, Terminal, Code, Cpu } from 'lucide-react';
import api from '../../api/axios';

export default function DeviceCredentialsModal({ device, onClose, onSave }) {
  const [credType, setCredType] = useState('ACCESS_TOKEN');
  const [accessToken, setAccessToken] = useState(device?.accessToken || `token_${Math.random().toString(36).substring(2, 10)}`);
  const [clientId, setClientId] = useState(`client_${device?.id?.substring(0, 8) || '001'}`);
  const [username, setUsername] = useState('tb_device_user');
  const [password, setPassword] = useState('secret_device_pass');
  const [rsaPubKey, setRsaPubKey] = useState('MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu...');
  const [copied, setCopied] = useState(false);
  const [copiedMqtt, setCopiedMqtt] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [testStatus, setTestStatus] = useState(null);

  const mosquittoCmd = `mosquitto_pub -h localhost -p 1883 -t v1/devices/me/telemetry -u "${accessToken}" -m '{"temperature": 26.5, "humidity": 58.2}'`;
  const curlCmd = `curl -v -X POST http://localhost:2004/api/telemetry/v1/${accessToken}/telemetry -H "Content-Type: application/json" -d '{"temperature": 26.5, "humidity": 58.2}'`;

  const handleCopy = (text, setFn) => {
    navigator.clipboard.writeText(text);
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  };

  const handleRegenerate = () => {
    const newToken = `token_${Math.random().toString(36).substring(2, 12)}`;
    setAccessToken(newToken);
  };

  const handleSendTestTelemetry = async () => {
    setTestSending(true);
    setTestStatus(null);
    try {
      await api.post(`/telemetry/v1/${accessToken}/telemetry`, {
        temperature: parseFloat((24 + Math.random() * 5).toFixed(2)),
        humidity: parseFloat((50 + Math.random() * 15).toFixed(2)),
        status: 'ONLINE'
      });
      setTestStatus('✅ Test telemetry packet sent successfully!');
    } catch (err) {
      setTestStatus('❌ Failed to send telemetry.');
    } finally {
      setTestSending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave({ credType, accessToken, clientId, username, password, rsaPubKey });
    }
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1100 }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640, borderRadius: 12, overflow: 'hidden' }}>
        <div className="modal-header" style={{ background: '#0F1E36', color: '#FFF', padding: '16px 24px' }}>
          <span className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFF', fontSize: '18px' }}>
            <Key size={20} style={{ color: '#3B82F6' }} />
            Device Credentials & MQTT Guide — {device?.name || 'Device'}
          </span>
          <button className="modal-close" onClick={onClose} style={{ color: '#FFF' }}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px', maxHeight: '75vh', overflowY: 'auto' }}>
            
            {/* Credentials Type */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Credentials Type</label>
              <select
                className="form-select"
                value={credType}
                onChange={(e) => setCredType(e.target.value)}
                style={{ borderRadius: 6, border: '1px solid #CBD5E1', padding: '10px 12px' }}
              >
                <option value="ACCESS_TOKEN">Access Token (Default - MQTT & HTTP)</option>
                <option value="MQTT_BASIC">MQTT Basic Auth (Client ID + User/Pass)</option>
                <option value="X509">X.509 Certificate / RSA Public Key</option>
              </select>
            </div>

            {credType === 'ACCESS_TOKEN' && (
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Device Access Token</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    className="form-input"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    style={{ fontFamily: 'monospace', fontWeight: 600, color: '#2563EB', background: '#F8FAFC' }}
                  />
                  <button type="button" className="btn btn-secondary" onClick={() => handleCopy(accessToken, setCopied)} title="Copy Access Token">
                    {copied ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={handleRegenerate} title="Generate New Token">
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* MQTT & HTTP Connection Guide */}
            <div style={{ border: '1px solid #DBEAFE', borderRadius: '8px', background: '#F8FAFC', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, color: '#1E293B', marginBottom: '12px' }}>
                <Terminal size={16} style={{ color: '#2563EB' }} />
                MQTT & HTTP Telemetry Integration Guide
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px', marginBottom: '14px', background: '#FFF', padding: '12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <div><strong>MQTT Host:</strong> localhost:1883</div>
                <div><strong>MQTT Topic:</strong> <code style={{ color: '#2563EB' }}>v1/devices/me/telemetry</code></div>
                <div><strong>HTTP Host:</strong> localhost:2004</div>
                <div><strong>HTTP Endpoint:</strong> <code style={{ color: '#2563EB' }}>/api/telemetry/v1/{accessToken}/telemetry</code></div>
              </div>

              {/* Mosquitto Command */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  <span>Mosquitto MQTT CLI Command</span>
                  <button type="button" onClick={() => handleCopy(mosquittoCmd, setCopiedMqtt)} style={{ background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {copiedMqtt ? <Check size={12} color="#10B981" /> : <Copy size={12} />} Copy MQTT
                  </button>
                </div>
                <pre style={{ background: '#0F1E36', color: '#38BDF8', padding: '10px 12px', borderRadius: '6px', fontSize: '11px', overflowX: 'auto', margin: 0, fontFamily: 'monospace' }}>
                  {mosquittoCmd}
                </pre>
              </div>

              {/* Curl Command */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  <span>cURL HTTP POST Command</span>
                  <button type="button" onClick={() => handleCopy(curlCmd, setCopiedCurl)} style={{ background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {copiedCurl ? <Check size={12} color="#10B981" /> : <Copy size={12} />} Copy cURL
                  </button>
                </div>
                <pre style={{ background: '#0F1E36', color: '#A7F3D0', padding: '10px 12px', borderRadius: '6px', fontSize: '11px', overflowX: 'auto', margin: 0, fontFamily: 'monospace' }}>
                  {curlCmd}
                </pre>
              </div>
            </div>

            {/* Test Telemetry Section */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', color: '#1E40AF', fontWeight: 500 }}>
                Want to test telemetry right now?
              </div>
              <button
                type="button"
                onClick={handleSendTestTelemetry}
                disabled={testSending}
                style={{
                  background: '#2563EB',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Zap size={14} />
                {testSending ? 'Sending...' : '⚡ Push Test Telemetry'}
              </button>
            </div>
            {testStatus && (
              <div style={{ fontSize: '12px', color: testStatus.includes('✅') ? '#166534' : '#991B1B', textAlign: 'center', fontWeight: 600 }}>
                {testStatus}
              </div>
            )}

          </div>

          <div className="modal-footer" style={{ padding: '16px 24px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" style={{ background: '#2563EB', color: '#FFF', border: 'none', borderRadius: '6px', padding: '8px 20px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} /> Save Credentials
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
