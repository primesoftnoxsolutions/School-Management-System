export default function TablePagination({ page, totalPages, total, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-3 text-sm text-slate-600">
      <span>
        Total: {total} | Page {page} of {totalPages || 1}
      </span>
      <button
        type="button"
        disabled={page <= 1}
        onClick={onPrev}
        className="ref-btn-outline px-3 py-1.5 text-xs disabled:opacity-50"
      >
        Prev
      </button>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={onNext}
        className="ref-btn-outline px-3 py-1.5 text-xs disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
