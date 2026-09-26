import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  addToCartRequest,
  checkoutRequest,
  fetchMyCart,
  removeCartItemRequest,
  updateCartItemRequest,
} from '../api/cart.js'
import { toSerializableError } from '../lib/errors.js'
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
  async ({ product, quantity, price }, { rejectWithValue }) => {
    try {
      const cart = await addToCartRequest({
        product_id: product._id,
        productName: product.name,
        price,
        image: product.images?.[0] || '',
        quantity,
      })
      return cart.items || []
    } catch (err) {
      return rejectWithValue(toSerializableError(err))
    }
  },
)

export const updateItemRemote = createAsyncThunk(
  'cart/updateItemRemote',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const cart = await updateCartItemRequest(productId, quantity)
      return cart.items || []
    } catch (err) {
      return rejectWithValue(toSerializableError(err))
    }
  },
)

export const removeItemRemote = createAsyncThunk(
  'cart/removeItemRemote',
  async (productId, { rejectWithValue }) => {
    try {
      const cart = await removeCartItemRequest(productId)
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

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Гостьовий кошик — синхронні операції, все живе в localStorage.
    addLocalItem(state, action) {
      const { product, quantity, price } = action.payload
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
        })
      }
      writeLocalCart(state.items)
    },
    updateLocalItem(state, action) {
      const { productId, quantity } = action.payload
      const item = state.items.find((i) => i.product_id === productId)
      if (item) item.quantity = quantity
      writeLocalCart(state.items)
    },
    removeLocalItem(state, action) {
      state.items = state.items.filter((i) => i.product_id !== action.payload)
      writeLocalCart(state.items)
    },
    addLocalItems(state, action) {
      // Використовується для "Повторити замовлення" — додає одразу декілька
      // позицій до поточного (гостьового) кошика.
      for (const incoming of action.payload) {
        const existing = state.items.find(
          (item) => item.product_id === incoming.product_id,
        )
        if (existing) {
          existing.quantity += incoming.quantity
        } else {
          state.items.push({ ...incoming })
        }
      }
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
export const selectItemsCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
export const selectTotal = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
