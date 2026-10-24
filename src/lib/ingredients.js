// The fixed ingredient dictionary — the admin picks from these with chips
// (no free text), products store the ids, and the roll filters match on
// them exactly. Mirrors the server's src/constants/ingredients.js; add a new
// ingredient in both places.
export const INGREDIENTS = [
  { id: 'salmon', label: 'Лосось' },
  { id: 'tuna', label: 'Тунець' },
  { id: 'eel', label: 'Вугор' },
  { id: 'shrimp', label: 'Креветка' },
  { id: 'crab', label: 'Краб' },
  { id: 'chicken', label: 'Курка' },
  { id: 'cheese', label: 'Сир' },
  { id: 'mayo', label: 'Майонез' },
  { id: 'avocado', label: 'Авокадо' },
  { id: 'cucumber', label: 'Огірок' },
  { id: 'tobiko', label: 'Ікра тобіко' },
  { id: 'sesame', label: 'Кунжут' },
]
