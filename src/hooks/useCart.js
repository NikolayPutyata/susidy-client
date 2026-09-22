import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks.js'
import {
  addItem as addItemThunk,
  checkout as checkoutThunk,
  closeDrawer as closeDrawerAction,
  openDrawer as openDrawerAction,
  removeItem as removeItemThunk,
  selectCart,
  selectCartLoading,
  selectIsDrawerOpen,
  selectItemsCount,
  selectTotal,
  updateItem as updateItemThunk,
} from '../store/cartSlice.js'

export const useCart = () => {
  const dispatch = useAppDispatch()
  const cart = useAppSelector(selectCart)
  const loading = useAppSelector(selectCartLoading)
  const isDrawerOpen = useAppSelector(selectIsDrawerOpen)
  const itemsCount = useAppSelector(selectItemsCount)
  const total = useAppSelector(selectTotal)

  const addItem = useCallback(
    (product, quantity = 1) =>
      dispatch(addItemThunk({ product, quantity })).unwrap(),
    [dispatch],
  )

  const updateItem = useCallback(
    (productId, quantity) =>
      dispatch(updateItemThunk({ productId, quantity })).unwrap(),
    [dispatch],
  )

  const removeItem = useCallback(
    (productId) => dispatch(removeItemThunk(productId)).unwrap(),
    [dispatch],
  )

  const checkout = useCallback(
    (payload) => dispatch(checkoutThunk(payload)).unwrap(),
    [dispatch],
  )

  const getItemQuantity = useCallback(
    (productId) =>
      cart?.items?.find((item) => item.product_id === productId)?.quantity || 0,
    [cart],
  )

  const openDrawer = useCallback(() => dispatch(openDrawerAction()), [dispatch])
  const closeDrawer = useCallback(() => dispatch(closeDrawerAction()), [dispatch])

  return {
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
  }
}
