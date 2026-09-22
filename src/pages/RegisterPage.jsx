import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { getErrorMessage } from '../lib/errors.js'
import { Logo } from '../components/Logo.jsx'
import { SpinnerIcon } from '../components/icons.jsx'

const inputClass =
  'w-full rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-text placeholder:text-text-subtle outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30'

export const RegisterPage = () => {
  const { register, login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    password: '',
    city: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await register(form)
      await login({ email: form.email, password: form.password })
      navigate('/', { replace: true })
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
        <h1 className="mb-5 text-center text-xl font-bold">Реєстрація</h1>
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
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
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
          <Link to="/login" className="text-primary-light underline">
            Увійти
          </Link>
        </p>
      </div>
    </div>
  )
}
