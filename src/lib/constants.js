export const CATEGORIES = [
  { value: 'rolls', label: 'Роли' },
  { value: 'sushi', label: 'Суші' },
  { value: 'hotRolls', label: 'Гарячі роли' },
  { value: 'hunkans', label: 'Фелікси' },
  { value: 'sets', label: 'Сети' },
  { value: 'drinks', label: 'Напої' },
  { value: 'maki', label: 'Маки' },
  { value: 'bigRolls', label: 'Великі роли' },
  { value: 'other', label: 'Інше' },
]

export const CATEGORY_LABELS = Object.fromEntries(
  CATEGORIES.map((category) => [category.value, category.label]),
)

// Not a real product category — a client-side filter over the user's own
// favorites, so it's kept out of CATEGORIES (used for product creation
// and real category matching) and handled separately in CatalogPage.
export const FAVORITES_CATEGORY = { value: 'favorites', label: 'Улюблене' }

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

const WORKING_HOURS_START = 11
const WORKING_HOURS_END = 22

// Open from 11:00 up to (not including) 22:00, Kyiv time — checked in
// Europe/Kyiv explicitly, not the visitor's own clock, so someone browsing
// from another time zone still sees the restaurant's real hours.
export const isWorkingHoursNow = (now = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Kyiv',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)
  const hour = Number(parts.find((part) => part.type === 'hour').value)
  return hour >= WORKING_HOURS_START && hour < WORKING_HOURS_END
}

export const TIME_SLOTS = Array.from(
  { length: (WORKING_HOURS_END - WORKING_HOURS_START) * 2 + 1 },
  (_, i) => {
    const minutesFromStart = i * 30
    const hour = WORKING_HOURS_START + Math.floor(minutesFromStart / 60)
    const minute = minutesFromStart % 60
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  },
)

// lat/lng mirror the server's PICKUP_POINTS (src/constants/index.js there)
// — provided directly by the business owner (Google Maps "What's here" pin
// on each point), not geocoded from the address string.
export const LOCATIONS = [
  {
    id: 'kyiv-berestejskyi',
    city: 'kyiv',
    address: 'просп. Берестейський, 9',
    lat: 50.447806,
    lng: 30.484361,
  },
  {
    id: 'kyiv-dragomanova',
    city: 'kyiv',
    address: 'вул. Драгоманова, 2А',
    lat: 50.417611,
    lng: 30.633111,
  },
  {
    id: 'kharkiv-valentynivska',
    city: 'kharkiv',
    address: 'вул. Валентинівська, 31В',
    lat: 50.013667,
    lng: 36.342028,
  },
  {
    id: 'kharkiv-divisions',
    city: 'kharkiv',
    address: 'вул. Харківських дивізій, 11/2',
    lat: 49.957556,
    lng: 36.332139,
  },
  {
    id: 'kharkiv-svobody',
    city: 'kharkiv',
    address: 'просп. Людвіга Свободи, 33',
    lat: 50.051556,
    lng: 36.204833,
  },
]

// Only used to center the map before the customer has picked an address —
// not business data, so no geocoding dependency.
export const CITY_CENTERS = {
  kyiv: { lat: 50.4501, lng: 30.5234 },
  kharkiv: { lat: 49.9935, lng: 36.2304 },
}
