import { useState } from 'react';
import { FileText, Plus, Download, Calendar, CheckCircle } from 'lucide-react';

export default function ReportingPage() {
  const [reports, setReports] = useState([
    { id: 'rep-1', name: 'Monthly Energy Consumption Report', format: 'PDF', schedule: 'Monthly (1st day)', lastGenerated: '2026-09-01' },
    { id: 'rep-2', name: 'Weekly Alarm & Critical Audit Summary', format: 'CSV', schedule: 'Weekly (Monday)', lastGenerated: '2026-09-18' },
  ]);

  const handleExport = (name, format) => {
    alert(`Generating ${format} report for "${name}"... Download will start automatically.`);
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reporting & Exports</h1>
          <p className="page-subtitle">Schedule automated PDF/CSV telemetry reports and export audit logs</p>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr><th>Report Name</th><th>Export Format</th><th>Recurrence Schedule</th><th>Last Generated</th><th style={{ width: 120 }}>Actions</th></tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr key={r.id}>
                <td style={{ fontWeight: 500 }}>{r.name}</td>
                <td><span className="badge badge-info">{r.format}</span></td>
                <td><span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {r.schedule}</span></td>
                <td style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)' }}>{r.lastGenerated}</td>
                <td>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleExport(r.name, r.format)}>
                    <Download size={14} /> Export
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
