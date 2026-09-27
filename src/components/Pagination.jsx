export const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  return (
    <div className="mt-4 flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-xl bg-surface px-3 py-1.5 text-sm font-medium text-text-muted transition hover:bg-surface-hover hover:text-text disabled:opacity-40 disabled:hover:bg-surface"
      >
        ← Назад
      </button>
      <span className="text-sm text-text-muted">
        Сторінка {page} з {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-xl bg-surface px-3 py-1.5 text-sm font-medium text-text-muted transition hover:bg-surface-hover hover:text-text disabled:opacity-40 disabled:hover:bg-surface"
      >
        Далі →
      </button>
    </div>
  )
}
