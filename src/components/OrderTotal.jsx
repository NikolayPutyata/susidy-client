import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth.js'
import { applyDiscount } from '../lib/pricing.js'

export const useDiscountedTotal = (total) => {
  const { user } = useAuth()
  const discount = user?.discount || 0
  const discounted = discount > 0 ? applyDiscount(total, discount) : total
  return { discount, discounted }
}

// deliveryFee: pass a number to show a separate delivery line and fold it
// into the final total, or leave null (default) to hide that line
// entirely — used for contexts with no fulfillment choice yet (CartDrawer)
// or a pickup order, which never has one.
export const OrderTotal = ({ total, size = 'md', deliveryFee = null }) => {
  const { t } = useTranslation()
  const { discount, discounted } = useDiscountedTotal(total)
  const finalTotal = discounted + (deliveryFee || 0)
  const valueClass = size === 'lg' ? 'text-2xl' : 'text-xl'

  return (
    <div className="space-y-1.5">
      {deliveryFee !== null && (
        <div className="flex items-center justify-between text-sm text-text-muted">
          <span>{t('cart.delivery')}</span>
          <span className={deliveryFee === 0 ? 'font-semibold text-primary-light' : 'text-text'}>
            {deliveryFee === 0 ? t('cart.deliveryFree') : `${deliveryFee} ₴`}
          </span>
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <span className="pt-1 text-text-muted">{t('cart.total')}</span>
        <div className="flex flex-col items-end gap-1">
          {discount > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="text-xs text-text-subtle line-through">{total} ₴</span>
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
                −{discount}%
              </span>
            </span>
          )}
          <span
            className={`${valueClass} font-extrabold ${discount > 0 ? 'text-accent' : 'text-text'}`}
          >
            {finalTotal} ₴
          </span>
        </div>
      </div>
    </div>
  )
}
