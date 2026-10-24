import { useTranslation } from 'react-i18next'
import { SpinnerIcon } from './icons.jsx'

// Shown in place of a page's/section's content while its request is
// pending, then swapped for the real content once it arrives. The
// className sets a height close to the content it stands in for, so the
// layout below it (other sections, the footer) doesn't jump on load.
export const ContentLoader = ({ className = 'min-h-[50vh]' }) => {
  const { t } = useTranslation()
  return (
    <div role="status" className={`flex items-center justify-center ${className}`}>
      <SpinnerIcon className="h-8 w-8 animate-spin text-primary" />
      <span className="sr-only">{t('common.loading')}</span>
    </div>
  )
}
