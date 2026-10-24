import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks.js'
import { selectIsAuthenticated } from '../store/userSlice.js'
import { selectAddonCatalog } from '../store/addonsSlice.js'
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
  selectRepriceError,
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
  const addonCatalog = useAppSelector(selectAddonCatalog)
  const items = useAppSelector(selectCartItems)
  const loading = useAppSelector(selectCartLoading)
  const isDrawerOpen = useAppSelector(selectIsDrawerOpen)
  const itemsCount = useAppSelector(selectItemsCount)
  const total = useAppSelector(selectTotal)
  const repriceError = useAppSelector(selectRepriceError)

  const addItem = useCallback(
    (product, quantity, price) => {
      if (isAuthenticated) {
        return dispatch(addItemRemote({ product, quantity, price })).unwrap()
      }
      dispatch(addLocalItem({ product, quantity, price, addonCatalog }))
      return Promise.resolve()
    },
    [dispatch, isAuthenticated, addonCatalog],
  )

  const addItems = useCallback(
    (products) => {
      // Масове додавання (наприклад, "Повторити замовлення"). products —
      // масив { product, quantity, price }. Для залогіненого юзера просто
      // по черзі додаємо на сервер.
      if (isAuthenticated) {
        return products.reduce(
          (chain, { product, quantity, price }) =>
            chain.then(() =>
              dispatch(addItemRemote({ product, quantity, price })).unwrap(),
            ),
          Promise.resolve(),
        )
      }
      dispatch(
        addLocalItems({
          items: products.map(({ product, quantity, price }) => ({
            product_id: product._id,
            productName: product.name,
            price,
            image: product.images?.[0] || '',
            quantity,
            weight: product.weight,
            addonType: product.addonType || null,
            category: product.category,
          })),
          addonCatalog,
        }),
      )
      return Promise.resolve()
    },
    [dispatch, isAuthenticated, addonCatalog],
  )

  const updateItem = useCallback(
    (productId, quantity) => {
      if (isAuthenticated) {
        return dispatch(updateItemRemote({ productId, quantity })).unwrap()
      }
      dispatch(updateLocalItem({ productId, quantity, addonCatalog }))
      return Promise.resolve()
    },
    [dispatch, isAuthenticated, addonCatalog],
  )

  const removeItem = useCallback(
    (productId) => {
      if (isAuthenticated) {
        return dispatch(removeItemRemote(productId)).unwrap()
      }
      dispatch(removeLocalItem({ productId, addonCatalog }))
      return Promise.resolve()
    },
    [dispatch, isAuthenticated, addonCatalog],
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
    repriceError,
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
