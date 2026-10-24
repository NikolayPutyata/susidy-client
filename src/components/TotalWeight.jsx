import { useTranslation } from 'react-i18next'
import { getTotalWeight, shouldShowWeight } from '../lib/pricing.js'

// Shown only once there are more than 2 main-product units in the cart —
// sauce/ginger/wasabi addons never count, and items with no weight set
// simply contribute nothing rather than guessing a value.
export const TotalWeight = ({ items }) => {
  const { t } = useTranslation()
  if (!shouldShowWeight(items)) return null
  const weight = getTotalWeight(items)
  if (weight <= 0) return null

  return (
    <p className="text-sm text-text-muted">
      {t('cart.totalWeight', { value: weight.toLocaleString('uk-UA') })}
    </p>
  )
}
