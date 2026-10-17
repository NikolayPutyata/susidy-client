import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import { useModals } from '../hooks/useModals.js'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock.js'
import { getErrorMessage } from '../lib/errors.js'
import { CloseIcon, SpinnerIcon } from './icons.jsx'

const inputClass =
  'w-full rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-text placeholder:text-text-subtle outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30'

const emptyLoginForm = { phoneNumber: '', password: '' }
const emptyRegisterForm = { name: '', phoneNumber: '', password: '', city: '' }

// Login and register used to be two separate modal components — switching
// between them (via "Зареєструватися" / "Увійти") unmounted one full
// overlay and mounted a different one in its place, which visibly flashed
// even though the two states change atomically in the store. One shared
// wrapper here instead: it only (un)mounts when both are closed, so
// switching mode just swaps the form fields inside it, no flash.
export const AuthModal = () => {
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
    try {
      await register(registerForm)
      await login({ phoneNumber: registerForm.phoneNumber, password: registerForm.password })
      closeRegister()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl border border-border bg-surface p-6">
        <button
          onClick={close}
          aria-label="Закрити"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition hover:bg-surface-hover hover:text-text"
        >
          <CloseIcon className="h-4.5 w-4.5" />
        </button>

        {mode === 'login' ? (
          <>
            <h2 className="mb-5 text-center text-xl font-bold">Вхід в акаунт</h2>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <input
                name="phoneNumber"
                value={loginForm.phoneNumber}
                onChange={handleLoginChange}
                required
                pattern="[0-9]{10}"
                placeholder="Телефон, 0991234567"
                className={inputClass}
              />
              <input
                type="password"
                name="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                placeholder="Пароль"
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
                {submitting ? 'Входимо…' : 'Увійти'}
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-text-muted">
              Немає акаунта?{' '}
              <button type="button" onClick={openRegister} className="text-primary-light underline">
                Зареєструватися
              </button>
            </p>
          </>
        ) : (
          <>
            <h2 className="mb-5 text-center text-xl font-bold">Реєстрація</h2>
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <input
                name="name"
                value={registerForm.name}
                onChange={handleRegisterChange}
                placeholder="Ім'я"
                required
                minLength={3}
                className={inputClass}
              />
              <input
                name="phoneNumber"
                value={registerForm.phoneNumber}
                onChange={handleRegisterChange}
                required
                pattern="[0-9]{10}"
                placeholder="Телефон, 0991234567"
                className={inputClass}
              />
              <input
                type="password"
                name="password"
                value={registerForm.password}
                onChange={handleRegisterChange}
                placeholder="Пароль"
                required
                className={inputClass}
              />
              <select
                name="city"
                value={registerForm.city}
                onChange={handleRegisterChange}
                className={inputClass}
              >
                <option value="">Місто (необов'язково)</option>
                <option value="Kyiv">Київ</option>
                <option value="Kharkiv">Харків</option>
              </select>
              {error && <p className="text-sm text-accent">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 font-semibold text-black transition hover:bg-primary-light disabled:opacity-60"
              >
                {submitting && <SpinnerIcon className="h-4 w-4 animate-spin" />}
                {submitting ? 'Реєструємо…' : 'Зареєструватися'}
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-text-muted">
              Вже є акаунт?{' '}
              <button type="button" onClick={openLogin} className="text-primary-light underline">
                Увійти
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
