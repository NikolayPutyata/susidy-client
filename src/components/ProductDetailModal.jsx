import { createPortal } from 'react-dom'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock.js'
import { CloseIcon, SpinnerIcon } from './icons.jsx'
import { QuantityStepper } from './QuantityStepper.jsx'

const DetailRow = ({ label, children }) => (
  <div>
    <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-subtle">
      {label}
    </h3>
    <p className="whitespace-pre-line text-sm text-text-muted">{children}</p>
  </div>
)

// Purely presentational — all cart state/handlers come from ProductCard,
// which is the single source of truth for this product's quantity/busy
// state (avoids a second, separate useCart-driven copy of the same thing).
export const ProductDetailModal = ({
  product,
  open,
  onClose,
  price,
  quantity,
  busy,
  onAdd,
  onIncrease,
  onDecrease,
}) => {
  useBodyScrollLock(open)

  if (!open) return null

  // Portalled to <body> — ProductCard (and this modal with it) can be
  // rendered inside a Swiper slide (e.g. the "Обирають найчастіше"
  // carousel), and Swiper applies a CSS transform to its slides for
  // positioning. A transform on any ancestor turns position:fixed
  // descendants into positioning relative to that ancestor instead of the
  // viewport, which trapped this modal inside the carousel slide's box.
  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-y-auto rounded-3xl border border-border bg-surface p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Закрити"
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-text backdrop-blur-sm transition hover:bg-black/70"
        >
          <CloseIcon className="h-4.5 w-4.5" />
        </button>

        <div className="-mx-5 -mt-5 mb-4 aspect-[4/3] shrink-0 bg-black">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-text-subtle">
              <span className="text-4xl">🍣</span>
            </div>
          )}
        </div>

        <h2 className="mb-1 text-xl font-bold">{product.name}</h2>
        {product.weight > 0 && (
          <p className="mb-3 text-sm text-text-subtle">{product.weight} г</p>
        )}

        {(product.proteins || product.fats || product.carbs) && (
          <div className="mb-3">
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-subtle">
              БЖУ на 100г
            </h3>
            <div className="flex gap-4 rounded-xl border border-border bg-surface-raised px-3.5 py-2.5 text-sm">
              <span>
                <span className="text-text-subtle">Білки </span>
                {product.proteins ?? '—'} г
              </span>
              <span>
                <span className="text-text-subtle">Жири </span>
                {product.fats ?? '—'} г
              </span>
              <span>
                <span className="text-text-subtle">Вуглеводи </span>
                {product.carbs ?? '—'} г
              </span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {product.description && <DetailRow label="Опис">{product.description}</DetailRow>}
          {product.composition && <DetailRow label="Склад">{product.composition}</DetailRow>}
          {product.allergens && <DetailRow label="Алергени">{product.allergens}</DetailRow>}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
          <span className="text-xl font-extrabold text-accent">{price} ₴</span>

          {quantity === 0 ? (
            <button
              onClick={onAdd}
              disabled={busy}
              className="flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-primary-light disabled:opacity-60"
            >
              {busy && <SpinnerIcon className="h-4 w-4 animate-spin" />}
              В кошик
            </button>
          ) : (
            <QuantityStepper
              quantity={quantity}
              disabled={busy}
              onDecrease={onDecrease}
              onIncrease={onIncrease}
            />
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
