import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export const NotFoundPage = () => {
  const { t } = useTranslation()
  return (
  <div className="flex flex-col items-center justify-center gap-3 px-4 py-24 text-center">
    <p className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-6xl font-extrabold text-transparent">
      404
    </p>
    <p className="text-text-muted">{t('notFound.message')}</p>
    <Link
      to="/"
      className="mt-2 rounded-full bg-primary px-5 py-2 font-semibold text-black transition hover:bg-primary-light"
    >
      {t('header.home')}
    </Link>
  </div>
  )
}
