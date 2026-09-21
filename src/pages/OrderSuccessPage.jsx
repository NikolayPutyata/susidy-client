import { Link, Navigate, useLocation } from 'react-router-dom'

export const OrderSuccessPage = () => {
  const { state } = useLocation()
  const order = state?.order

  if (!order) return <Navigate to="/" replace />

  return (
    <div className="mx-auto max-w-md text-center">
      <h1 className="mb-2 text-2xl font-semibold">Дякуємо за замовлення!</h1>
      <p className="mb-6 text-neutral-500">
        Ми зателефонуємо для підтвердження.
      </p>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-left">
        <p className="mb-2 font-medium">
          Замовлення №{order._id.slice(-6).toUpperCase()}
        </p>
        <ul className="mb-2 divide-y divide-neutral-100">
          {order.items.map((item) => (
            <li
              key={item.product_id}
              className="flex justify-between py-1 text-sm"
            >
              <span>
                {item.productName} × {item.quantity}
              </span>
              <span>{item.price * item.quantity} грн</span>
            </li>
          ))}
        </ul>
        <p className="font-semibold">Разом: {order.total} грн</p>
      </div>

      <Link to="/" className="mt-6 inline-block text-neutral-900 underline">
        Повернутись до меню
      </Link>
    </div>
  )
}
