import { Link, Navigate, useLocation } from 'react-router-dom'
import { CheckCircleIcon } from '../components/icons.jsx'

export const OrderSuccessPage = () => {
  const { state } = useLocation()
  const order = state?.order

  if (!order) return <Navigate to="/" replace />

  return (
    <div className="mx-auto max-w-md text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary-light">
        <CheckCircleIcon className="h-9 w-9" />
      </div>
      <h1 className="mb-2 text-2xl font-extrabold">Дякуємо за замовлення!</h1>
      <p className="mb-6 text-text-muted">
        Ми зателефонуємо для підтвердження найближчим часом.
      </p>

      <div className="rounded-2xl border border-border bg-surface p-5 text-left">
        <p className="mb-3 font-semibold">
          Замовлення №{order._id.slice(-6).toUpperCase()}
        </p>
        <ul className="mb-3 divide-y divide-border">
          {order.items.map((item) => (
            <li
              key={item.product_id}
              className="flex justify-between py-1.5 text-sm text-text-muted"
            >
              <span>
                {item.productName} × {item.quantity}
              </span>
              <span className="text-text">{item.price * item.quantity} ₴</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-text-muted">Разом до сплати</span>
          <span className="text-xl font-extrabold text-accent">
            {order.total} ₴
          </span>
        </div>
      </div>

      <Link
        to="/"
        className="mt-6 inline-block rounded-full bg-primary px-5 py-2 font-semibold text-black transition hover:bg-primary-light"
      >
        Повернутись до меню
      </Link>
    </div>
  )
}
