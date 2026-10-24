import { formatWeight, getTotalWeight, shouldShowWeight } from '../lib/pricing.js'

// Shown only once there are more than 2 main-product units in the cart —
// sauce/ginger/wasabi addons never count, and items with no weight set
// simply contribute nothing rather than guessing a value.
export const TotalWeight = ({ items }) => {
  if (!shouldShowWeight(items)) return null
  const weight = getTotalWeight(items)
  if (weight <= 0) return null

  return (
    <p className="text-sm text-text-muted">Загальна вага: {formatWeight(weight)}</p>
  )
}
