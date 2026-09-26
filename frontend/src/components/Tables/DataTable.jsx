/**
 * Reusable DataTable component.
 */
export default function DataTable({ columns = [], data = [], loading = false, emptyIcon, emptyTitle, emptyDesc, onRowClick }) {
  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} style={col.style}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map((_, j) => (
                  <td key={j}><div className="skeleton" style={{ height: 16, width: '60%' }} /></td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <div className="empty-state">
                  {emptyIcon && <div className="empty-state-icon">{emptyIcon}</div>}
                  <div className="empty-state-title">{emptyTitle || 'No data'}</div>
                  {emptyDesc && <div className="empty-state-desc">{emptyDesc}</div>}
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={row.id || idx} onClick={() => onRowClick?.(row)} style={onRowClick ? { cursor: 'pointer' } : {}}>
                {columns.map(col => (
                  <td key={col.key} style={col.cellStyle}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
