import { useAuth } from '../hooks/useAuth.js'
import { applyDiscount } from '../lib/pricing.js'

export const useDiscountedTotal = (total) => {
  const { user } = useAuth()
  const discount = user?.discount || 0
  const discounted = discount > 0 ? applyDiscount(total, discount) : total
  return { discount, discounted }
}

export const OrderTotal = ({ total, size = 'md' }) => {
  const { discount, discounted } = useDiscountedTotal(total)
  const valueClass = size === 'lg' ? 'text-2xl' : 'text-xl'

  return (
    <div className="flex items-start justify-between gap-2">
      <span className="pt-1 text-text-muted">Разом до сплати:</span>
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
          {discounted} ₴
        </span>
      </div>
    </div>
  )
}
