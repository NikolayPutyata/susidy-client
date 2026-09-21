import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  addToCartRequest,
  checkoutRequest,
  fetchCart,
  removeCartItemRequest,
  updateCartItemRequest,
} from '../api/cart.js'

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

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const sessionId = useMemo(() => getOrCreateSessionId(), [])

  const openDrawer = useCallback(() => setDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  const applyCart = useCallback((data) => {
    setCart(data)
    if (data?._id) {
      localStorage.setItem(CART_ID_KEY, data._id)
    } else {
      localStorage.removeItem(CART_ID_KEY)
    }
  }, [])

  const loadCart = useCallback(async () => {
    const cartId = localStorage.getItem(CART_ID_KEY)
    if (!cartId) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const data = await fetchCart(cartId)
      applyCart(Array.isArray(data) ? null : data)
    } catch {
      applyCart(null)
    } finally {
      setLoading(false)
    }
  }, [applyCart])

  useEffect(() => {
    loadCart()
  }, [loadCart])

  const addItem = useCallback(
    async (product, quantity = 1) => {
      const data = await addToCartRequest({
        session_id: sessionId,
        product_id: product._id,
        productName: product.name,
        price: product.priceKiev,
        quantity,
      })
      applyCart(data)
      openDrawer()
    },
    [sessionId, applyCart, openDrawer],
  )

  const updateItem = useCallback(
    async (productId, quantity) => {
      if (!cart?._id) return
      const data = await updateCartItemRequest(cart._id, {
        session_id: sessionId,
        product_id: productId,
        quantity,
      })
      applyCart(data)
    },
    [cart, sessionId, applyCart],
  )

  const removeItem = useCallback(
    async (productId) => {
      if (!cart?._id) return
      const data = await removeCartItemRequest(cart._id, {
        session_id: sessionId,
        product_id: productId,
      })
      applyCart(data)
    },
    [cart, sessionId, applyCart],
  )

  const checkout = useCallback(
    async (payload) => {
      const order = await checkoutRequest({ ...payload, session_id: sessionId })
      applyCart(null)
      return order
    },
    [sessionId, applyCart],
  )

  const getItemQuantity = useCallback(
    (productId) =>
      cart?.items?.find((item) => item.product_id === productId)?.quantity || 0,
    [cart],
  )

  const itemsCount =
    cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  const total =
    cart?.items?.reduce((sum, item) => sum + item.quantity * item.price, 0) ||
    0

  const value = useMemo(
    () => ({
      cart,
      loading,
      itemsCount,
      total,
      addItem,
      updateItem,
      removeItem,
      checkout,
      getItemQuantity,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
    }),
    [
      cart,
      loading,
      itemsCount,
      total,
      addItem,
      updateItem,
      removeItem,
      checkout,
      getItemQuantity,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
