import { AppleIcon, CloseIcon, GoogleIcon } from './icons.jsx'

// Жоден зі способів тут поки не інтегрований — вибір лише показує, що
// буде доступно, коли з'явиться реальна платіжна інтеграція.
export const PaymentMethodModal = ({ open, onClose }) => {
  if (!open) return null

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

        <h2 className="mb-5 text-center text-xl font-bold">Спосіб оплати</h2>

        <div className="space-y-2.5">
          <button
            type="button"
            disabled
            title="Незабаром"
            className="flex w-full items-center justify-center gap-1.5 rounded-full bg-black py-3 text-sm font-semibold text-white opacity-60"
          >
            <AppleIcon className="h-4 w-4" />
            Pay
          </button>
          <button
            type="button"
            disabled
            title="Незабаром"
            className="flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-white py-3 text-sm font-semibold text-black opacity-60"
          >
            <GoogleIcon className="h-4 w-4" />
            Pay
          </button>
          <button
            type="button"
            disabled
            title="Незабаром"
            className="flex w-full items-center justify-center gap-1.5 rounded-full bg-[#6c5ce7] py-3 text-sm font-semibold text-white opacity-60"
          >
            WayForPay
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-text-subtle">
          Онлайн-оплата — незабаром
        </p>
      </div>
    </div>
  )
}
