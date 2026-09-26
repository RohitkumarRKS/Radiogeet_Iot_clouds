export default function Pagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.ceil(total / pageSize);
  return (
    <div className="data-table-pagination">
      <span>{total} total items</span>
      <div className="data-table-pagination-controls">
        <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => onPageChange(page - 1)}>Previous</button>
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          Page {page + 1} of {totalPages || 1}
        </span>
        <button className="btn btn-ghost btn-sm" disabled={(page + 1) >= totalPages} onClick={() => onPageChange(page + 1)}>Next</button>
      </div>
    </div>
  );
}
