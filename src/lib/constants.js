export const CATEGORIES = [
  { value: 'rolls', label: 'Роли' },
  { value: 'sushi', label: 'Суші' },
  { value: 'hotRolls', label: 'Гарячі роли' },
  { value: 'hunkans', label: 'Хункани' },
  { value: 'sets', label: 'Сети' },
  { value: 'drinks', label: 'Напої' },
  { value: 'maki', label: 'Маки' },
  { value: 'bigRolls', label: 'Великі роли' },
  { value: 'other', label: 'Інше' },
]

export const CATEGORY_LABELS = Object.fromEntries(
  CATEGORIES.map((category) => [category.value, category.label]),
)

export const CITIES = [
  { value: 'kyiv', label: 'Київ', priceField: 'priceKiev' },
  { value: 'kharkiv', label: 'Харків', priceField: 'priceKharkov' },
]

export const CITY_LABELS = Object.fromEntries(
  CITIES.map((city) => [city.value, city.label]),
)

// TODO: підставити реальні посилання на Instagram/Facebook.
export const SOCIAL_LINKS = {
  instagram: '#',
  facebook: '#',
}

export const WORKING_HOURS = '11:00 – 22:00'

export const LOCATIONS = [
  { id: 'kyiv-berestejskyi', city: 'kyiv', address: 'просп. Берестейський, 9' },
  { id: 'kyiv-dragomanova', city: 'kyiv', address: 'вул. Драгоманова, 2А' },
  { id: 'kharkiv-valentynivska', city: 'kharkiv', address: 'вул. Валентинівська, 31В' },
  {
    id: 'kharkiv-divisions',
    city: 'kharkiv',
    address: 'вул. Харківських дивізій, 11/2',
  },
  { id: 'kharkiv-svobody', city: 'kharkiv', address: 'просп. Людвіга Свободи, 33' },
]
