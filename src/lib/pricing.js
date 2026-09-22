// Matches the rounding done server-side in createOrder (susidy-server
// src/services/cart.js) so the price shown before checkout matches the
// price actually charged.
export const applyDiscount = (total, discount = 0) =>
  Math.round(total * (1 - discount / 100) * 100) / 100
