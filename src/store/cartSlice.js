import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  addToCartRequest,
  checkoutRequest,
  fetchMyCart,
  removeCartItemRequest,
  repriceCartRequest,
  updateCartItemRequest,
} from '../api/cart.js'
import { fetchAllProducts } from '../api/products.js'
import { toSerializableError } from '../lib/errors.js'
import { getChargeableQuantity, recomputeAddons } from '../lib/addons.js'
import { logout } from './userSlice.js'

// Гостьовий кошик живе виключно в localStorage — бекенд про нього нічого не
// знає до чекауту. Кошик залогіненого юзера — в БД (по одному на user_id).
const GUEST_CART_KEY = 'susidy_guest_cart'

const readLocalCart = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(GUEST_CART_KEY))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeLocalCart = (items) => {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
  } catch {
    // localStorage недоступний (приватний режим, квота) — кошик просто не
    // переживе перезавантаження сторінки.
  }
}

const clearLocalCart = () => {
  try {
    localStorage.removeItem(GUEST_CART_KEY)
  } catch {
    /* ignore */
  }
}

// Щоб захардкодити кошик для верстки без бекенду — заповни цей масив
// (форма як items з бекенду) і постав loading: false нижче.
// const initialItems = [{ product_id: '1', productName: 'Філадельфія', quantity: 2, price: 189, image: '' }]
const initialItems = null

// Якщо initialItems заповнений — це значить розробник свідомо захардкодив
// кошик для верстки, і App.jsx не повинен одразу перетирати його спробою
// звернутись до реального бекенду.
export const hasHardcodedCart = initialItems !== null

const initialState = {
  items: initialItems ?? readLocalCart(),
  loading: false,
  isDrawerOpen: false,
  error: null,
  // True when the last city switch couldn't actually reprice the cart
  // (catalog fetch failed) — the items shown (and what checkout would
  // submit) are still the OLD city's prices. Surfaced in CartDrawer/
  // CheckoutPage so that never happens silently.
  repriceError: false,
}

// ---- Кошик залогіненого юзера — завжди через сервер ----

export const loadMyCart = createAsyncThunk('cart/loadMy', async () => {
  try {
    const data = await fetchMyCart()
    return Array.isArray(data) ? data : data?.items || []
  } catch {
    return []
  }
})

export const addItemRemote = createAsyncThunk(
  'cart/addItemRemote',
  async ({ product, quantity, price }, { getState, rejectWithValue }) => {
    try {
      const cart = await addToCartRequest({
        product_id: product._id,
        productName: product.name,
        price,
        image: product.images?.[0] || '',
        quantity,
        weight: product.weight,
        addonType: product.addonType || null,
        category: product.category,
        city: getState().city.city,
      })
      return cart.items || []
    } catch (err) {
      return rejectWithValue(toSerializableError(err))
    }
  },
)

export const updateItemRemote = createAsyncThunk(
  'cart/updateItemRemote',
  async ({ productId, quantity }, { getState, rejectWithValue }) => {
    try {
      const cart = await updateCartItemRequest(productId, quantity, getState().city.city)
      return cart.items || []
    } catch (err) {
      return rejectWithValue(toSerializableError(err))
    }
  },
)

export const removeItemRemote = createAsyncThunk(
  'cart/removeItemRemote',
  async (productId, { getState, rejectWithValue }) => {
    try {
      const cart = await removeCartItemRequest(productId, getState().city.city)
      return cart.items || []
    } catch (err) {
      return rejectWithValue(toSerializableError(err))
    }
  },
)

export const checkout = createAsyncThunk(
  'cart/checkout',
  async (payload, { getState, rejectWithValue }) => {
    try {
      // Для гостя сервер бере товари саме з тіла запиту (в нього немає
      // кошика в БД); для залогіненого юзера сервер їх ігнорує і бере
      // кошик з БД сам — надсилаємо в обох випадках, це нічого не псує.
      return await checkoutRequest({ ...payload, items: getState().cart.items })
    } catch (err) {
      return rejectWithValue(toSerializableError(err))
    }
  },
)

