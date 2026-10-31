import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth.js'
import { useModals } from '../hooks/useModals.js'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock.js'
import { getErrorMessage } from '../lib/errors.js'
import { requestSmsCodeRequest, resetPasswordRequest } from '../api/auth.js'
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
const emptyResetForm = { phoneNumber: '', code: '', password: '' }

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

const SubmitButton = ({ busy, busyLabel, label }) => (
  <button
    type="submit"
    disabled={busy}
    className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 font-semibold text-black transition hover:bg-primary-light disabled:opacity-60"
  >
    {busy && <SpinnerIcon className="h-4 w-4 animate-spin" />}
    {busy ? busyLabel : label}
  </button>
)

// The 6-digit SMS code input plus "resend" (after a cooldown) and "change
// number" — shared by registration and password reset.
const SmsCodeField = ({ phoneNumber, value, onChange, cooldown, onResend, onChangeNumber }) => {
  const { t } = useTranslation()
  return (
    <div className="space-y-2">
      <p className="text-center text-sm text-text-muted">
        {t('auth.codeSentTo', { phone: `+38 ${phoneNumber}` })}
      </p>
      <input
        name="code"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
        required
        pattern="[0-9]{6}"
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder={t('auth.codePlaceholder')}
        className={`${inputClass} text-center text-lg tracking-[0.4em] placeholder:text-base placeholder:tracking-normal`}
      />
      <div className="flex items-center justify-between gap-3 text-sm">
        <button
          type="button"
          onClick={onChangeNumber}
          className="text-text-muted underline underline-offset-2 hover:text-text"
        >
          {t('auth.changeNumber')}
        </button>
        <button
          type="button"
          onClick={onResend}
          disabled={cooldown > 0}
          className="text-primary-light underline underline-offset-2 disabled:text-text-subtle disabled:no-underline"
        >
          {cooldown > 0 ? t('auth.resendIn', { seconds: cooldown }) : t('auth.resendCode')}
        </button>
      </div>
    </div>
  )
}

const LOGIN_STEPS = ['login', 'resetPhone', 'resetCode']
const REGISTER_STEPS = ['form', 'code']

