// Mirrors susidy-server's src/utils/addons.js exactly — same category
// rules and recompute algorithm, so the guest (local) cart behaves
// identically to what the server does for an authenticated cart.
export const ADDON_TYPES = ['sauce', 'ginger', 'wasabi']

const SET_CATEGORIES = new Set(['sets'])
const ROLL_LIKE_CATEGORIES = new Set([
  'rolls',
  'hotRolls',
  'bigRolls',
  'maki',
  'sushi',
  'hunkans',
])

const freeUnitsPerItem = (category) => {
  if (SET_CATEGORIES.has(category)) return 4
  if (ROLL_LIKE_CATEGORIES.has(category)) return 1
  return 0
}

// Recomputes free-vs-paid sauce/ginger/wasabi quantities from the current
// main items, shifting each addon line by the CHANGE in free allowance
// (delta) rather than resetting it — see the server-side twin for the
// full rationale. Only call this after a main item changes; a direct
// edit of an addon line is always a no-op here (delta 0), and removing
// an addon line down to zero must never be resurrected by calling this
// afterward — that guard lives at the call site, not in this function.
export const recomputeAddons = (items, addonCatalog) => {
  const freeTotals = { sauce: 0, ginger: 0, wasabi: 0 }
  for (const item of items) {
    if (item.addonType) continue
    const free = freeUnitsPerItem(item.category) * item.quantity
    for (const type of ADDON_TYPES) freeTotals[type] += free
  }

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
