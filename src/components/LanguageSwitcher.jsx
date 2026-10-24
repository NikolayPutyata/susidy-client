import { useTranslation } from 'react-i18next'

// Compact UA/EN toggle — switching updates every translated string
// instantly (no reload) and i18next-browser-languagedetector persists the
// choice to localStorage on its own, so it's restored on the next visit.
// Never touches cart/city/auth state, so none of that is affected by a
// language switch.
export const LanguageSwitcher = ({ className = '' }) => {
  const { i18n } = useTranslation()
  const current = i18n.language?.startsWith('en') ? 'en' : 'uk'

  const buttonClass = (lang) =>
    `rounded-full px-2.5 py-1 text-xs font-bold transition ${
      current === lang
        ? 'bg-primary text-black'
        : 'text-text-muted hover:text-text'
    }`

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-full border border-border bg-surface-raised p-0.5 ${className}`}
    >
      <button type="button" onClick={() => i18n.changeLanguage('uk')} className={buttonClass('uk')}>
        UA
      </button>
      <button type="button" onClick={() => i18n.changeLanguage('en')} className={buttonClass('en')}>
        EN
      </button>
    </div>
  )
}
