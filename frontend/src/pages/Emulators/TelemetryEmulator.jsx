import { useState, useEffect } from 'react';
import { Router, Play, Square, RefreshCw, Zap, Cpu, CheckCircle2 } from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';

export default function TelemetryEmulator() {
  const toast = useToast();
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [intervalSec, setIntervalSec] = useState(3);
  const [dataPointsSent, setDataPointsSent] = useState(0);

  useEffect(() => {
    api.get('/devices').then(r => {
      setDevices(r.data.data || []);
      if (r.data.data?.length > 0) {
        setSelectedDevice(r.data.data[0].id);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    let timer;
    if (isRunning && selectedDevice) {
      timer = setInterval(() => {
        const temp = (20 + Math.random() * 15).toFixed(1);
        const humidity = (40 + Math.random() * 30).toFixed(1);
        const voltage = (215 + Math.random() * 15).toFixed(1);
        const payload = { temperature: parseFloat(temp), humidity: parseFloat(humidity), voltage: parseFloat(voltage) };

        api.post(`/telemetry/${selectedDevice}`, payload)
          .then(() => {
            const devName = devices.find(d => d.id === selectedDevice)?.name || 'Device';
            const logMsg = `[${new Date().toLocaleTimeString()}] Pushed telemetry to ${devName}: temp=${temp}°C, humidity=${humidity}%, voltage=${voltage}V`;
            setLogs(prev => [logMsg, ...prev.slice(0, 49)]);
            setDataPointsSent(prev => prev + 3);
          })
          .catch(err => {
            setLogs(prev => [`[${new Date().toLocaleTimeString()}] Error: ${err.message}`, ...prev.slice(0, 49)]);
          });
      }, intervalSec * 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, selectedDevice, intervalSec, devices]);

  const toggleEmulator = () => {
    if (!selectedDevice) {
      toast.showToast('Please select a target device to run simulator', 'error');
      return;
    }
    if (!isRunning) {
      setIsRunning(true);
      toast.showToast('Telemetry simulator started!', 'success');
    } else {
      setIsRunning(false);
      toast.showToast('Telemetry simulator stopped', 'info');
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Telemetry Emulator</h1>
          <p className="page-subtitle">Real-time IoT sensor telemetry generator and streaming simulator</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 'var(--space-5)' }}>
        {/* Controls Panel */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Simulator Controls</span>
            <Zap size={16} style={{ color: isRunning ? 'var(--color-success)' : 'var(--color-text-tertiary)' }} />
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Target Device</label>
              <select className="form-select" value={selectedDevice} onChange={e => setSelectedDevice(e.target.value)}>
                {devices.length === 0 ? <option value="">No devices found</option> : (
                  devices.map(d => <option key={d.id} value={d.id}>{d.name} ({d.type})</option>)
                )}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Publish Frequency</label>
              <select className="form-select" value={intervalSec} onChange={e => setIntervalSec(Number(e.target.value))}>
                <option value={1}>Every 1 Second</option>
                <option value={3}>Every 3 Seconds</option>
                <option value={5}>Every 5 Seconds</option>
                <option value={10}>Every 10 Seconds</option>
              </select>
            </div>

            <div style={{ padding: 'var(--space-4)', background: 'var(--color-bg-primary)', borderRadius: 8, marginBottom: 'var(--space-5)' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>TOTAL TELEMETRY POINTS</div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-primary-light)' }}>{dataPointsSent}</div>
            </div>

            <button
              className={`btn ${isRunning ? 'btn-danger' : 'btn-primary'}`}
              onClick={toggleEmulator}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {isRunning ? <Square size={16} /> : <Play size={16} />}
              {isRunning ? 'Stop Telemetry Simulator' : 'Start Telemetry Simulator'}
            </button>
          </div>
        </div>

        {/* Live Stream Terminal */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Live Telemetry Output Terminal</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setLogs([])}>Clear Console</button>
          </div>
          <div className="card-body" style={{
            background: '#090d16',
            color: '#10b981',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--font-size-xs)',
            minHeight: 380,
            maxHeight: 500,
            overflowY: 'auto',
            padding: 'var(--space-4)',
            borderRadius: 8,
          }}>
            {logs.length === 0 ? (
              <div style={{ color: 'var(--color-text-tertiary)', textAlign: 'center', marginTop: 100 }}>
                Press "Start Telemetry Simulator" to stream live sensor readings
              </div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} style={{ marginBottom: 4, lineHeight: '1.4' }}>{log}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
