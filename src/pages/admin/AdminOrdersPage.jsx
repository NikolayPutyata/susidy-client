import { useEffect, useState } from 'react'
import { fetchTodayOrders, searchAdminOrders } from '../../api/admin.js'
import { getErrorMessage } from '../../lib/errors.js'

const OrdersTable = ({ orders }) => {
  if (orders.length === 0) {
    return <p className="text-neutral-500">Немає замовлень.</p>
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-neutral-200 text-neutral-500">
          <tr>
            <th className="p-3">Час</th>
            <th className="p-3">Клієнт</th>
            <th className="p-3">Телефон</th>
            <th className="p-3">Товари</th>
            <th className="p-3">Доставка</th>
            <th className="p-3 text-right">Сума</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id} className="border-b border-neutral-100 last:border-0">
              <td className="whitespace-nowrap p-3">
                {new Date(order.createdAt).toLocaleString('uk-UA')}
              </td>
              <td className="p-3">{order.name}</td>
              <td className="p-3">{order.phoneNumber}</td>
              <td className="p-3">
                {order.items
                  .map((item) => `${item.productName} ×${item.quantity}`)
                  .join(', ')}
              </td>
              <td className="p-3">{order.delivery || '—'}</td>
              <td className="p-3 text-right font-medium">{order.total} грн</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const AdminOrdersPage = () => {
  const [tab, setTab] = useState('today')
  const [todayOrders, setTodayOrders] = useState([])
  const [phone, setPhone] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    fetchTodayOrders()
      .then(setTodayOrders)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!phone.trim()) return
    setLoading(true)
    setError('')
    try {
      const data = await searchAdminOrders(phone.trim())
      setSearchResults(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setTab('today')}
          className={`rounded-full px-4 py-1.5 text-sm ${
            tab === 'today' ? 'bg-neutral-900 text-white' : 'bg-neutral-200'
          }`}
        >
          Сьогодні ({todayOrders.length})
        </button>
        <button
          onClick={() => setTab('search')}
          className={`rounded-full px-4 py-1.5 text-sm ${
            tab === 'search' ? 'bg-neutral-900 text-white' : 'bg-neutral-200'
          }`}
        >
          Пошук за телефоном
        </button>
      </div>

      {error && <p className="mb-4 text-rose-600">{error}</p>}

      {tab === 'today' &&
        (loading ? <p>Завантаження…</p> : <OrdersTable orders={todayOrders} />)}

      {tab === 'search' && (
        <div>
          <form onSubmit={handleSearch} className="mb-4 flex gap-2">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Номер телефону"
              className="w-64 rounded-lg border border-neutral-300 px-3 py-2"
            />
            <button
              type="submit"
              className="rounded-lg bg-neutral-900 px-4 py-2 text-white"
            >
              Знайти
            </button>
          </form>
          {searchResults && <OrdersTable orders={searchResults} />}
        </div>
      )}
    </div>
  )
}
