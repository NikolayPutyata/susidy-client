import { getChargeableTotal } from './addons.js'

// Matches the rounding done server-side in createOrder (susidy-server
// src/services/cart.js) so the price shown before checkout matches the
// price actually charged.
export const applyDiscount = (total, discount = 0) =>
  Math.round(total * (1 - discount / 100) * 100) / 100

export const FREE_DELIVERY_THRESHOLD = 700
export const DELIVERY_FEE = 150

// Sauce/ginger/wasabi (addonType set) don't count toward the >=2-units
// weight-display threshold — only main products have a meaningful order
// weight tracked.
const isMainItem = (item) => !item.addonType

// Delivery is always free for pickup, and free once the full chargeable
// order value (after discount, before the fee itself) reaches the
// threshold — paid addon purchases count too, since the customer is
// genuinely paying for them; free addon units don't inflate it, since
// getChargeableTotal already excludes them. Matches
// services/cart.js::createOrder.
export const getDeliveryFee = (items, fulfillment, discount = 0) => {
  if (fulfillment !== 'delivery') return 0
  const total = applyDiscount(getChargeableTotal(items), discount)
  return total >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
}

// How much more the customer needs to add to unlock free delivery — 0
// once they're already there or not on a delivery order.
export const getAmountToFreeDelivery = (items, fulfillment, discount = 0) => {
  if (fulfillment !== 'delivery') return 0
  const total = applyDiscount(getChargeableTotal(items), discount)
  return Math.max(0, FREE_DELIVERY_THRESHOLD - total)
}

// Total units of main products only — this, not the number of cart lines,
// is what the >=2 threshold for showing total weight is based on (a
// single line with quantity 2+ counts too, since this sums quantities).
export const getMainItemsUnitCount = (items) =>
  items
    .filter(isMainItem)
    .reduce((sum, item) => sum + item.quantity, 0)

export const getTotalWeight = (items) =>
  items
    .filter(isMainItem)
    .reduce((sum, item) => sum + (item.weight || 0) * item.quantity, 0)

export const shouldShowWeight = (items) => getMainItemsUnitCount(items) >= 2

export const formatWeight = (grams) => `${grams.toLocaleString('uk-UA')} г`
