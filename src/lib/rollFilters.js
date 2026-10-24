// Only the filters explicitly confirmed by the spec. Each `ingredient` is an
// id from the fixed dictionary in ./ingredients.js — the same ids the admin
// picks with chips in the product form — so matching is exact, never
// free-text matching against name/description/composition.
// labelKey points at the `filters.*` namespace in src/i18n/locales/{uk,en}.json
// — the single source for the displayed text, in whichever language is active.
export const ROLL_FILTERS = [
  { id: 'no-cheese', labelKey: 'filters.noCheese', type: 'exclude', ingredient: 'cheese' },
  { id: 'shrimp', labelKey: 'filters.shrimp', type: 'include', ingredient: 'shrimp' },
  { id: 'eel', labelKey: 'filters.eel', type: 'include', ingredient: 'eel' },
  { id: 'salmon', labelKey: 'filters.salmon', type: 'include', ingredient: 'salmon' },
  { id: 'no-mayo', labelKey: 'filters.noMayo', type: 'exclude', ingredient: 'mayo' },
]

const filterById = Object.fromEntries(ROLL_FILTERS.map((f) => [f.id, f]))

// AND across all active filters: every "include" ingredient must be
// present, every "exclude" one absent. A product with no ingredients picked
// at all is unknown rather than "has none", so it's left out of any filtered
// result instead of slipping into "Без сиру" / "Без майонезу".
export const applyRollFilters = (products, activeFilterIds) => {
  if (activeFilterIds.length === 0) return products

  const activeFilters = activeFilterIds.map((id) => filterById[id]).filter(Boolean)

  return products.filter((product) => {
    const ids = product.ingredients || []
    if (ids.length === 0) return false
    return activeFilters.every(({ type, ingredient }) => {
      const has = ids.includes(ingredient)
      return type === 'include' ? has : !has
    })
  })
}
