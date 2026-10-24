// Product name/description are stored in the DB, not as static UI
// strings — nameEn/descriptionEn (admin product form) are the real
// translation, filled in by hand per item. Falls back to the Ukrainian
// value whenever the English one hasn't been set yet, rather than ever
// transliterating or inventing one.
export const getProductName = (product, lang) =>
  (lang === 'en' && product.nameEn) || product.name

export const getProductDescription = (product, lang) =>
  (lang === 'en' && product.descriptionEn) || product.description || ''
