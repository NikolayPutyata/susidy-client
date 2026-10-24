import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import uk from './locales/uk.json'
import en from './locales/en.json'

// Ukrainian is the default for every first-time visitor regardless of
// browser/OS language — detection only ever looks at a previously saved
// choice (localStorage), never navigator language or the <html> tag.
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      uk: { translation: uk },
      en: { translation: en },
    },
    fallbackLng: 'uk',
    supportedLngs: ['uk', 'en'],
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
      lookupLocalStorage: 'susidy_language',
    },
    interpolation: { escapeValue: false },
  })

export default i18n
