import WidgetWrapper from './WidgetWrapper';

export default function GaugeWidget({ title, value = 0, min = 0, max = 100, unit = '', style = {} }) {
  const percentage = ((value - min) / (max - min)) * 100;
  const color = percentage > 80 ? 'var(--color-danger)' : percentage > 60 ? 'var(--color-warning)' : 'var(--color-primary)';

  return (
    <WidgetWrapper title={title} style={style}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'var(--space-4)' }}>
        <div style={{ position: 'relative', width: 120, height: 120 }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--color-border)" strokeWidth="8" />
            <circle cx="60" cy="60" r="52" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${(percentage / 100) * 327} 327`} transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dasharray 1s ease' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>{typeof value === 'number' ? value.toFixed(1) : value}</span>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>{unit}</span>
          </div>
        </div>
        <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
          {min}{unit} — {max}{unit}
        </div>
      </div>
    </WidgetWrapper>
  );
}
