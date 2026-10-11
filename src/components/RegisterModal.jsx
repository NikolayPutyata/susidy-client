import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import { useModals } from '../hooks/useModals.js'
import { getErrorMessage } from '../lib/errors.js'
import { CloseIcon, SpinnerIcon } from './icons.jsx'

const inputClass =
  'w-full rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-text placeholder:text-text-subtle outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30'

const emptyForm = { name: '', phoneNumber: '', password: '', city: '' }

export const RegisterModal = () => {
  const { register, login } = useAuth()
  const { registerOpen: open, closeRegister, openLogin } = useModals()
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Так само як LoginModal — компонент не розмонтовується, тож чистимо
  // форму щоразу, коли модалка знову відкривається.
  useEffect(() => {
    if (open) {
      setForm(emptyForm)
      setError('')
    }
  }, [open])

  if (!open) return null

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await register(form)
      await login({ phoneNumber: form.phoneNumber, password: form.password })
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
          onClick={closeRegister}
          aria-label="Закрити"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition hover:bg-surface-hover hover:text-text"
        >
          <CloseIcon className="h-4.5 w-4.5" />
        </button>

        <h2 className="mb-5 text-center text-xl font-bold">Реєстрація</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ім'я"
            required
            minLength={3}
            className={inputClass}
          />
          <input
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            required
            pattern="[0-9]{10}"
            placeholder="Телефон, 0991234567"
            className={inputClass}
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Пароль"
            required
            className={inputClass}
          />
          <select
            name="city"
            value={form.city}
            onChange={handleChange}
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
          <button
            type="button"
            onClick={openLogin}
            className="text-primary-light underline"
          >
            Увійти
          </button>
        </p>
      </div>
    </div>
  )
}
