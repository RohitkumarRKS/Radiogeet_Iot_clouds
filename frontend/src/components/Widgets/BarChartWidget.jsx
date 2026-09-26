import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import WidgetWrapper from './WidgetWrapper';
import { CHART_COLORS } from '../../utils/constants';

export default function BarChartWidget({ title, data = [], dataKeys = [], style = {} }) {
  return (
    <WidgetWrapper title={title} style={style}>
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="time" stroke="var(--color-text-tertiary)" fontSize={10} />
            <YAxis stroke="var(--color-text-tertiary)" fontSize={10} />
            <Tooltip contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
            {dataKeys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </WidgetWrapper>
  );
}
