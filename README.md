# Susidy Client

Клієнтський сайт суші-бару (каталог, кошик, оформлення замовлення без реєстрації) + адмін-панель (товари, клієнти, замовлення) — в одному React + Vite застосунку. Працює з бекендом [susidy-server](https://github.com/NikolayPutyata/susidy-server).

## Стек

React 19, Vite, React Router, Axios, Tailwind CSS.

## Запуск

```bash
cp .env.example .env   # VITE_API_URL — адреса susidy-server
npm install
npm run dev
```

Бекенд має дозволяти цей origin у `CLIENT_ORIGIN` (див. README `susidy-server`) — інакше логін/refresh (кукі) не працюватимуть.

## Структура

- `src/api/` — тонкі обгортки над axios для кожної групи ендпоінтів (`auth`, `products`, `cart`, `admin`). `client.js` — спільний інстанс axios: підставляє `Authorization: Bearer`, при 401 сам викликає `/auth/refresh` і повторює запит.
- `src/context/AuthContext.jsx` — сесія користувача. При завантаженні застосунку мовчки викликає `/auth/refresh` (кукі), щоб відновити сесію після перезавантаження сторінки; `accessToken` живе лише в пам'яті (не в localStorage) — так безпечніше при XSS.
- `src/context/CartContext.jsx` — кошик гостя/користувача. `session_id` (UUID) генерується і зберігається в `localStorage`; `_id` кошика з відповіді бекенду теж кешується локально, щоб відновлювати кошик при перезавантаженні сторінки (бекенд віддає кошик лише по його власному `_id`, не по `session_id`).
- `src/pages/` — публічні сторінки (каталог, кошик, чекаут, логін/реєстрація) і `src/pages/admin/` — адмінка, захищена `ProtectedAdminRoute` (пускає лише `role: "admin"`).

## Відомі спрощення (свідомо, на цьому етапі)

- Ціна показується лише по Києву (`priceKiev`) — вибору міста/`priceKharkov` в UI ще немає.
- Кошик гостя не мігрує автоматично, якщо людина додала товари, а потім залогінилась посеред сесії (бекенд починає шукати кошик по `user_id`, а не по старому `session_id`).
- Помилки з Joi-валідації бекенду показуються англійською (сирий текст з `error.details`), без локалізації.