// Login and register used to be two separate modal components — switching
// between them (via "Зареєструватися" / "Увійти") unmounted one full
// overlay and mounted a different one in its place, which visibly flashed
// even though the two states change atomically in the store. One shared
// wrapper here instead: it only (un)mounts when both are closed, so
// switching mode just swaps the form fields inside it, no flash.
//
// Steps inside each mode:
// - register: 'form' → (SMS code sent) → 'code' → account created + login
// - login: 'login', or "Забули пароль?" → 'resetPhone' → (SMS code sent)
//   → 'resetCode' (code + new password) → password reset + login
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
  const [registerCode, setRegisterCode] = useState('')
  const [resetForm, setResetForm] = useState(emptyResetForm)
  const [step, setStep] = useState(null)
  const [cooldown, setCooldown] = useState(0)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useBodyScrollLock(Boolean(mode))

  useEffect(() => {
    if (!mode) return
    setLoginForm(emptyLoginForm)
    setRegisterForm(emptyRegisterForm)
    setRegisterCode('')
    setResetForm(emptyResetForm)
    setStep(null)
    setCooldown(0)
    setError('')
  }, [mode])

  useEffect(() => {
    if (cooldown <= 0) return
    const timeout = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000)
    return () => clearTimeout(timeout)
  }, [cooldown])

  if (!mode) return null

  // `step` is only reset by the effect above after the first render of a
  // new mode — fall back to that mode's first step meanwhile, so switching
  // login ↔ register never flashes the other mode's form.
  const view =
    mode === 'login'
      ? LOGIN_STEPS.includes(step) ? step : 'login'
      : REGISTER_STEPS.includes(step) ? step : 'form'

  const close = mode === 'login' ? closeLogin : closeRegister

  const goTo = (nextStep) => {
    setError('')
    setStep(nextStep)
  }

  const handleLoginChange = (e) =>
    setLoginForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  const handleRegisterChange = (e) =>
    setRegisterForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  const handleResetChange = (e) =>
    setResetForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  // Shared busy-state + error handling for every submit/click below.
  const run = (action) => async (e) => {
    e?.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await action()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const sendCode = async (phoneNumber, purpose) => {
    const { resendIn } = await requestSmsCodeRequest(phoneNumber, purpose)
    setCooldown(resendIn ?? 60)
  }

  const handleLoginSubmit = run(async () => {
    await login(loginForm)
    closeLogin()
  })

  const handleRegisterFormSubmit = run(async () => {
    await sendCode(registerForm.phoneNumber, 'register')
    setRegisterCode('')
    setStep('code')
  })

  const handleRegisterCodeSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    let registered = false
    try {
      await register({ ...registerForm, code: registerCode })
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

  const startReset = () => {
    setResetForm({ ...emptyResetForm, phoneNumber: loginForm.phoneNumber })
    goTo('resetPhone')
  }

  const handleResetPhoneSubmit = run(async () => {
    await sendCode(resetForm.phoneNumber, 'reset')
    setResetForm((prev) => ({ ...prev, code: '' }))
    setStep('resetCode')
  })

  const handleResetSubmit = run(async () => {
    await resetPasswordRequest(resetForm)
    await login({ phoneNumber: resetForm.phoneNumber, password: resetForm.password })
    closeLogin()
  })

  const errorText = error && <p className="text-sm text-accent">{error}</p>

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

        {view === 'login' && (
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
              <div className="-mt-2 text-right">
                <button
                  type="button"
                  onClick={startReset}
                  className="text-sm text-text-muted underline underline-offset-2 hover:text-text"
                >
                  {t('auth.forgotPassword')}
                </button>
              </div>
              {errorText}
              <SubmitButton busy={submitting} busyLabel={t('auth.loggingIn')} label={t('auth.login')} />
            </form>
            <p className="mt-4 text-center text-sm text-text-muted">
              {t('auth.noAccount')}{' '}
              <button type="button" onClick={openRegister} className="text-primary-light underline">
                {t('auth.register')}
              </button>
            </p>
          </>
        )}

        {(view === 'resetPhone' || view === 'resetCode') && (
          <>
            <h2 className="mb-5 text-center text-xl font-bold">{t('auth.resetTitle')}</h2>
            {view === 'resetPhone' ? (
              <form onSubmit={handleResetPhoneSubmit} className="space-y-4">
                <PhoneField value={resetForm.phoneNumber} onChange={handleResetChange} />
                {errorText}
                <SubmitButton busy={submitting} busyLabel={t('auth.sendingCode')} label={t('auth.sendCode')} />
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <SmsCodeField
                  phoneNumber={resetForm.phoneNumber}
                  value={resetForm.code}
                  onChange={(code) => setResetForm((prev) => ({ ...prev, code }))}
                  cooldown={cooldown}
                  onResend={run(() => sendCode(resetForm.phoneNumber, 'reset'))}
                  onChangeNumber={() => goTo('resetPhone')}
                />
                <input
                  type="password"
                  name="password"
                  value={resetForm.password}
                  onChange={handleResetChange}
                  placeholder={t('auth.newPassword')}
                  autoComplete="new-password"
                  required
                  className={inputClass}
                />
                {errorText}
                <SubmitButton busy={submitting} busyLabel={t('auth.saving')} label={t('auth.savePassword')} />
              </form>
            )}
            <p className="mt-4 text-center text-sm text-text-muted">
              <button type="button" onClick={() => goTo('login')} className="text-primary-light underline">
                {t('auth.backToLogin')}
              </button>
            </p>
          </>
        )}

        {(view === 'form' || view === 'code') && (
          <>
            <h2 className="mb-5 text-center text-xl font-bold">{t('auth.registerTitle')}</h2>
            {view === 'form' ? (
              <form onSubmit={handleRegisterFormSubmit} className="space-y-4">
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
                  autoComplete="new-password"
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
                {errorText}
                <SubmitButton busy={submitting} busyLabel={t('auth.sendingCode')} label={t('auth.register')} />
              </form>
            ) : (
              <form onSubmit={handleRegisterCodeSubmit} className="space-y-4">
                <SmsCodeField
                  phoneNumber={registerForm.phoneNumber}
                  value={registerCode}
                  onChange={setRegisterCode}
                  cooldown={cooldown}
                  onResend={run(() => sendCode(registerForm.phoneNumber, 'register'))}
                  onChangeNumber={() => goTo('form')}
                />
                {errorText}
                <SubmitButton busy={submitting} busyLabel={t('auth.registering')} label={t('auth.confirm')} />
              </form>
            )}
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
