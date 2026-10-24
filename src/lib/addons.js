// Mirrors susidy-server's src/utils/addons.js exactly — same category
// rules and recompute algorithm, so the guest (local) cart behaves
// identically to what the server does for an authenticated cart.
export const ADDON_TYPES = ['sauce', 'ginger', 'wasabi']

// Having at least one roll-like item or set in the cart unlocks a flat 8
// free units of each addon — doesn't scale with quantity or item count
// (1 roll and 5 sets both grant exactly 8).
const QUALIFYING_CATEGORIES = new Set([
  'rolls',
  'hotRolls',
  'bigRolls',
  'maki',
  'sushi',
  'hunkans',
  'sets',
])

const FREE_ADDON_CAP = 8

// Recomputes free-vs-paid sauce/ginger/wasabi quantities from the current
// main items, shifting each addon line by the CHANGE in free allowance
// (delta) rather than resetting it — see the server-side twin for the
// full rationale. Only call this after a main item changes; a direct
// edit of an addon line is always a no-op here (delta 0), and removing
// an addon line down to zero must never be resurrected by calling this
// afterward — that guard lives at the call site, not in this function.
export const recomputeAddons = (items, addonCatalog) => {
  const qualifies = items.some(
    (item) => !item.addonType && QUALIFYING_CATEGORIES.has(item.category),
  )
  const cap = qualifies ? FREE_ADDON_CAP : 0
  const freeTotals = { sauce: cap, ginger: cap, wasabi: cap }

  const result = []
  const handled = new Set()

  for (const item of items) {
    if (!item.addonType) {
      result.push(item)
      continue
    }
    if (handled.has(item.addonType)) continue
    handled.add(item.addonType)

    const newFree = freeTotals[item.addonType] || 0
    const oldFree = item.freeQuantity || 0
    const delta = newFree - oldFree
    const quantity = Math.max(0, item.quantity + delta)

    if (quantity === 0) continue
    result.push({ ...item, quantity, freeQuantity: Math.min(newFree, quantity) })
  }

  for (const type of ADDON_TYPES) {
    if (handled.has(type)) continue
    const newFree = freeTotals[type] || 0
    if (newFree > 0 && addonCatalog?.[type]) {
      result.push({ ...addonCatalog[type], quantity: newFree, freeQuantity: newFree })
    }
  }

  return result
}

export const getChargeableQuantity = (item) =>
  Math.max(0, item.quantity - (item.freeQuantity || 0))

// Sum of every line's chargeable (non-free) value — the real amount the
// customer is paying for the order, addons included.
export const getChargeableTotal = (items) =>
  items.reduce((sum, item) => sum + getChargeableQuantity(item) * item.price, 0)
