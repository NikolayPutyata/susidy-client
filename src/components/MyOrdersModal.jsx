import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { fetchMyOrders } from '../api/orders.js'
import { fetchAllProducts } from '../api/products.js'
import { useCart } from '../hooks/useCart.js'
import { useCity } from '../hooks/useCity.js'
import { useModals } from '../hooks/useModals.js'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock.js'
import { getErrorMessage } from '../lib/errors.js'
import { getChargeableQuantity } from '../lib/addons.js'
import { CloseIcon, ReceiptIcon, SpinnerIcon } from './icons.jsx'

export const MyOrdersModal = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { addItems } = useCart()
  const { getPrice } = useCity()
  const { myOrdersOpen: open, closeMyOrders } = useModals()
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [repeatingId, setRepeatingId] = useState(null)

  useBodyScrollLock(open)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    setError('')
    Promise.all([fetchMyOrders(), fetchAllProducts()])
      .then(([ordersData, productsData]) => {
        setOrders(ordersData)
        setProducts(productsData)
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [open])

  if (!open) return null

  const handleRepeat = async (order) => {
    setRepeatingId(order._id)
    setError('')
    try {
      const toAdd = order.items
        .map((item) => {
          const product = products.find((p) => p._id === item.product_id)
          return product
            ? { product, quantity: item.quantity, price: getPrice(product) }
            : null
        })
        .filter(Boolean)

      if (toAdd.length === 0) {
        setError(t('orders.noItemsAvailable'))
        return
      }

      await addItems(toAdd)
      closeMyOrders()
      navigate('/checkout')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setRepeatingId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-fade-in">
      <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-3xl border border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{t('orders.title')}</h2>
          <button
            onClick={closeMyOrders}
            aria-label={t('cart.close')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition hover:bg-surface-hover hover:text-text"
          >
            <CloseIcon className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="overflow-y-auto">
          {error && (
            <p className="mb-4 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-accent">
              {error}
            </p>
          )}

          {loading ? (
            <p className="py-16 text-center text-text-muted">{t('common.loading')}</p>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-raised">
                <ReceiptIcon className="h-7 w-7 text-text-subtle" />
              </div>
              <p className="text-text-muted">{t('orders.none')}</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {orders.map((order) => (
                <li
                  key={order._id}
                  className="rounded-2xl border border-border bg-surface-raised p-5"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-semibold">
                      {t('checkout.orderNumber', { number: order._id.slice(-6).toUpperCase() })}
                    </p>
                    <p className="text-sm text-text-muted">
                      {new Date(order.createdAt).toLocaleDateString(
                        i18n.language === 'en' ? 'en-US' : 'uk-UA',
                      )}
                    </p>
                  </div>

                  <ul className="mb-3 divide-y divide-border text-sm">
                    {order.items.map((item) => (
                      <li
                        key={item.product_id}
                        className="flex justify-between py-1.5 text-text-muted"
                      >
                        <span>
                          {item.productName} × {item.quantity}
                        </span>
                        <span className="text-text">
                          {item.price * getChargeableQuantity(item)} ₴
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="font-extrabold text-accent">{order.total} ₴</span>
                    <button
                      onClick={() => handleRepeat(order)}
                      disabled={repeatingId === order._id}
                      className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-black transition hover:bg-primary-light disabled:opacity-60"
                    >
                      {repeatingId === order._id && (
                        <SpinnerIcon className="h-3.5 w-3.5 animate-spin" />
                      )}
                      {t('orders.repeat')}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
