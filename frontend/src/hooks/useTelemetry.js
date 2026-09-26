import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

/**
 * Hook to fetch historical telemetry and format it for Recharts.
 * @param {string} entityId - Device or asset ID
 * @param {object} options - { keys, startTs, endTs, limit }
 */
export function useTelemetry(entityId, options = {}) {
  const [data, setData] = useState({});
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { keys, startTs, endTs, limit = 500 } = options;

  const fetchTelemetry = useCallback(async () => {
    if (!entityId) return;
    setLoading(true);
    setError(null);

    try {
      const params = {};
      if (keys) params.keys = Array.isArray(keys) ? keys.join(',') : keys;
      if (startTs) params.startTs = startTs;
      if (endTs) params.endTs = endTs;
      if (limit) params.limit = limit;

      const res = await api.get(`/telemetry/${entityId}/timeseries`, { params });
      const grouped = res.data;
      setData(grouped);

      // Build chart-compatible data (merged by timestamp)
      const allTimestamps = new Set();
      Object.values(grouped).forEach(arr =>
        arr.forEach(p => allTimestamps.add(p.ts))
      );

      const sorted = [...allTimestamps].sort((a, b) => a - b);
      const chart = sorted.map(ts => {
        const point = {
          ts,
          time: new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        Object.entries(grouped).forEach(([key, arr]) => {
          const found = arr.find(p => p.ts === ts);
          if (found) point[key] = parseFloat(found.value.toFixed(2));
        });
        return point;
      });

      setChartData(chart);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [entityId, keys, startTs, endTs, limit]);

  useEffect(() => {
    fetchTelemetry();
  }, [fetchTelemetry]);

  return { data, chartData, loading, error, refetch: fetchTelemetry };
}

export default useTelemetry;
