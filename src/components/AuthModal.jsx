import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth.js'
import { useModals } from '../hooks/useModals.js'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock.js'
import { getErrorMessage } from '../lib/errors.js'
import { CloseIcon, SpinnerIcon } from './icons.jsx'

const inputClass =
  'w-full rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-text placeholder:text-text-subtle outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30'

// Right half of a "country code pill + phone input" pair — same visual
// treatment as inputClass, just rounded only on the right so it sits
// flush against the pill.
const phoneInputClass =
  'w-full rounded-r-xl border border-border bg-surface-raised px-4 py-2.5 text-text placeholder:text-text-subtle outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30'

const emptyLoginForm = { phoneNumber: '', password: '' }
const emptyRegisterForm = { name: '', phoneNumber: '', password: '', city: '' }

// "+38" (not the full "+380") sits directly against the existing 10-digit
// input, which still starts with the trunk 0 exactly as before — read
// together they form "+380991234567", the correct international number.
// Purely decorative: the input's value, validation and what gets sent to
// the API are all completely unchanged from before this field existed.
// Ukraine-only on purpose (delivery is Kyiv/Kharkiv only, nothing to
// detect or pick), so it's a static pill, not a country dropdown.
const PhoneField = ({ value, onChange }) => (
  <div className="flex">
    <span className="flex shrink-0 items-center gap-1 rounded-l-xl border border-r-0 border-border bg-surface-raised px-3 text-sm text-text-muted">
      🇺🇦 +38
    </span>
    <input
      name="phoneNumber"
      value={value}
      onChange={onChange}
      required
      pattern="[0-9]{10}"
      placeholder="0991234567"
      className={phoneInputClass}
    />
  </div>
)

// Login and register used to be two separate modal components — switching
// between them (via "Зареєструватися" / "Увійти") unmounted one full
// overlay and mounted a different one in its place, which visibly flashed
// even though the two states change atomically in the store. One shared
// wrapper here instead: it only (un)mounts when both are closed, so
// switching mode just swaps the form fields inside it, no flash.
export const AuthModal = () => {
  const { t } = useTranslation()
  const { login, register } = useAuth()
  const {
    loginOpen,
    registerOpen,
    closeLogin,
    closeRegister,
    openLogin,
    openRegister,
  } = useModals()
  const mode = loginOpen ? 'login' : registerOpen ? 'register' : null
  const [loginForm, setLoginForm] = useState(emptyLoginForm)
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useBodyScrollLock(Boolean(mode))

  useEffect(() => {
    if (!mode) return
    setLoginForm(emptyLoginForm)
    setRegisterForm(emptyRegisterForm)
    setError('')
  }, [mode])

  if (!mode) return null

  const close = mode === 'login' ? closeLogin : closeRegister

  const handleLoginChange = (e) =>
    setLoginForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  const handleRegisterChange = (e) =>
    setRegisterForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await login(loginForm)
      closeLogin()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    let registered = false
    try {
      await register(registerForm)
      registered = true
      await login({ phoneNumber: registerForm.phoneNumber, password: registerForm.password })
      closeRegister()
    } catch (err) {
      // A failure here could be register itself, or the auto-login right
      // after a successful register (e.g. a transient network blip) — the
      // account exists either way in the second case, and re-submitting
      // this same form would now just fail as "phone already taken" with
      // no clue why. Point at the "Увійти" link instead of the generic
      // error for that case.
      setError(registered ? t('auth.registeredLoginFailed') : getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl border border-border bg-surface p-6">
        <button
          onClick={close}
          aria-label={t('cart.close')}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition hover:bg-surface-hover hover:text-text"
        >
          <CloseIcon className="h-4.5 w-4.5" />
        </button>

        {mode === 'login' ? (
          <>
            <h2 className="mb-5 text-center text-xl font-bold">{t('auth.loginTitle')}</h2>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <PhoneField value={loginForm.phoneNumber} onChange={handleLoginChange} />
              <input
                type="password"
                name="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                placeholder={t('auth.password')}
                required
                className={inputClass}
              />
              {error && <p className="text-sm text-accent">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 font-semibold text-black transition hover:bg-primary-light disabled:opacity-60"
              >
                {submitting && <SpinnerIcon className="h-4 w-4 animate-spin" />}
                {submitting ? t('auth.loggingIn') : t('auth.login')}
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-text-muted">
              {t('auth.noAccount')}{' '}
              <button type="button" onClick={openRegister} className="text-primary-light underline">
                {t('auth.register')}
              </button>
            </p>
          </>
        ) : (
          <>
            <h2 className="mb-5 text-center text-xl font-bold">{t('auth.registerTitle')}</h2>
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <input
                name="name"
                value={registerForm.name}
                onChange={handleRegisterChange}
                placeholder={t('auth.name')}
                required
                minLength={3}
                className={inputClass}
              />
              <PhoneField value={registerForm.phoneNumber} onChange={handleRegisterChange} />
              <input
                type="password"
                name="password"
                value={registerForm.password}
                onChange={handleRegisterChange}
                placeholder={t('auth.password')}
                required
                className={inputClass}
              />
              <select
                name="city"
                value={registerForm.city}
                onChange={handleRegisterChange}
                className={inputClass}
              >
                <option value="">{t('auth.cityOptional')}</option>
                <option value="Kyiv">{t('auth.cityKyiv')}</option>
                <option value="Kharkiv">{t('auth.cityKharkiv')}</option>
              </select>
              {error && <p className="text-sm text-accent">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 font-semibold text-black transition hover:bg-primary-light disabled:opacity-60"
              >
                {submitting && <SpinnerIcon className="h-4 w-4 animate-spin" />}
                {submitting ? t('auth.registering') : t('auth.register')}
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-text-muted">
              {t('auth.haveAccount')}{' '}
              <button type="button" onClick={openLogin} className="text-primary-light underline">
                {t('auth.login')}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
