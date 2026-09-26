import { useState } from 'react';
import { CreditCard, Check, ShieldCheck, Zap } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function PlanAndBilling() {
  const toast = useToast();
  const [currentPlan, setCurrentPlan] = useState('Professional');

  const plans = [
    {
      name: 'Community',
      price: '$0',
      period: 'forever',
      desc: 'Ideal for IoT hobbyists, prototyping, and small lab deployments',
      features: ['Up to 30 Active Devices', '1,000 Telemetry Points / Day', '1 Dashboard', 'Community Forum Support'],
    },
    {
      name: 'Professional',
      price: '$99',
      period: 'per month',
      popular: true,
      desc: 'Designed for production industrial deployments and smart buildings',
      features: ['Up to 500 Active Devices', 'Unlimited Telemetry & Alarms', 'Unlimited Dashboards', 'Edge Engine & Integrations', 'Priority 24/7 Email Support'],
    },
    {
      name: 'Enterprise',
      price: '$499',
      period: 'per month',
      desc: 'Dedicated cloud instances, white-labeling, and SLA uptime guarantees',
      features: ['Unlimited Devices & Assets', 'Dedicated High-Availability Cluster', 'White-Label Branding', 'Custom SLA Uptime (99.99%)', 'Dedicated Solutions Engineer'],
    },
  ];

  const handleSelectPlan = (planName) => {
    setCurrentPlan(planName);
    toast.showToast(`Switched subscription plan to ${planName}!`, 'success');
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Plan & Billing</h1>
          <p className="page-subtitle">Manage your cloud subscription tier, device quota meters, and billing invoices</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-5)' }}>
        {plans.map(p => (
          <div key={p.name} className="card" style={{
            position: 'relative',
            border: p.name === currentPlan ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
            boxShadow: p.name === currentPlan ? '0 0 20px rgba(59, 130, 246, 0.2)' : 'none',
          }}>
            {p.popular && (
              <div style={{
                position: 'absolute', top: -12, right: 16, background: 'var(--color-primary)',
                color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 12, textTransform: 'uppercase',
              }}>
                Current Active Plan
              </div>
            )}
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 4 }}>{p.name}</h2>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginBottom: 16, height: 32 }}>{p.desc}</p>
              
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--color-text-primary)' }}>{p.price}</span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginLeft: 4 }}>/ {p.period}</span>
              </div>

              <div style={{ flex: 1, marginBottom: 24 }}>
                {p.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--font-size-sm)', marginBottom: 10 }}>
                    <Check size={14} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <button
                className={`btn ${p.name === currentPlan ? 'btn-secondary' : 'btn-primary'}`}
                disabled={p.name === currentPlan}
                onClick={() => handleSelectPlan(p.name)}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {p.name === currentPlan ? 'Active Plan' : `Upgrade to ${p.name}`}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
