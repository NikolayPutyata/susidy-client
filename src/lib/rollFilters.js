// Only the filters explicitly confirmed by the spec — composition tags
// not yet confirmed against the real catalog are deliberately left out
// rather than invented. Each `tag` must match (case-insensitively) a
// value in a product's structured `ingredients` array (see the admin
// product form's "Інгредієнти" field) — not free-text matching against
// name/description/composition.
export const ROLL_FILTERS = [
  { id: 'no-cheese', label: 'Без сиру', labelEn: 'No cheese', type: 'exclude', tag: 'сир' },
  { id: 'shrimp', label: 'З креветкою', labelEn: 'With shrimp', type: 'include', tag: 'креветка' },
  { id: 'eel', label: 'З вугрем', labelEn: 'With eel', type: 'include', tag: 'вугор' },
  { id: 'salmon', label: 'З лососем', labelEn: 'With salmon', type: 'include', tag: 'лосось' },
  { id: 'no-mayo', label: 'Без майонезу', labelEn: 'No mayo', type: 'exclude', tag: 'майонез' },
]

const filterById = Object.fromEntries(ROLL_FILTERS.map((f) => [f.id, f]))

// AND across all active filters: every "include" tag must be present,
// every "exclude" tag must be absent — all against the structured
// ingredients list, never the free-text description/composition.
export const applyRollFilters = (products, activeFilterIds) => {
  if (activeFilterIds.length === 0) return products

  const activeFilters = activeFilterIds.map((id) => filterById[id]).filter(Boolean)

  return products.filter((product) => {
    const tags = (product.ingredients || []).map((tag) => tag.toLowerCase())
    return activeFilters.every(({ type, tag }) => {
      const has = tags.includes(tag)
      return type === 'include' ? has : !has
    })
  })
}
