# Susidy Client

Клієнтський сайт суші-бару (каталог, кошик, оформлення замовлення без реєстрації) + адмін-панель (товари, клієнти, замовлення) — в одному React + Vite застосунку. Працює з бекендом [susidy-server](https://github.com/NikolayPutyata/susidy-server).

## Стек

React 19, Vite, React Router, Redux Toolkit, Axios, Tailwind CSS.

## Запуск

```bash
cp .env.example .env   # VITE_API_URL — адреса susidy-server
npm install
npm run dev
```

Бекенд має дозволяти цей origin у `CLIENT_ORIGIN` (див. README `susidy-server`) — інакше логін/refresh (кукі) не працюватимуть.

## Структура

- `src/api/` — тонкі обгортки над axios для кожної групи ендпоінтів (`auth`, `products`, `cart`, `admin`). `client.js` — спільний інстанс axios: підставляє `Authorization: Bearer`, при 401 сам викликає `/auth/refresh` і повторює запит.
- `src/store/` — Redux Toolkit. `userSlice.js` і `cartSlice.js` — стан + `createAsyncThunk` для звернень до API (`restoreSession`, `login`, `registerUser`, `logout` / `loadCart`, `addItem`, `updateItem`, `removeItem`, `checkout`). `index.js` — `configureStore`.
- `src/hooks/useAuth.js`, `src/hooks/useCart.js` — тонкі хуки над стором (`useSelector`/`useDispatch`), які й використовують сторінки/компоненти — самого Redux в компонентах не видно.
- **Захардкодити дані для верстки/демо без бекенду:** у `userSlice.js` та `cartSlice.js` є закоментований `initialUser`/`initialCart` на самому верху файлу — розкоментуй, підстав свої дані, і стор стартує з ними одразу, без жодного запиту на сервер. Або викликай `dispatch(setUser(...))` / `dispatch(setCart(...))` (експортовані reducer-екшени) з будь-якого місця в рантаймі.
- `src/pages/` — публічні сторінки (каталог, кошик, чекаут, логін/реєстрація) і `src/pages/admin/` — адмінка, захищена `ProtectedAdminRoute` (пускає лише `role: "admin"`).

## Відомі спрощення (свідомо, на цьому етапі)

- Ціна показується лише по Києву (`priceKiev`) — вибору міста/`priceKharkov` в UI ще немає.
- Кошик гостя не мігрує автоматично, якщо людина додала товари, а потім залогінилась посеред сесії (бекенд починає шукати кошик по `user_id`, а не по старому `session_id`).
- Помилки з Joi-валідації бекенду показуються англійською (сирий текст з `error.details`), без локалізації.
