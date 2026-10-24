// Matches the rounding done server-side in createOrder (susidy-server
// src/services/cart.js) so the price shown before checkout matches the
// price actually charged.
export const applyDiscount = (total, discount = 0) =>
  Math.round(total * (1 - discount / 100) * 100) / 100

export const FREE_DELIVERY_THRESHOLD = 700
export const DELIVERY_FEE = 150

// Sauce/ginger/wasabi (addonType set) never count as "main" products —
// not toward the free-delivery threshold, and not toward the >2-units
// weight-display threshold either. Mirrors the same filter server-side
// in createOrder.
const isMainItem = (item) => !item.addonType

export const getMainItemsTotal = (items) =>
  items
    .filter(isMainItem)
    .reduce((sum, item) => sum + item.quantity * item.price, 0)

// Delivery is always free for pickup, and free once the main-item total
// (after discount, before the fee itself) reaches the threshold — paid
// addons never help reach it. Matches services/cart.js::createOrder.
export const getDeliveryFee = (items, fulfillment, discount = 0) => {
  if (fulfillment !== 'delivery') return 0
  const mainTotal = applyDiscount(getMainItemsTotal(items), discount)
  return mainTotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
}

// How much more (in main-item value) the customer needs to add to unlock
// free delivery — 0 once they're already there or not on a delivery order.
export const getAmountToFreeDelivery = (items, fulfillment, discount = 0) => {
  if (fulfillment !== 'delivery') return 0
  const mainTotal = applyDiscount(getMainItemsTotal(items), discount)
  return Math.max(0, FREE_DELIVERY_THRESHOLD - mainTotal)
}

// Total units of main products only — this, not the number of cart lines,
// is what the >2 threshold for showing total weight is based on.
export const getMainItemsUnitCount = (items) =>
  items
    .filter(isMainItem)
    .reduce((sum, item) => sum + item.quantity, 0)

export const getTotalWeight = (items) =>
  items
    .filter(isMainItem)
    .reduce((sum, item) => sum + (item.weight || 0) * item.quantity, 0)

export const shouldShowWeight = (items) => getMainItemsUnitCount(items) > 2

export const formatWeight = (grams) => `${grams.toLocaleString('uk-UA')} г`
