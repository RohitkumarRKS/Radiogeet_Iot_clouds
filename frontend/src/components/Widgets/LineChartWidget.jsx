import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import WidgetWrapper from './WidgetWrapper';
import { CHART_COLORS } from '../../utils/constants';

export default function LineChartWidget({ title, data = [], dataKeys = [], style = {} }) {
  return (
    <WidgetWrapper title={title} style={style}>
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="time" stroke="var(--color-text-tertiary)" fontSize={10} />
            <YAxis stroke="var(--color-text-tertiary)" fontSize={10} />
            <Tooltip contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
            {dataKeys.map((key, i) => (
              <Line key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </WidgetWrapper>
  );
}
