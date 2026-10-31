import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { useCity } from '../hooks/useCity.js'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock.js'
import { WORKING_HOURS, isWorkingHoursNow } from '../lib/constants.js'
import { SadFaceIcon } from './icons.jsx'

const SEEN_KEY = 'susidy_closed_notice_seen'

const wasSeenThisSession = () => {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}

// Outside 11:00–22:00 (Kyiv time) a visitor is told the restaurant is
// closed but can still order — it'll be handled as soon as it opens. Shown
// once per browser session, never in the admin panel, and only after the
// city has been picked so it doesn't stack on top of the city modal.
export const ClosedHoursModal = () => {
  const { t } = useTranslation()
  const { city } = useCity()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(() => !isWorkingHoursNow() && !wasSeenThisSession())
  const visible = open && Boolean(city) && !pathname.startsWith('/admin')

  useBodyScrollLock(visible)

  const close = () => {
    setOpen(false)
    try {
      sessionStorage.setItem(SEEN_KEY, '1')
    } catch {
      // storage unavailable (private mode) — it just shows again next load
    }
  }

  useEffect(() => {
    if (!visible) return
    const onKeyDown = (e) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [visible])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <button
        type="button"
        aria-label={t('closedHours.ok')}
        onClick={close}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="closed-hours-title"
        className="relative w-full max-w-sm rounded-3xl border border-border bg-surface p-6 text-center animate-fade-in"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <SadFaceIcon className="h-10 w-10" />
        </div>
        <h2 id="closed-hours-title" className="mb-2 text-xl font-extrabold">
          {t('closedHours.title')}
        </h2>
        <p className="text-sm text-text-muted">
          {t('closedHours.message', { hours: WORKING_HOURS })}
        </p>
        <button
          type="button"
          onClick={close}
          className="mt-6 w-full rounded-full bg-primary py-3 font-semibold text-black transition hover:bg-primary-light"
        >
          {t('closedHours.ok')}
        </button>
      </div>
    </div>
  )
}
