import { useTranslation } from 'react-i18next'
import { FlagGBIcon, FlagUAIcon } from './icons.jsx'

const LANGUAGES = [
  { code: 'uk', Flag: FlagUAIcon },
  { code: 'en', Flag: FlagGBIcon },
]

// Compact flag toggle — switching updates every translated string
// instantly (no reload) and i18next-browser-languagedetector persists the
// choice to localStorage on its own, so it's restored on the next visit.
// Never touches cart/city/auth state, so none of that is affected by a
// language switch.
export const LanguageSwitcher = ({ className = '' }) => {
  const { t, i18n } = useTranslation()
  const current = i18n.language?.startsWith('en') ? 'en' : 'uk'

  return (
    <div
      role="group"
      aria-label={t('language.label')}
      className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-raised px-1.5 lg:px-2 ${className}`}
    >
      {LANGUAGES.map(({ code, Flag }) => {
        const active = current === code
        return (
          <button
            key={code}
            type="button"
            onClick={() => i18n.changeLanguage(code)}
            aria-label={t(`language.${code}`)}
            aria-pressed={active}
            title={t(`language.${code}`)}
            className={`flex h-5 w-5 items-center justify-center rounded-full transition lg:h-7 lg:w-7 ${
              active
                ? 'ring-2 ring-primary ring-offset-1 ring-offset-surface-raised'
                : 'opacity-50 grayscale-[40%] hover:opacity-100 hover:grayscale-0'
            }`}
          >
            <Flag className="h-full w-full rounded-full" />
          </button>
        )
      })}
    </div>
  )
}
