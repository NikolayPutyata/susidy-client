// Mirrors susidy-server's src/utils/addons.js exactly — same category
// rules and recompute algorithm, so the guest (local) cart behaves
// identically to what the server does for an authenticated cart.
export const ADDON_TYPES = ['sauce', 'ginger', 'wasabi']

// Each roll-like item earns 1 free unit of every addon, each set earns 4,
// scaling with quantity — capped at 8 free units per addon type.
const SET_CATEGORIES = new Set(['sets'])
const ROLL_LIKE_CATEGORIES = new Set([
  'rolls',
  'hotRolls',
  'bigRolls',
  'maki',
  'sushi',
  'hunkans',
])

const FREE_ADDON_CAP = 8

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
// Always returns main items first, then addons in sauce/ginger/wasabi
// order, so addons never end up listed between dishes.
export const recomputeAddons = (items, addonCatalog) => {
  const earned = items.reduce(
    (sum, item) =>
      item.addonType ? sum : sum + freeUnitsPerItem(item.category) * item.quantity,
    0,
  )
  const free = Math.min(FREE_ADDON_CAP, earned)

  const mainItems = []
  const addonLines = {}
  const handled = new Set()

  for (const item of items) {
    if (!item.addonType) {
      mainItems.push(item)
      continue
    }
    if (handled.has(item.addonType)) continue
    handled.add(item.addonType)

    const oldFree = item.freeQuantity || 0
    const quantity = Math.max(0, item.quantity + free - oldFree)

    if (quantity === 0) continue
    addonLines[item.addonType] = {
      ...item,
      quantity,
      freeQuantity: Math.min(free, quantity),
    }
  }

  for (const type of ADDON_TYPES) {
    if (handled.has(type)) continue
    if (free > 0 && addonCatalog?.[type]) {
      addonLines[type] = { ...addonCatalog[type], quantity: free, freeQuantity: free }
    }
  }

  return [...mainItems, ...ADDON_TYPES.map((type) => addonLines[type]).filter(Boolean)]
}

export const getChargeableQuantity = (item) =>
  Math.max(0, item.quantity - (item.freeQuantity || 0))

// Sum of every line's chargeable (non-free) value — the real amount the
// customer is paying for the order, addons included.
export const getChargeableTotal = (items) =>
  items.reduce((sum, item) => sum + getChargeableQuantity(item) * item.price, 0)
