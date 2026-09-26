import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  User, Mail, Shield, PaintRoller, Bell, Settings as SettingsIcon,
  CreditCard, Save, Send, Key, Lock, CheckCircle2, AlertCircle, RefreshCw,
  Sliders, ExternalLink, Globe, Sparkles, Check, ChevronRight, Zap, Trash2, Plus, Copy, Smartphone, Eye, AlertTriangle, X,
  Download, ArrowUpRight
} from 'lucide-react';

const NOTIFICATION_ROWS = [
  'General',
  'Alarm',
  'Device activity',
  'Entity action',
  'Alarm comment',
  'Rule engine lifecycle event',
  'Alarm assignment',
  'New platform version',
  'Entities limit',
  'Entities limit increase request',
  'Add-on/Feature access request',
  'Add-on/Feature access error',
  'Plan upgrade request',
  'API usage limit',
  'Rule node',
  'Integration lifecycle event',
  'Exceeded rate limits',
  'Edge connection',
  'Edge communication failure',
  'Task processing failure',
  'Resources shortage',
  'User activated',
  'User registered',
  'Report generated',
];

export default function ProfileSettings() {
  const { user, fetchUser, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && t !== activeTab) {
      setActiveTab(t);
    }
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // ---- PROFILE FORM STATE ----
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    countryCode: user?.additionalInfo?.countryCode || 'US',
    phone: user?.additionalInfo?.phone || '',
    language: user?.additionalInfo?.language || 'English (United States)',
    unitSystem: user?.additionalInfo?.unitSystem || 'Auto',
    homeDashboard: user?.additionalInfo?.homeDashboard || 'Overview Dashboard',
    hideHomeDashboardToolbar: user?.additionalInfo?.hideHomeDashboardToolbar ?? true,
    hideChatBot: user?.additionalInfo?.hideChatBot ?? false,
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        countryCode: user.additionalInfo?.countryCode || 'US',
        phone: user.additionalInfo?.phone || '',
        language: user.additionalInfo?.language || 'English (United States)',
        unitSystem: user.additionalInfo?.unitSystem || 'Auto',
        homeDashboard: user.additionalInfo?.homeDashboard || 'Overview Dashboard',
        hideHomeDashboardToolbar: user.additionalInfo?.hideHomeDashboardToolbar ?? true,
        hideChatBot: user.additionalInfo?.hideChatBot ?? false,
      });
    }
  }, [user]);

  // ---- SECURITY STATE ----
  const [jwtToken] = useState(() => localStorage.getItem('token') || 'No token available');
  const [tokenValidUntil] = useState(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return new Date(payload.exp * 1000).toLocaleString();
      }
    } catch { /* ignore */ }
    return 'Unknown';
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  // API Keys state
  const [apiKeys, setApiKeys] = useState([
    { id: 'apk-1', name: 'Production Telemetry Key', key: 'tbk_live_8923a10f92b', created: '2026-09-10' },
    { id: 'apk-2', name: 'Gateway Bridge Secret', key: 'tbk_gw_7419bc301a2', created: '2026-09-15' },
  ]);

  // ---- NOTIFICATION MATRIX STATE ----
  const [matrixState, setMatrixState] = useState(() => {
    const initial = {};
    NOTIFICATION_ROWS.forEach(row => {
      initial[row] = { web: true, email: true, sms: true, mobile: true };
    });
    return initial;
  });

  const [columnMaster, setColumnMaster] = useState({ web: true, email: true, sms: true, mobile: true });

  // Extended Tenant Settings — loaded from backend
  const [mailForm, setMailForm] = useState({
    protocol: 'smtp', host: 'smtp.sendgrid.net', port: 587,
    username: 'apikey', password: '', enableTls: true, enableProxy: false,
    defaultFrom: 'noreply@cloudboard.io', senderName: 'CloudBoard IoT Admin',
    connectionTimeout: 10000, smtpTimeout: 10000,
  });

  const [whiteLabelForm, setWhiteLabelForm] = useState({
    appTitle: 'ThingsBoard Cloud',
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#305680',
    headerBgColor: '#0b132b',
    domainName: '',
    copyrightText: '© 2026 CloudBoard IoT Platform',
    customCss: '',
    showNameVersion: true,
    enableHelpLinks: true,
    platformName: 'ThingsBoard',
    platformVersion: '3.7.1PE',
  });

  const [generalForm, setGeneralForm] = useState({
    baseUrl: 'https://thingsboard.cloud',
    telemetryRetentionDays: 30,
    auditLogRetentionDays: 90,
    maxPayloadKb: 512,
  });

  const [billingInfo, setBillingInfo] = useState({
    currentPlan: 'Free',
    priceMonthly: 0,
    billingCycle: 'Monthly',
    paymentMethod: '',
    billingEmail: '',
    usage: {
      devicesCount: 0, maxDevices: 30,
      telemetryPointsToday: 0, maxTelemetryDaily: 100000,
      activeDashboards: 0, maxDashboards: 10,
      activeRuleChains: 0, maxRuleChains: 5,
      apiCallsToday: 0, maxApiCallsDaily: 50000,
      dataPointsStored: 0, maxDataPointsStored: 10000000,
    },
    invoices: [],
  });

  // Modal States
  const [showApiKeysModal, setShowApiKeysModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTestEmailModal, setShowTestEmailModal] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');

  // Load settings from backend
  useEffect(() => {
    if (!user) return;
    api.get('/settings')
      .then(res => {
        const s = res.data.settings;
        if (s.general) setGeneralForm(s.general);
        if (s.mail) setMailForm(s.mail);
        if (s.whiteLabeling) setWhiteLabelForm(s.whiteLabeling);
        if (s.billing) setBillingInfo(s.billing);
        if (s.notifications?.matrix) {
          setMatrixState(prev => ({ ...prev, ...s.notifications.matrix }));
        }
        if (s.security?.enable2FA !== undefined) {
          setIs2FAEnabled(s.security.enable2FA);
        }
        setSettingsLoaded(true);
      })
      .catch(err => {
        console.error('Failed to load settings:', err);
        setSettingsLoaded(true);
      });
  }, [user]);

  const showNotification = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg({ type: '', text: '' }), 4000);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/auth/user', profileForm);
      await fetchUser();
      showNotification('success', 'Profile information saved successfully!');
    } catch (err) {
      showNotification('error', err?.response?.data?.error || 'Failed to save profile information.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyJWT = () => {
    navigator.clipboard.writeText(jwtToken);
    showNotification('success', 'JWT Token copied to clipboard!');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      showNotification('error', 'Please fill in all password fields');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification('error', 'New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showNotification('error', 'New password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      await api.put('/auth/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      showNotification('success', 'Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showNotification('error', err?.response?.data?.error || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateApiKey = (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    const newKey = {
      id: `apk-${Date.now()}`,
      name: newKeyName,
      key: `tbk_live_${Math.random().toString(36).substring(2, 12)}`,
      created: new Date().toISOString().split('T')[0],
    };
    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
    showNotification('success', `API Key "${newKeyName}" generated successfully!`);
  };

  const handleDeleteApiKey = (id) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
    showNotification('success', 'API Key deleted');
  };

  const handleEnable2FA = async (e) => {
    e.preventDefault();
    if (verificationCode.length < 6) {
      showNotification('error', 'Please enter a valid 6-digit authentication code');
      return;
    }
    setSaving(true);
    try {
      await api.put('/settings/security', { enable2FA: true });
      setIs2FAEnabled(true);
      setShow2FAModal(false);
      showNotification('success', 'Two-Factor Authentication enabled successfully!');
    } catch (err) {
      showNotification('error', 'Failed to enable 2FA');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleColumn = (channel) => {
    const newValue = !columnMaster[channel];
    setColumnMaster(prev => ({ ...prev, [channel]: newValue }));
    setMatrixState(prev => {
      const updated = { ...prev };
      NOTIFICATION_ROWS.forEach(row => {
        updated[row] = { ...updated[row], [channel]: newValue };
      });
      return updated;
    });
  };

  const handleToggleCell = (row, channel) => {
    setMatrixState(prev => ({
      ...prev,
      [row]: {
        ...prev[row],
        [channel]: !prev[row][channel],
      }
    }));
  };

  const handleResetMatrix = () => {
    const reset = {};
    NOTIFICATION_ROWS.forEach(row => {
      reset[row] = { web: true, email: true, sms: true, mobile: true };
    });
    setMatrixState(reset);
    setColumnMaster({ web: true, email: true, sms: true, mobile: true });
    showNotification('success', 'Notification settings reset to defaults');
  };

  const handleSaveMatrix = async () => {
    setSaving(true);
    try {
      await api.put('/settings/notifications', { matrix: matrixState });
      showNotification('success', 'Notification settings saved successfully!');
    } catch (err) {
      showNotification('error', 'Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  // Save mail server settings to backend
  const handleSaveMail = async () => {
    setSaving(true);
    try {
      await api.put('/settings/mail', mailForm);
      showNotification('success', 'Mail server settings saved successfully!');
    } catch (err) {
      showNotification('error', 'Failed to save mail settings');
    } finally {
      setSaving(false);
    }
  };

  // Save white label settings to backend
  const handleSaveWhiteLabel = async () => {
    setSaving(true);
    try {
      await api.put('/settings/whiteLabeling', whiteLabelForm);
      showNotification('success', 'White labeling settings saved successfully!');
    } catch (err) {
      showNotification('error', 'Failed to save branding settings');
    } finally {
      setSaving(false);
    }
  };

  // Send test email via backend
  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    if (!testEmailAddress) {
      showNotification('error', 'Please enter a recipient email');
      return;
    }
    setSaving(true);
    try {
      const res = await api.post('/settings/mail/test', { recipientEmail: testEmailAddress });
      showNotification('success', res.data.message);
      setShowTestEmailModal(false);
      setTestEmailAddress('');
    } catch (err) {
      showNotification('error', err?.response?.data?.message || 'Failed to send test email');
    } finally {
      setSaving(false);
    }
  };

  // Upgrade plan
  const handleUpgradePlan = async () => {
    if (!selectedPlan) return;
    setSaving(true);
    try {
      const res = await api.post('/settings/billing/upgrade', {
        newPlan: selectedPlan,
        billingCycle: billingInfo.billingCycle,
      });
      setBillingInfo(res.data.billing);
      showNotification('success', res.data.message);
      setShowUpgradeModal(false);
    } catch (err) {
      showNotification('error', 'Failed to upgrade plan');
    } finally {
      setSaving(false);
    }
  };

  // Usage bar helper
  const UsageBar = ({ label, current, max, unit, color }) => {
    const pct = max > 0 ? Math.min((current / max) * 100, 100) : 0;
    const isHigh = pct > 80;
    return (
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', marginBottom: 4 }}>
          <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>{label}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: isHigh ? 'var(--color-danger)' : 'var(--color-text-tertiary)' }}>
            {current?.toLocaleString() || 0} / {max?.toLocaleString() || 0} {unit || ''}
          </span>
        </div>
        <div style={{ height: 8, background: 'var(--color-bg-primary)', borderRadius: 999, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            background: isHigh ? 'var(--color-danger)' : (color || 'var(--color-primary)'),
            borderRadius: 999,
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fadeIn">
      {/* Account Breadcrumb Header */}
      <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
        <div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginBottom: 4, fontWeight: 500 }}>
            Account &gt; <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
              {activeTab === 'profile' ? 'Profile' : activeTab === 'security' ? 'Security' : activeTab === 'notifications' ? 'Notification settings' : activeTab === 'mail' ? 'Mail Server' : activeTab === 'whitelabel' ? 'White Labeling' : 'Plan & Billing'}
            </span>
          </div>
          <h1 className="page-title" style={{ fontSize: 'var(--font-size-2xl)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={22} style={{ color: 'var(--color-primary)' }} />
            ThingsBoard Account & Tenant Configuration
          </h1>
        </div>
      </div>

      {statusMsg.text && (
        <div style={{
          padding: '12px 16px', borderRadius: 8, marginBottom: 'var(--space-4)',
          background: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${statusMsg.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`,
          color: statusMsg.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          {statusMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span style={{ fontWeight: 500 }}>{statusMsg.text}</span>
        </div>
      )}

      {/* Main Navigation Sub-Tabs Bar (Matching ThingsBoard Cloud) */}
      <div className="tabs" style={{ marginBottom: 'var(--space-6)', borderBottom: '2px solid var(--color-border)' }}>
        <button className={`tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => handleTabChange('profile')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <User size={16} /> Profile
        </button>
        <button className={`tab ${activeTab === 'security' ? 'active' : ''}`} onClick={() => handleTabChange('security')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Shield size={16} /> Security
        </button>
        <button className={`tab ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => handleTabChange('notifications')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Bell size={16} /> Notification settings
        </button>
        <button className={`tab ${activeTab === 'mail' ? 'active' : ''}`} onClick={() => handleTabChange('mail')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Mail size={16} /> Mail Server
        </button>
        <button className={`tab ${activeTab === 'whitelabel' ? 'active' : ''}`} onClick={() => handleTabChange('whitelabel')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <PaintRoller size={16} /> White Labeling
        </button>
        <button className={`tab ${activeTab === 'billing' ? 'active' : ''}`} onClick={() => handleTabChange('billing')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <CreditCard size={16} /> Plan & Billing
        </button>
      </div>

      {/* ========================================== */}
      {/* SUB-TAB 1: PROFILE                         */}
      {/* ========================================== */}
      {activeTab === 'profile' && (
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 className="card-title" style={{ fontSize: 'var(--font-size-xl)' }}>Profile</h2>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                {profileForm.email}
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
              <div>Last login: <span style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>2026-09-21 18:18:18</span></div>
              <div style={{ marginTop: 4, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('CloudBoard Privacy Policy: All IoT data is encrypted at rest.'); }} style={{ color: 'var(--color-primary)' }}>Privacy Policy</a>
                <a href="#terms" onClick={(e) => { e.preventDefault(); alert('CloudBoard Terms of Use: Standard SaaS SLA.'); }} style={{ color: 'var(--color-primary)' }}>Terms of Use</a>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile}>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Email (Disabled / Read-only) */}
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" value={profileForm.email} disabled style={{ opacity: 0.7, background: 'var(--color-bg-primary)', cursor: 'not-allowed' }} />
              </div>

              {/* First & Last Name */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">First name</label>
                  <input className="form-input" value={profileForm.firstName} onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Last name</label>
                  <input className="form-input" value={profileForm.lastName} onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })} />
                </div>
              </div>

              {/* Phone with Country Selector */}
              <div className="form-group">
                <label className="form-label">Phone</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select className="form-select" style={{ width: 100 }} value={profileForm.countryCode} onChange={(e) => setProfileForm({ ...profileForm, countryCode: e.target.value })}>
                    <option value="US">US (+1)</option>
                    <option value="IN">IN (+91)</option>
                    <option value="UK">UK (+44)</option>
                    <option value="DE">DE (+49)</option>
                    <option value="FR">FR (+33)</option>
                  </select>
                  <input className="form-input" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="+12015550123" />
                </div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: 2 }}>Phone Number in E.164 format, ex. +12015550123</span>
              </div>

              {/* Language & Unit System */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Language</label>
                  <select className="form-select" value={profileForm.language} onChange={(e) => setProfileForm({ ...profileForm, language: e.target.value })}>
                    <option value="English (United States)">English (United States)</option>
                    <option value="Spanish (Español)">Spanish (Español)</option>
                    <option value="German (Deutsch)">German (Deutsch)</option>
                    <option value="French (Français)">French (Français)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Unit system</label>
                  <select className="form-select" value={profileForm.unitSystem} onChange={(e) => setProfileForm({ ...profileForm, unitSystem: e.target.value })}>
                    <option value="Auto">Auto</option>
                    <option value="Metric">Metric (°C, m, kg)</option>
                    <option value="Imperial">Imperial (°F, ft, lbs)</option>
                  </select>
                </div>
              </div>

              {/* Home Dashboard */}
              <div className="form-group">
                <label className="form-label">Home dashboard</label>
                <select className="form-select" value={profileForm.homeDashboard} onChange={(e) => setProfileForm({ ...profileForm, homeDashboard: e.target.value })}>
                  <option value="Overview Dashboard">Overview Dashboard</option>
                  <option value="Energy Monitoring">Energy Monitoring</option>
                  <option value="System Stats">System Stats</option>
                </select>
              </div>

              {/* Checkboxes */}
              <div style={{ display: 'flex', gap: '24px', marginTop: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 'var(--font-size-sm)' }}>
                  <input type="checkbox" checked={profileForm.hideHomeDashboardToolbar} onChange={(e) => setProfileForm({ ...profileForm, hideHomeDashboardToolbar: e.target.checked })} />
                  <span>Hide home dashboard toolbar</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 'var(--font-size-sm)' }}>
                  <input type="checkbox" checked={profileForm.hideChatBot} onChange={(e) => setProfileForm({ ...profileForm, hideChatBot: e.target.checked })} />
                  <span>Hide chat bot</span>
                </label>
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="card-footer" style={{ justifyContent: 'space-between', padding: 'var(--space-4) var(--space-6)' }}>
              <button type="button" className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>Delete user account</button>
              <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '8px 24px' }}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================== */}
      {/* SUB-TAB 2: SECURITY                        */}
      {/* ========================================== */}
      {activeTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* JWT Token Card */}
          <div className="card">
            <div className="card-header"><span className="card-title">JWT token</span></div>
            <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                  Token is valid till <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{tokenValidUntil}</span>
                </div>
              </div>
              <button className="btn btn-primary" onClick={handleCopyJWT}>
                <Copy size={14} /> Copy JWT token
              </button>
            </div>
          </div>

          {/* API Keys Card */}
          <div className="card">
            <div className="card-header" style={{ justifyContent: 'space-between' }}>
              <span className="card-title">API keys</span>
              <button className="btn btn-primary btn-sm" onClick={() => setShowApiKeysModal(true)}>
                <Key size={14} /> Manage API Keys
              </button>
            </div>
            <div className="card-body">
              {apiKeys.length === 0 ? (
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>No active API keys</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {apiKeys.map(k => (
                    <div key={k.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 8, background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{k.name}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{k.key}</div>
                      </div>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteApiKey(k.id)} title="Delete key">
                        <Trash2 size={14} style={{ color: 'var(--color-danger)' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Change Password Card */}
          <div className="card">
            <div className="card-header"><span className="card-title">Change Password</span></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)' }}>
                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label">Current password</label>
                    <input type="password" className="form-input" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New password</label>
                    <input type="password" className="form-input" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm new password</label>
                    <input type="password" className="form-input" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: 'fit-content', marginTop: 4 }}>
                    {saving ? 'Saving...' : 'Save Password'}
                  </button>
                </form>

                {/* Password Requirements Checklist */}
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: 8 }}>Password requirements</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 4 }}>At least:</div>
                  <ul style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', paddingLeft: 18, marginBottom: 12 }}>
                    <li style={{ color: passwordForm.newPassword.length >= 6 ? 'var(--color-success)' : 'inherit' }}>• 6 characters</li>
                    <li style={{ color: /[A-Z]/.test(passwordForm.newPassword) ? 'var(--color-success)' : 'inherit' }}>• 1 uppercase letter</li>
                  </ul>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 4 }}>At most:</div>
                  <ul style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', paddingLeft: 18 }}>
                    <li>• 72 characters</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Two-Factor Authentication Card */}
          <div className="card">
            <div className="card-header"><span className="card-title">Two-factor authentication</span></div>
            <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ maxWidth: '650px' }}>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  Two-factor authentication protects your account from unauthorized access. All you have to do is enter a security code when you log in.
                </p>
                {is2FAEnabled && (
                  <span className="badge badge-success" style={{ marginTop: 8 }}><CheckCircle2 size={12} /> 2FA Protection Enabled</span>
                )}
              </div>
              <button className={`btn ${is2FAEnabled ? 'btn-outline' : 'btn-primary'}`} onClick={() => setShow2FAModal(true)}>
                <Shield size={14} /> {is2FAEnabled ? 'Manage 2FA' : 'Setup Two-factor authentication'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* SUB-TAB 3: NOTIFICATION SETTINGS MATRIX   */}
      {/* ========================================== */}
      {activeTab === 'notifications' && (
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <span className="card-title" style={{ fontSize: 'var(--font-size-xl)' }}>Notification settings</span>
            <button className="btn btn-ghost btn-sm" onClick={handleResetMatrix} style={{ color: 'var(--color-primary)' }}>Reset all settings</button>
          </div>

          <div className="card-body" style={{ padding: 0, overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '320px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--color-danger)' }}>
                      <input type="checkbox" checked={true} readOnly />
                      <span>Type</span>
                    </label>
                  </th>
                  <th style={{ textAlign: 'center', width: '100px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={columnMaster.web} onChange={() => handleToggleColumn('web')} />
                      <span>Web</span>
                    </label>
                  </th>
                  <th style={{ textAlign: 'center', width: '100px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={columnMaster.email} onChange={() => handleToggleColumn('email')} />
                      <span>Email</span>
                    </label>
                  </th>
                  <th style={{ textAlign: 'center', width: '100px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={columnMaster.sms} onChange={() => handleToggleColumn('sms')} />
                      <span>SMS</span>
                    </label>
                  </th>
                  <th style={{ textAlign: 'center', width: '120px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={columnMaster.mobile} onChange={() => handleToggleColumn('mobile')} />
                      <span>Mobile app</span>
                    </label>
                  </th>
                </tr>
              </thead>
              <tbody>
                {NOTIFICATION_ROWS.map((rowName) => {
                  const state = matrixState[rowName] || { web: true, email: true, sms: true, mobile: true };
                  return (
                    <tr key={rowName}>
                      <td style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CheckCircle2 size={16} style={{ color: 'var(--color-primary)' }} />
                        {rowName}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input type="checkbox" checked={state.web} onChange={() => handleToggleCell(rowName, 'web')} style={{ cursor: 'pointer', width: 16, height: 16 }} />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input type="checkbox" checked={state.email} onChange={() => handleToggleCell(rowName, 'email')} style={{ cursor: 'pointer', width: 16, height: 16 }} />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input type="checkbox" checked={state.sms} onChange={() => handleToggleCell(rowName, 'sms')} style={{ cursor: 'pointer', width: 16, height: 16 }} />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input type="checkbox" checked={state.mobile} onChange={() => handleToggleCell(rowName, 'mobile')} style={{ cursor: 'pointer', width: 16, height: 16 }} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="card-footer" style={{ justifyContent: 'flex-end', padding: 'var(--space-4) var(--space-6)' }}>
            <button className="btn btn-primary" onClick={handleSaveMatrix} disabled={saving} style={{ padding: '8px 24px' }}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* SUB-TAB 4: MAIL SERVER (Full SMTP Config)  */}
      {/* ========================================== */}
      {activeTab === 'mail' && (
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <span className="card-title">SMTP Mail Server Settings</span>
            <button className="btn btn-outline btn-sm" onClick={() => { setTestEmailAddress(user?.email || ''); setShowTestEmailModal(true); }}>
              <Send size={14} /> Send Test Email
            </button>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Protocol */}
            <div className="form-group">
              <label className="form-label">Mail transport protocol</label>
              <select className="form-select" value={mailForm.protocol} onChange={(e) => setMailForm({ ...mailForm, protocol: e.target.value })}>
                <option value="smtp">SMTP</option>
                <option value="smtps">SMTPS</option>
              </select>
            </div>

            {/* Host & Port */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">SMTP host *</label>
                <input className="form-input" value={mailForm.host} onChange={(e) => setMailForm({ ...mailForm, host: e.target.value })} placeholder="smtp.gmail.com" />
              </div>
              <div className="form-group">
                <label className="form-label">SMTP port *</label>
                <input className="form-input" type="number" value={mailForm.port} onChange={(e) => setMailForm({ ...mailForm, port: parseInt(e.target.value) || 587 })} />
              </div>
            </div>

            {/* Timeouts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Connection timeout (ms)</label>
                <input className="form-input" type="number" value={mailForm.connectionTimeout} onChange={(e) => setMailForm({ ...mailForm, connectionTimeout: parseInt(e.target.value) || 10000 })} />
              </div>
              <div className="form-group">
                <label className="form-label">SMTP timeout (ms)</label>
                <input className="form-input" type="number" value={mailForm.smtpTimeout} onChange={(e) => setMailForm({ ...mailForm, smtpTimeout: parseInt(e.target.value) || 10000 })} />
              </div>
            </div>

            {/* TLS & Proxy Toggles */}
            <div style={{ display: 'flex', gap: '32px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 'var(--font-size-sm)' }}>
                <input type="checkbox" checked={mailForm.enableTls} onChange={(e) => setMailForm({ ...mailForm, enableTls: e.target.checked })} />
                <span>Enable TLS</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 'var(--font-size-sm)' }}>
                <input type="checkbox" checked={mailForm.enableProxy} onChange={(e) => setMailForm({ ...mailForm, enableProxy: e.target.checked })} />
                <span>Enable proxy</span>
              </label>
            </div>

            {/* Username & Password */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">SMTP username</label>
                <input className="form-input" value={mailForm.username} onChange={(e) => setMailForm({ ...mailForm, username: e.target.value })} placeholder="apikey" />
              </div>
              <div className="form-group">
                <label className="form-label">SMTP password</label>
                <input className="form-input" type="password" value={mailForm.password} onChange={(e) => setMailForm({ ...mailForm, password: e.target.value })} placeholder="Your SMTP password" />
              </div>
            </div>

            {/* Sender Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Sender email *</label>
                <input className="form-input" value={mailForm.defaultFrom} onChange={(e) => setMailForm({ ...mailForm, defaultFrom: e.target.value })} placeholder="noreply@yourdomain.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Sender display name</label>
                <input className="form-input" value={mailForm.senderName} onChange={(e) => setMailForm({ ...mailForm, senderName: e.target.value })} placeholder="CloudBoard IoT Admin" />
              </div>
            </div>
          </div>
          <div className="card-footer" style={{ justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
            <button className="btn btn-primary" onClick={handleSaveMail} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* SUB-TAB 5: WHITE LABELING (Full)           */}
      {/* ========================================== */}
      {activeTab === 'whitelabel' && (
        <div className="card">
          <div className="card-header"><span className="card-title">White Labeling & Custom Branding</span></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Application title</label>
              <input className="form-input" value={whiteLabelForm.appTitle} onChange={(e) => setWhiteLabelForm({ ...whiteLabelForm, appTitle: e.target.value })} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Platform name</label>
                <input className="form-input" value={whiteLabelForm.platformName} onChange={(e) => setWhiteLabelForm({ ...whiteLabelForm, platformName: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Platform version</label>
                <input className="form-input" value={whiteLabelForm.platformVersion} onChange={(e) => setWhiteLabelForm({ ...whiteLabelForm, platformVersion: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Logo URL</label>
                <input className="form-input" value={whiteLabelForm.logoUrl} onChange={(e) => setWhiteLabelForm({ ...whiteLabelForm, logoUrl: e.target.value })} placeholder="https://yourdomain.com/logo.svg" />
              </div>
              <div className="form-group">
                <label className="form-label">Favicon URL</label>
                <input className="form-input" value={whiteLabelForm.faviconUrl} onChange={(e) => setWhiteLabelForm({ ...whiteLabelForm, faviconUrl: e.target.value })} placeholder="https://yourdomain.com/favicon.png" />
              </div>
            </div>

            {/* Color Pickers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Primary color</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={whiteLabelForm.primaryColor} onChange={(e) => setWhiteLabelForm({ ...whiteLabelForm, primaryColor: e.target.value })} style={{ width: 48, height: 36, border: '1px solid var(--color-border)', borderRadius: 6, cursor: 'pointer', padding: 2 }} />
                  <input className="form-input" value={whiteLabelForm.primaryColor} onChange={(e) => setWhiteLabelForm({ ...whiteLabelForm, primaryColor: e.target.value })} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)' }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Header background color</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={whiteLabelForm.headerBgColor} onChange={(e) => setWhiteLabelForm({ ...whiteLabelForm, headerBgColor: e.target.value })} style={{ width: 48, height: 36, border: '1px solid var(--color-border)', borderRadius: 6, cursor: 'pointer', padding: 2 }} />
                  <input className="form-input" value={whiteLabelForm.headerBgColor} onChange={(e) => setWhiteLabelForm({ ...whiteLabelForm, headerBgColor: e.target.value })} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)' }} />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Custom domain name</label>
              <input className="form-input" value={whiteLabelForm.domainName} onChange={(e) => setWhiteLabelForm({ ...whiteLabelForm, domainName: e.target.value })} placeholder="iot.yourdomain.com" />
            </div>

            <div className="form-group">
              <label className="form-label">Copyright text</label>
              <input className="form-input" value={whiteLabelForm.copyrightText} onChange={(e) => setWhiteLabelForm({ ...whiteLabelForm, copyrightText: e.target.value })} />
            </div>

            {/* Toggles */}
            <div style={{ display: 'flex', gap: '32px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 'var(--font-size-sm)' }}>
                <input type="checkbox" checked={whiteLabelForm.showNameVersion} onChange={(e) => setWhiteLabelForm({ ...whiteLabelForm, showNameVersion: e.target.checked })} />
                <span>Show platform name and version</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 'var(--font-size-sm)' }}>
                <input type="checkbox" checked={whiteLabelForm.enableHelpLinks} onChange={(e) => setWhiteLabelForm({ ...whiteLabelForm, enableHelpLinks: e.target.checked })} />
                <span>Enable help links</span>
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">Custom CSS</label>
              <textarea className="form-input" value={whiteLabelForm.customCss} onChange={(e) => setWhiteLabelForm({ ...whiteLabelForm, customCss: e.target.value })} rows={5} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }} placeholder="/* Custom CSS overrides */" />
            </div>

            {/* Color Preview */}
            {whiteLabelForm.primaryColor && (
              <div style={{ padding: 'var(--space-4)', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-bg-primary)' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: 8 }}>Preview</div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 120, height: 36, borderRadius: 6, background: whiteLabelForm.headerBgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 600 }}>Header BG</div>
                  <div style={{ width: 120, height: 36, borderRadius: 6, background: whiteLabelForm.primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 600 }}>Primary</div>
                  <button className="btn" style={{ background: whiteLabelForm.primaryColor, color: '#fff', border: 'none' }}>Sample Button</button>
                </div>
              </div>
            )}
          </div>
          <div className="card-footer" style={{ justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={handleSaveWhiteLabel} disabled={saving}>{saving ? 'Saving...' : 'Save Branding'}</button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* SUB-TAB 6: PLAN & BILLING (Full)           */}
      {/* ========================================== */}
      {activeTab === 'billing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Current Plan */}
          <div className="card">
            <div className="card-header" style={{ justifyContent: 'space-between' }}>
              <span className="card-title">Current Subscription</span>
              <button className="btn btn-primary btn-sm" onClick={() => setShowUpgradeModal(true)}>
                <ArrowUpRight size={14} /> Upgrade Plan
              </button>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-text-primary)' }}>{billingInfo.currentPlan}</div>
                <span className="badge badge-success" style={{ fontSize: 'var(--font-size-xs)' }}>Active</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div style={{ padding: 'var(--space-3)', background: 'var(--color-bg-primary)', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>Monthly price</div>
                  <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>${billingInfo.priceMonthly}</div>
                </div>
                <div style={{ padding: 'var(--space-3)', background: 'var(--color-bg-primary)', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>Billing cycle</div>
                  <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>{billingInfo.billingCycle}</div>
                </div>
                <div style={{ padding: 'var(--space-3)', background: 'var(--color-bg-primary)', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>Payment method</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginTop: 4 }}>{billingInfo.paymentMethod || 'Not configured'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Usage */}
          <div className="card">
            <div className="card-header"><span className="card-title">Resource Usage</span></div>
            <div className="card-body">
              <UsageBar label="Devices" current={billingInfo.usage?.devicesCount} max={billingInfo.usage?.maxDevices} color="#2563EB" />
              <UsageBar label="Dashboards" current={billingInfo.usage?.activeDashboards} max={billingInfo.usage?.maxDashboards} color="#7C3AED" />
              <UsageBar label="Rule Chains" current={billingInfo.usage?.activeRuleChains} max={billingInfo.usage?.maxRuleChains} color="#10B981" />
              <UsageBar label="Telemetry Points (Today)" current={billingInfo.usage?.telemetryPointsToday} max={billingInfo.usage?.maxTelemetryDaily} unit="pts" color="#F59E0B" />
              <UsageBar label="API Calls (Today)" current={billingInfo.usage?.apiCallsToday} max={billingInfo.usage?.maxApiCallsDaily} unit="calls" color="#06B6D4" />
            </div>
          </div>

          {/* Invoice History */}
          <div className="card">
            <div className="card-header"><span className="card-title">Invoice History</span></div>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th style={{ width: 80 }}>Download</th>
                  </tr>
                </thead>
                <tbody>
                  {(billingInfo.invoices || []).length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--color-text-tertiary)' }}>No invoices yet</td></tr>
                  ) : (
                    (billingInfo.invoices || []).map((inv) => (
                      <tr key={inv.id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)' }}>{inv.id}</td>
                        <td>{inv.date}</td>
                        <td style={{ fontWeight: 600 }}>{inv.amount}</td>
                        <td><span className={`badge ${inv.status === 'Paid' ? 'badge-success' : 'badge-info'}`}>{inv.status}</span></td>
                        <td>
                          <button className="btn btn-ghost btn-sm" title="Download Invoice">
                            <Download size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODALS                                     */}
      {/* ========================================== */}

      {/* MODAL: API Keys Management */}
      {showApiKeysModal && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <span className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Key size={18} style={{ color: 'var(--color-primary)' }} />
                Manage API Keys
              </span>
              <button className="modal-close" onClick={() => setShowApiKeysModal(false)}>×</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <form onSubmit={handleCreateApiKey} style={{ display: 'flex', gap: 8 }}>
                <input className="form-input" placeholder="New key name (e.g. Mobile App API)" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} required />
                <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>Generate</button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {apiKeys.map(k => (
                  <div key={k.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 8, background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{k.name}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{k.key}</div>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteApiKey(k.id)}>
                      <Trash2 size={14} style={{ color: 'var(--color-danger)' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowApiKeysModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Setup 2FA */}
      {show2FAModal && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <span className="modal-title">Setup Two-Factor Authentication</span>
              <button className="modal-close" onClick={() => setShow2FAModal(false)}>×</button>
            </div>
            <form onSubmit={handleEnable2FA}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', textAlign: 'center' }}>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                  Scan the QR code with your Authenticator App (Google Authenticator, Authy) and enter the 6-digit code.
                </p>
                <div style={{ width: 140, height: 140, margin: '0 auto', background: '#f8fafc', padding: 8, borderRadius: 8, border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=otpauth://totp/CloudBoard:${encodeURIComponent(user?.email || 'admin@cloudboard.io')}?secret=JBSWY3DPEHPK3PXP`} alt="2FA QR Code" width={124} height={124} />
                </div>
                <div className="form-group">
                  <label className="form-label">Verification Code</label>
                  <input className="form-input" placeholder="123456" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} maxLength={6} style={{ textAlign: 'center', letterSpacing: 4, fontFamily: 'var(--font-mono)', fontSize: 18 }} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShow2FAModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Enabling...' : 'Enable 2FA'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete Account Confirmation */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <div className="modal-header">
              <span className="modal-title" style={{ color: 'var(--color-danger)' }}>Delete Account Confirmation</span>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                Are you sure you want to permanently delete your account? This action cannot be undone and will delete all associated IoT devices and rule chains.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => { setShowDeleteModal(false); logout(); }}>Permanently Delete Account</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Send Test Email */}
      {showTestEmailModal && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <div className="modal-header">
              <span className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Send size={18} style={{ color: 'var(--color-primary)' }} />
                Send Test Email
              </span>
              <button className="modal-close" onClick={() => setShowTestEmailModal(false)}>×</button>
            </div>
            <form onSubmit={handleSendTestEmail}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                  A test email will be sent using the current SMTP configuration to verify connectivity.
                </p>
                <div className="form-group">
                  <label className="form-label">Recipient email *</label>
                  <input className="form-input" type="email" value={testEmailAddress} onChange={(e) => setTestEmailAddress(e.target.value)} placeholder="test@yourdomain.com" required autoFocus />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowTestEmailModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Sending...' : 'Send Test Email'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Upgrade Plan */}
      {showUpgradeModal && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <span className="modal-title">Choose a Plan</span>
              <button className="modal-close" onClick={() => setShowUpgradeModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                {[
                  { name: 'Maker', price: 10, devices: 100 },
                  { name: 'Prototype', price: 25, devices: 200 },
                  { name: 'Startup', price: 99, devices: 500 },
                  { name: 'Business', price: 249, devices: 1000 },
                ].map(plan => (
                  <div
                    key={plan.name}
                    onClick={() => setSelectedPlan(plan.name)}
                    style={{
                      padding: 'var(--space-4)',
                      border: `2px solid ${selectedPlan === plan.name ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--border-radius-lg)',
                      cursor: 'pointer',
                      background: selectedPlan === plan.name ? 'rgba(37, 99, 235, 0.05)' : 'var(--color-bg-surface)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', marginBottom: 4 }}>{plan.name}</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-primary)' }}>${plan.price}<span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 400, color: 'var(--color-text-tertiary)' }}>/mo</span></div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginTop: 8 }}>Up to {plan.devices} devices</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowUpgradeModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpgradePlan} disabled={!selectedPlan || saving}>
                {saving ? 'Upgrading...' : `Upgrade to ${selectedPlan || '...'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
