import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  addToCartRequest,
  checkoutRequest,
  fetchCart,
  fetchMyCart,
  removeCartItemRequest,
  updateCartItemRequest,
} from '../api/cart.js'
import { toSerializableError } from '../lib/errors.js'
import { logout } from './userSlice.js'

const SESSION_ID_KEY = 'susidy_session_id'
const CART_ID_KEY = 'susidy_cart_id'

const getOrCreateSessionId = () => {
  let sessionId = localStorage.getItem(SESSION_ID_KEY)
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem(SESSION_ID_KEY, sessionId)
  }
  return sessionId
}

const persistCartId = (cart) => {
  if (cart?._id) {
    localStorage.setItem(CART_ID_KEY, cart._id)
  } else {
    localStorage.removeItem(CART_ID_KEY)
  }
}

// Щоб захардкодити кошик для верстки без бекенду — заповни цей масив
// (форма як cart.items з бекенду) і постав loading: false нижче.
// const initialCart = {
//   _id: 'demo',
//   items: [{ product_id: '1', productName: 'Філадельфія', quantity: 2, price: 189 }],
// }
const initialCart = null

// Якщо initialCart заповнений — це значить розробник свідомо захардкодив
// кошик для верстки, і App.jsx не повинен одразу перетирати його спробою
// звернутись до реального бекенду.
export const hasHardcodedCart = initialCart !== null

const initialState = {
  cart: initialCart,
  loading: initialCart === null,
  isDrawerOpen: false,
  sessionId: getOrCreateSessionId(),
  error: null,
}

export const loadCart = createAsyncThunk(
  'cart/load',
  async (_, { getState }) => {
    // An authenticated user's cart lives by user_id, not by whatever cart
    // id happens to be cached locally (that id could be a stale guest
    // cart, or belong to nothing after a login-time merge) — fetch it by
    // account instead.
    if (getState().user.user) {
      try {
        const data = await fetchMyCart()
        return Array.isArray(data) ? null : data
      } catch {
        return null
      }
    }

    const cartId = localStorage.getItem(CART_ID_KEY)
    if (!cartId) return null

    try {
      const data = await fetchCart(cartId)
      return Array.isArray(data) ? null : data
    } catch {
      return null
    }
  },
)

export const addItem = createAsyncThunk(
  'cart/addItem',
  async ({ product, quantity = 1 }, { getState, rejectWithValue }) => {
    try {
      return await addToCartRequest({
        session_id: getState().cart.sessionId,
        product_id: product._id,
        productName: product.name,
        price: product.priceKiev,
        quantity,
      })
    } catch (err) {
      return rejectWithValue(toSerializableError(err))
    }
  },
)

export const updateItem = createAsyncThunk(
  'cart/updateItem',
  async ({ productId, quantity }, { getState, rejectWithValue }) => {
    const { cart, sessionId } = getState().cart
    if (!cart?._id) return rejectWithValue({ message: 'No active cart' })
    try {
      return await updateCartItemRequest(cart._id, {
        session_id: sessionId,
        product_id: productId,
        quantity,
      })
    } catch (err) {
      return rejectWithValue(toSerializableError(err))
    }
  },
)

export const removeItem = createAsyncThunk(
  'cart/removeItem',
  async (productId, { getState, rejectWithValue }) => {
    const { cart, sessionId } = getState().cart
    if (!cart?._id) return rejectWithValue({ message: 'No active cart' })
    try {
      return await removeCartItemRequest(cart._id, {
        session_id: sessionId,
        product_id: productId,
      })
    } catch (err) {
      return rejectWithValue(toSerializableError(err))
    }
  },
)

export const checkout = createAsyncThunk(
  'cart/checkout',
  async (payload, { getState, rejectWithValue }) => {
    try {
      return await checkoutRequest({
        ...payload,
        session_id: getState().cart.sessionId,
      })
    } catch (err) {
      return rejectWithValue(toSerializableError(err))
    }
  },
)

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Пряме встановлення кошика без запиту на сервер — зручно для верстки/демо.
    setCart(state, action) {
      state.cart = action.payload
      state.loading = false
      persistCartId(action.payload)
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
      .addCase(loadCart.pending, (state) => {
        state.loading = true
      })
      .addCase(loadCart.fulfilled, (state, action) => {
        state.cart = action.payload
        state.loading = false
        persistCartId(action.payload)
      })
      .addCase(loadCart.rejected, (state) => {
        state.loading = false
      })
      .addCase(addItem.fulfilled, (state, action) => {
        state.cart = action.payload
        state.isDrawerOpen = true
        persistCartId(action.payload)
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        state.cart = action.payload
        persistCartId(action.payload)
      })
      .addCase(removeItem.fulfilled, (state, action) => {
        state.cart = action.payload
        persistCartId(action.payload)
      })
      .addCase(checkout.fulfilled, (state) => {
        state.cart = null
        persistCartId(null)
      })
      .addCase(logout.fulfilled, (state) => {
        // The cart we had was tied to this account (user_id server-side),
        // not to our session_id — after logout there's nothing left to
        // show, and re-fetching it by the old cart _id would leak the
        // previous account's cart into an anonymous session.
        state.cart = null
        state.isDrawerOpen = false
        persistCartId(null)
      })
  },
})

export const { setCart, openDrawer, closeDrawer } = cartSlice.actions
export default cartSlice.reducer

export const selectCart = (state) => state.cart.cart
export const selectCartLoading = (state) => state.cart.loading
export const selectIsDrawerOpen = (state) => state.cart.isDrawerOpen
export const selectItemsCount = (state) =>
  state.cart.cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
export const selectTotal = (state) =>
  state.cart.cart?.items?.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  ) || 0
