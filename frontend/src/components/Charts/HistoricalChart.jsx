import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CHART_COLORS } from '../../utils/constants';

/**
 * Historical chart — for viewing past telemetry over a time range.
 */
export default function HistoricalChart({ data = [], dataKeys = [], height = 300 }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="time" stroke="var(--color-text-tertiary)" fontSize={10} tick={{ fill: 'var(--color-text-tertiary)' }} />
          <YAxis stroke="var(--color-text-tertiary)" fontSize={10} tick={{ fill: 'var(--color-text-tertiary)' }} />
          <Tooltip contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }} />
          {dataKeys.map((key, i) => (
            <Line key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
