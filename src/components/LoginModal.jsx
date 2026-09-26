import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { getErrorMessage } from '../lib/errors.js'
import { CloseIcon, SpinnerIcon } from './icons.jsx'

const inputClass =
  'w-full rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-text placeholder:text-text-subtle outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30'

export const LoginModal = ({ open, onClose }) => {
  const { login } = useAuth()
  const [form, setForm] = useState({ phoneNumber: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!open) return null

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await login(form)
      onClose()
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
          onClick={onClose}
          aria-label="Закрити"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition hover:bg-surface-hover hover:text-text"
        >
          <CloseIcon className="h-4.5 w-4.5" />
        </button>

        <h2 className="mb-5 text-center text-xl font-bold">Вхід в акаунт</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <Link to="/register" onClick={onClose} className="text-primary-light underline">
            Зареєструватися
          </Link>
        </p>
      </div>
    </div>
  )
}