// Ціна кожної позиції фіксується в момент додавання в кошик — якщо юзер
// пізніше міняє місто, уже додані товари лишаються за старою ціною, поки
// хтось явно не перерахує їх. Викликається з useCity().setCity().
export const repriceCartForCity = createAsyncThunk(
  'cart/repriceForCity',
  async (city, { getState }) => {
    const state = getState()
    const items = state.cart.items
    if (items.length === 0) return { items, failed: false }

    const priceField = city === 'kharkiv' ? 'priceKharkov' : 'priceKiev'

    let products
    try {
      products = await fetchAllProducts()
    } catch {
      // Без каталогу нема з чим звірити нову ціну — лишаємо стару, АЛЕ
      // позначаємо репрайс як невдалий, щоб UI міг це показати: ці items
      // досі за старою ціною й саме вони підуть у замовлення, якщо
      // нічого не зробити.
      return { items, failed: true }
    }

    const repriced = items.map((item) => {
      const product = products.find((p) => p._id === item.product_id)
      return product ? { ...item, price: product[priceField] } : item
    })

    if (state.user.user) {
      try {
        await repriceCartRequest(
          repriced.map(({ product_id, price }) => ({ product_id, price })),
        )
      } catch {
        // Не вдалось синхронізувати з БД — усе одно покажемо перераховане
        // локально; наступна дія з кошиком перезапише items з БД.
      }
    } else {
      writeLocalCart(repriced)
    }

    return { items: repriced, failed: false }
  },
)

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Гостьовий кошик — синхронні операції, все живе в localStorage.
    addLocalItem(state, action) {
      const { product, quantity, price, addonCatalog } = action.payload
      const existing = state.items.find((item) => item.product_id === product._id)
      if (existing) {
        existing.quantity += quantity
      } else {
        state.items.push({
          product_id: product._id,
          productName: product.name,
          price,
          image: product.images?.[0] || '',
          quantity,
          weight: product.weight,
          addonType: product.addonType || null,
          category: product.category,
        })
      }
      // Adding/incrementing is never a removal, so this can only ever
      // grant or top up free addon lines — see lib/addons.js. Runs even
      // if the catalog hasn't loaded yet (addonCatalog null): an EXISTING
      // addon line's quantity still shifts by the right delta either way,
      // only creating a brand-new line needs the catalog.
      state.items = recomputeAddons(state.items, addonCatalog)
      writeLocalCart(state.items)
    },
    updateLocalItem(state, action) {
      const { productId, quantity, addonCatalog } = action.payload
      const item = state.items.find((i) => i.product_id === productId)
      if (item) item.quantity = quantity
      // A quantity SET (never a full removal) is always safe to recompute.
      state.items = recomputeAddons(state.items, addonCatalog)
      writeLocalCart(state.items)
    },
    removeLocalItem(state, action) {
      const { productId, addonCatalog } = action.payload
      const removedItem = state.items.find((i) => i.product_id === productId)
      state.items = state.items.filter((i) => i.product_id !== productId)
      // Only a MAIN item's removal should shrink/clear its linked addons —
      // a deliberate removal of an addon line itself must stick, never
      // get silently re-granted by the next unrelated recompute.
      if (removedItem && !removedItem.addonType) {
        state.items = recomputeAddons(state.items, addonCatalog)
      }
      writeLocalCart(state.items)
    },
    addLocalItems(state, action) {
      // Використовується для "Повторити замовлення" — додає одразу декілька
      // позицій до поточного (гостьового) кошика.
      const { items, addonCatalog } = action.payload
      for (const incoming of items) {
        const existing = state.items.find(
          (item) => item.product_id === incoming.product_id,
        )
        if (existing) {
          existing.quantity += incoming.quantity
        } else {
          state.items.push({ ...incoming })
        }
      }
      state.items = recomputeAddons(state.items, addonCatalog)
      writeLocalCart(state.items)
    },
    // Скидає гостьовий кошик — використовується при логіні (перед
    // довантаженням кошика з БД) і зручно для верстки/демо.
    discardGuestCart(state) {
      state.items = []
      clearLocalCart()
    },
    setCart(state, action) {
      state.items = action.payload
    },
    openDrawer(state) {
      state.isDrawerOpen = true
    },
    closeDrawer(state) {
      state.isDrawerOpen = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadMyCart.pending, (state) => {
        state.loading = true
      })
      .addCase(loadMyCart.fulfilled, (state, action) => {
        state.items = action.payload
        state.loading = false
      })
      .addCase(loadMyCart.rejected, (state) => {
        state.loading = false
      })
      .addCase(addItemRemote.fulfilled, (state, action) => {
        state.items = action.payload
      })
      .addCase(updateItemRemote.fulfilled, (state, action) => {
        state.items = action.payload
      })
      .addCase(removeItemRemote.fulfilled, (state, action) => {
        state.items = action.payload
      })
      .addCase(repriceCartForCity.fulfilled, (state, action) => {
        state.items = action.payload.items
        state.repriceError = action.payload.failed
      })
      .addCase(checkout.fulfilled, (state) => {
        state.items = []
        clearLocalCart()
      })
      .addCase(logout.fulfilled, (state) => {
        // Гостьовий кошик уже було очищено при логіні — тож після виходу
        // просто починаємо з порожнього.
        state.items = []
        state.isDrawerOpen = false
        clearLocalCart()
      })
  },
})

export const {
  addLocalItem,
  updateLocalItem,
  removeLocalItem,
  addLocalItems,
  discardGuestCart,
  setCart,
  openDrawer,
  closeDrawer,
} = cartSlice.actions
export default cartSlice.reducer

export const selectCartItems = (state) => state.cart.items
export const selectCartLoading = (state) => state.cart.loading
export const selectIsDrawerOpen = (state) => state.cart.isDrawerOpen
export const selectRepriceError = (state) => state.cart.repriceError
export const selectItemsCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
// Free sauce/ginger/wasabi units within an addon line's own allowance
// never get charged — see lib/addons.js::getChargeableQuantity.
export const selectTotal = (state) =>
  state.cart.items.reduce(
    (sum, item) => sum + getChargeableQuantity(item) * item.price,
    0,
  )
