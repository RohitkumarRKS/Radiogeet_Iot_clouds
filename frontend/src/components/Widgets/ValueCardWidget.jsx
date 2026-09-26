import WidgetWrapper from './WidgetWrapper';
export default function ValueCardWidget({ title, value, icon: Icon, color = 'var(--color-primary)', unit = '' }) {
  return (
    <WidgetWrapper>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {Icon && <Icon size={24} style={{ color }} />}
        </div>
        <div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>{value}{unit}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>{title}</div>
        </div>
      </div>
    </WidgetWrapper>
  );
}
