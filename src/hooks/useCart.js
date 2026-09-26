import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks.js'
import { selectIsAuthenticated } from '../store/userSlice.js'
import {
  addItemRemote,
  addLocalItem,
  addLocalItems,
  checkout as checkoutThunk,
  closeDrawer as closeDrawerAction,
  openDrawer as openDrawerAction,
  removeItemRemote,
  removeLocalItem,
  selectCartItems,
  selectCartLoading,
  selectIsDrawerOpen,
  selectItemsCount,
  selectTotal,
  updateItemRemote,
  updateLocalItem,
} from '../store/cartSlice.js'

// Гість тримає кошик у localStorage (синхронні редюсери), залогінений юзер —
// у БД (async thunks). Компоненти цього не бачать — useCart() сам вирішує,
// куди йде кожна операція, залежно від isAuthenticated.
export const useCart = () => {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const items = useAppSelector(selectCartItems)
  const loading = useAppSelector(selectCartLoading)
  const isDrawerOpen = useAppSelector(selectIsDrawerOpen)
  const itemsCount = useAppSelector(selectItemsCount)
  const total = useAppSelector(selectTotal)

  const addItem = useCallback(
    (product, quantity = 1) => {
      if (isAuthenticated) {
        return dispatch(addItemRemote({ product, quantity })).unwrap()
      }
      dispatch(addLocalItem({ product, quantity }))
      return Promise.resolve()
    },
    [dispatch, isAuthenticated],
  )

  const addItems = useCallback(
    (products) => {
      // Масове додавання (наприклад, "Повторити замовлення"). Для
      // залогіненого юзера просто по черзі додаємо на сервер.
      if (isAuthenticated) {
        return products.reduce(
          (chain, { product, quantity }) =>
            chain.then(() => dispatch(addItemRemote({ product, quantity })).unwrap()),
          Promise.resolve(),
        )
      }
      dispatch(
        addLocalItems(
          products.map(({ product, quantity }) => ({
            product_id: product._id,
            productName: product.name,
            price: product.priceKiev,
            image: product.images?.[0] || '',
            quantity,
          })),
        ),
      )
      return Promise.resolve()
    },
    [dispatch, isAuthenticated],
  )

  const updateItem = useCallback(
    (productId, quantity) => {
      if (isAuthenticated) {
        return dispatch(updateItemRemote({ productId, quantity })).unwrap()
      }
      dispatch(updateLocalItem({ productId, quantity }))
      return Promise.resolve()
    },
    [dispatch, isAuthenticated],
  )

  const removeItem = useCallback(
    (productId) => {
      if (isAuthenticated) {
        return dispatch(removeItemRemote(productId)).unwrap()
      }
      dispatch(removeLocalItem(productId))
      return Promise.resolve()
    },
    [dispatch, isAuthenticated],
  )

  const checkout = useCallback(
    (payload) => dispatch(checkoutThunk(payload)).unwrap(),
    [dispatch],
  )

  const getItemQuantity = useCallback(
    (productId) => items.find((item) => item.product_id === productId)?.quantity || 0,
    [items],
  )

  const openDrawer = useCallback(() => dispatch(openDrawerAction()), [dispatch])
  const closeDrawer = useCallback(() => dispatch(closeDrawerAction()), [dispatch])

  return {
    items,
    loading,
    itemsCount,
    total,
    addItem,
    addItems,
    updateItem,
    removeItem,
    checkout,
    getItemQuantity,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
  }
}
