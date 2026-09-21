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
