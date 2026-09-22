import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { getErrorMessage } from '../lib/errors.js'
import { Logo } from '../components/Logo.jsx'
import { SpinnerIcon } from '../components/icons.jsx'

const inputClass =
  'w-full rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-text placeholder:text-text-subtle outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30'

export const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ phoneNumber: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const user = await login(form)
      const from = location.state?.from?.pathname
      navigate(from || (user.role === 'admin' ? '/admin' : '/'), {
        replace: true,
      })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm py-8">
      <div className="mb-6 flex justify-center">
        <Logo className="text-xl" />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <h1 className="mb-5 text-center text-xl font-bold">Вхід в акаунт</h1>
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
          <Link to="/register" className="text-primary-light underline">
            Зареєструватися
          </Link>
        </p>
      </div>
    </div>
  )
}
