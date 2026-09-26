import React, { useState, useEffect } from 'react';
import { HelpCircle, X, Check, Copy, RefreshCw, Key, Shield, Wifi, Info } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function AddDeviceModal({ onClose, onDeviceCreated, profiles = [] }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1 = Details, 2 = Credentials

  // Form State
  const [form, setForm] = useState({
    name: '',
    label: '',
    type: 'default',
    deviceProfileId: '',
    isGateway: false,
    owner: user?.email || 'admin@cloudboard.io',
    group: 'All Devices',
    description: '',
  });

  // Credentials State
  const [credentialsType, setCredentialsType] = useState('ACCESS_TOKEN'); // ACCESS_TOKEN | X509 | MQTT_BASIC
  const [accessToken, setAccessToken] = useState('');
  const [mqttUsername, setMqttUsername] = useState('');
  const [mqttPassword, setMqttPassword] = useState('');
  const [copiedToken, setCopiedToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  const generateNewToken = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 20; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setAccessToken(token);
  };

  const handleCopyToken = () => {
    if (accessToken) {
      navigator.clipboard.writeText(accessToken);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!form.name.trim()) {
      setError('Device name is required');
      setStep(1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: form.name.trim(),
        label: form.label.trim(),
        type: form.type || 'default',
        deviceProfileId: form.deviceProfileId || undefined,
        isGateway: form.isGateway,
        accessToken: accessToken.trim(),
        additionalInfo: {
          description: form.description,
          owner: form.owner,
          group: form.group,
          credentialsType,
        },
      };

      const res = await api.post('/devices', payload);
      const createdDevice = res.data;
      if (onDeviceCreated) {
        onDeviceCreated(createdDevice);
      }
      onClose();
    } catch (err) {
      console.error('Failed to create device:', err);
      setError(err.response?.data?.error || err.message || 'Failed to create device');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="add-device-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '580px',
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
      >
        {/* Header Bar (RadioGeet Deep Navy #0F1E36) */}
        <div
          style={{
            background: '#0F1E36',
            color: '#ffffff',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.01em' }}>
              Add new device
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              title="Help & Connection Info"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#ffffff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              <HelpCircle size={18} />
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: 0.8,
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Help Banner if toggled */}
        {showHelp && (
          <div
            style={{
              background: '#eff6ff',
              borderBottom: '1px solid #bfdbfe',
              padding: '12px 20px',
              fontSize: '13px',
              color: '#1e40af',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}
          >
            <Info size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <strong>Quick Device Setup:</strong> Fill device details and assign an Access Token credentials. Once added, send JSON telemetry via MQTT on port 1883 or HTTP API.
            </div>
          </div>
        )}

        {/* Wizard Stepper Header */}
        <div
          style={{
            padding: '16px 24px 12px',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            {/* Step 1 Circle */}
            <div
              onClick={() => setStep(1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                zIndex: 2,
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: step >= 1 ? '#2563EB' : '#e2e8f0',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '13px',
                  transition: 'all 0.2s',
                }}
              >
                {step > 1 ? <Check size={16} /> : '1'}
              </div>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: step === 1 ? 600 : 500,
                  color: step === 1 ? '#0F1E36' : '#64748b',
                }}
              >
                Device details
              </span>
            </div>

            {/* Connecting Line */}
            <div
              style={{
                flex: 1,
                height: '2px',
                background: step > 1 ? '#2563EB' : '#cbd5e1',
                margin: '0 16px',
              }}
            />

            {/* Step 2 Circle */}
            <div
              onClick={() => setStep(2)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                zIndex: 2,
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: step === 2 ? '#2563EB' : '#94a3b8',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '13px',
                  transition: 'all 0.2s',
                }}
              >
                2
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: step === 2 ? 600 : 500,
                    color: step === 2 ? '#0F1E36' : '#64748b',
                  }}
                >
                  Credentials
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '-2px' }}>
                  Optional
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '13px',
              }}
            >
              {error}
            </div>
          )}

          {/* STEP 1: DEVICE DETAILS */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Device Name */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Temperature Sensor A1"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    background: '#f8fafc',
                  }}
                  required
                  autoFocus
                />
              </div>

              {/* Label */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. Building A Floor 2"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    background: '#f8fafc',
                  }}
                />
              </div>

              {/* Device Profile Select */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  Device profile *
                </label>
                <select
                  value={form.deviceProfileId}
                  onChange={(e) => setForm({ ...form, deviceProfileId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    background: '#f8fafc',
                    color: '#0f172a',
                  }}
                >
                  <option value="">default</option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Is Gateway Toggle */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '4px 0',
                }}
              >
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isGateway: !form.isGateway })}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    background: form.isGateway ? '#2563EB' : '#cbd5e1',
                    border: 'none',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      position: 'absolute',
                      top: '3px',
                      left: form.isGateway ? '23px' : '3px',
                      transition: 'left 0.2s',
                    }}
                  />
                </button>
                <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: 500 }}>
                  Is gateway
                </span>
              </div>

              {/* Owner and Groups Section Box */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '16px',
                  background: '#f8fafc',
                }}
              >
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#0F1E36',
                    marginBottom: '12px',
                  }}
                >
                  Owner and groups
                </div>

                {/* Owner Field */}
                <div style={{ marginBottom: '12px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#64748b',
                      marginBottom: '4px',
                    }}
                  >
                    Owner*
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={form.owner}
                      onChange={(e) => setForm({ ...form, owner: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 32px 8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        background: '#ffffff',
                      }}
                    />
                    {form.owner && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, owner: '' })}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          border: 'none',
                          background: 'transparent',
                          color: '#94a3b8',
                          cursor: 'pointer',
                        }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Groups Field */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#64748b',
                      marginBottom: '4px',
                    }}
                  >
                    Groups
                  </label>
                  <input
                    type="text"
                    placeholder="All Devices"
                    value={form.group}
                    onChange={(e) => setForm({ ...form, group: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      background: '#ffffff',
                    }}
                  />
                </div>
              </div>

              {/* Description Field */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Enter device description..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    background: '#f8fafc',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          )}

          {/* STEP 2: CREDENTIALS */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#475569',
                    marginBottom: '10px',
                  }}
                >
                  Credentials type
                </label>

                {/* Pill Selector (Access token / X.509 / MQTT Basic) */}
                <div
                  style={{
                    display: 'flex',
                    background: '#f1f5f9',
                    borderRadius: '8px',
                    padding: '4px',
                    gap: '4px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setCredentialsType('ACCESS_TOKEN')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      background: credentialsType === 'ACCESS_TOKEN' ? '#2563EB' : 'transparent',
                      color: credentialsType === 'ACCESS_TOKEN' ? '#ffffff' : '#64748b',
                      fontSize: '13px',
                      fontWeight: credentialsType === 'ACCESS_TOKEN' ? 600 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    Access token
                  </button>
                  <button
                    type="button"
                    onClick={() => setCredentialsType('X509')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      background: credentialsType === 'X509' ? '#2563EB' : 'transparent',
                      color: credentialsType === 'X509' ? '#ffffff' : '#64748b',
                      fontSize: '13px',
                      fontWeight: credentialsType === 'X509' ? 600 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    X.509
                  </button>
                  <button
                    type="button"
                    onClick={() => setCredentialsType('MQTT_BASIC')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      background: credentialsType === 'MQTT_BASIC' ? '#2563EB' : 'transparent',
                      color: credentialsType === 'MQTT_BASIC' ? '#ffffff' : '#64748b',
                      fontSize: '13px',
                      fontWeight: credentialsType === 'MQTT_BASIC' ? 600 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    MQTT Basic
                  </button>
                </div>
              </div>

              {/* ACCESS TOKEN TYPE */}
              {credentialsType === 'ACCESS_TOKEN' && (
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#334155',
                      marginBottom: '6px',
                    }}
                  >
                    Access token *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Enter your custom access token (e.g. MY_REAL_ESP32_TOKEN)"
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 80px 10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        fontFamily: 'monospace',
                        background: '#ffffff',
                        color: '#0f172a',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <button
                        type="button"
                        onClick={generateNewToken}
                        title="Regenerate token"
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: '#64748b',
                          padding: '4px',
                          cursor: 'pointer',
                          borderRadius: '4px',
                        }}
                      >
                        <RefreshCw size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyToken}
                        title="Copy access token"
                        style={{
                          border: 'none',
                          background: copiedToken ? '#22c55e' : '#f1f5f9',
                          color: copiedToken ? '#ffffff' : '#475569',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                        }}
                      >
                        {copiedToken ? <Check size={14} /> : <Copy size={14} />}
                        {copiedToken ? 'Copied' : ''}
                      </button>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', display: 'block' }}>
                    Used by your physical device to publish telemetry via MQTT topic <code>v1/devices/me/telemetry</code>.
                  </span>
                </div>
              )}

              {/* MQTT BASIC TYPE */}
              {credentialsType === 'MQTT_BASIC' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>
                      Client ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. device_client_01"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>
                      Username
                    </label>
                    <input
                      type="text"
                      value={mqttUsername}
                      onChange={(e) => setMqttUsername(e.target.value)}
                      placeholder="MQTT Username"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>
                      Password
                    </label>
                    <input
                      type="password"
                      value={mqttPassword}
                      onChange={(e) => setMqttPassword(e.target.value)}
                      placeholder="MQTT Password"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* X.509 TYPE */}
              {credentialsType === 'X509' && (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>
                    RSA Certificate Fingerprint / CN
                  </label>
                  <textarea
                    rows={3}
                    placeholder="SHA-256 certificate fingerprint or Common Name..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>
              )}

              {/* MQTT Connection Command Preview */}
              <div
                style={{
                  background: '#1e293b',
                  color: '#e2e8f0',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              >
                <div style={{ color: '#38bdf8', fontWeight: 600, marginBottom: '6px' }}>
                  📡 Live Test Command (Mosquitto MQTT):
                </div>
                <code style={{ wordBreak: 'break-all', display: 'block', color: '#4ade80' }}>
                  mosquitto_pub -h localhost -p 1883 -u "{accessToken}" -t "v1/devices/me/telemetry" -m '&#123;"temperature": 24.5, "humidity": 58&#125;'
                </code>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '16px 24px',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {step === 1 ? (
            <div />
          ) : (
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{
                padding: '8px 18px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Back
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {step === 1 && (
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #bfdbfe',
                  background: '#eff6ff',
                  color: '#2563EB',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginRight: 'auto',
                }}
              >
                Next: Credentials
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                background: 'transparent',
                color: '#64748b',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: '8px 24px',
                borderRadius: '6px',
                border: 'none',
                background: '#2563EB', // RadioGeet Royal Blue
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Creating...' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
