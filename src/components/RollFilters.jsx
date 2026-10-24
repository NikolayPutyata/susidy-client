import { useTranslation } from 'react-i18next'
import { ROLL_FILTERS } from '../lib/rollFilters.js'
import { CloseIcon } from './icons.jsx'

// Horizontal chip list on purpose for both desktop and phone/tablet — it's
// compact on desktop and scrolls naturally on narrow screens without
// needing a separate panel.
export const RollFilters = ({ activeFilterIds, onToggle, onReset, resultCount }) => {
  const { t } = useTranslation()

  return (
    <div className="mb-4 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {ROLL_FILTERS.map((filter) => {
          const active = activeFilterIds.includes(filter.id)
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => onToggle(filter.id)}
              aria-pressed={active}
              className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                active
                  ? 'border-primary bg-primary text-black'
                  : 'border-border bg-surface-raised text-text-muted hover:text-text'
              }`}
            >
              {t(filter.labelKey)}
            </button>
          )
        })}
        {activeFilterIds.length > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm text-text-subtle underline underline-offset-2 hover:text-text"
          >
            <CloseIcon className="h-3.5 w-3.5" />
            {t('filters.reset')}
          </button>
        )}
      </div>
      {activeFilterIds.length > 0 && (
        <p className="text-xs text-text-subtle">{t('filters.found', { count: resultCount })}</p>
      )}
    </div>
  )
}
