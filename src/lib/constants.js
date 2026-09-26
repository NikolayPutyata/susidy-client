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

// TODO: підставити реальні адреси й телефони точок.
export const LOCATIONS = [
  { city: 'kyiv', label: 'Київ', address: 'Адреса уточнюється', phone: '' },
  { city: 'kharkiv', label: 'Харків', address: 'Адреса уточнюється', phone: '' },
]
