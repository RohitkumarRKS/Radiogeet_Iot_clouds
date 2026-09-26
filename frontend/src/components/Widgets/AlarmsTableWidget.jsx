import { AlertTriangle } from 'lucide-react';
import WidgetWrapper from './WidgetWrapper';

const severityColors = {
  CRITICAL: 'badge-critical', MAJOR: 'badge-major', MINOR: 'badge-minor',
  WARNING: 'badge-warning', INDETERMINATE: 'badge-inactive',
};

export default function AlarmsTableWidget({ title, alarms = [], style = {} }) {
  return (
    <WidgetWrapper title={title || 'Recent Alarms'} style={style}>
      {alarms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-tertiary)' }}>
          <AlertTriangle size={24} style={{ margin: '0 auto var(--space-2)', opacity: 0.5 }} />
          <div style={{ fontSize: 'var(--font-size-sm)' }}>No active alarms</div>
        </div>
      ) : (
        <table className="data-table" style={{ fontSize: 'var(--font-size-sm)' }}>
          <thead><tr><th>Severity</th><th>Type</th><th>Status</th><th>Time</th></tr></thead>
          <tbody>
            {alarms.slice(0, 5).map(a => (
              <tr key={a.id}>
                <td><span className={`badge ${severityColors[a.severity]}`}>{a.severity}</span></td>
                <td>{a.type}</td>
                <td><span className={`badge ${a.status.includes('ACTIVE') ? 'badge-danger' : 'badge-success'}`}>{a.status.replace(/_/g, ' ')}</span></td>
                <td style={{ color: 'var(--color-text-tertiary)' }}>{new Date(a.startTs).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </WidgetWrapper>
  );
}
