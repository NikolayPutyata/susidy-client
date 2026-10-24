import { useTranslation } from 'react-i18next'

const pageButtonClass = (active) =>
  `min-w-[2.25rem] rounded-xl px-2.5 py-1.5 text-sm font-medium transition ${
    active
      ? 'bg-primary text-black'
      : 'bg-surface text-text-muted hover:bg-surface-hover hover:text-text'
  }`

const navButtonClass =
  'rounded-xl bg-surface px-3 py-1.5 text-sm font-medium text-text-muted transition hover:bg-surface-hover hover:text-text disabled:opacity-40 disabled:hover:bg-surface'

const getPageNumbers = (page, totalPages) => {
  const windowSize = 5
  const start = Math.max(1, Math.min(page - 2, totalPages - windowSize + 1))
  const end = Math.min(totalPages, start + windowSize - 1)

  const numbers = []
  for (let i = Math.max(1, start); i <= end; i++) numbers.push(i)
  return numbers
}

export const Pagination = ({
  page,
  totalPages,
  onPageChange,
  perPage,
  perPageOptions,
  onPerPageChange,
}) => {
  const { t } = useTranslation()
  if (totalPages <= 1 && !perPageOptions) return null

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      {totalPages > 1 ? (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            className={navButtonClass}
          >
            «
          </button>
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className={navButtonClass}
          >
            ‹
          </button>
          {getPageNumbers(page, totalPages).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onPageChange(n)}
              className={pageButtonClass(n === page)}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className={navButtonClass}
          >
            ›
          </button>
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            className={navButtonClass}
          >
            »
          </button>
        </div>
      ) : (
        <span />
      )}

      {perPageOptions && (
        <label className="flex items-center gap-2 text-sm text-text-muted">
          {t('pagination.showPerPage')}
          <select
            value={perPage}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
            className="rounded-xl border border-border bg-surface-raised px-2.5 py-1.5 text-text outline-none focus:border-primary"
          >
            {perPageOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  )
}
