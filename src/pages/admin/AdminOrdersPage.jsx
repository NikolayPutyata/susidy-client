import { useEffect, useState } from 'react'
import { fetchOrdersByDay, searchAdminOrders } from '../../api/admin.js'
import { getErrorMessage } from '../../lib/errors.js'
import { CITY_LABELS, LOCATIONS } from '../../lib/constants.js'
import { SearchIcon, SpinnerIcon } from '../../components/icons.jsx'

const formatFulfillment = (order) => {
  const city = CITY_LABELS[order.city] || order.city || '—'
  if (order.fulfillment === 'pickup') {
    return `Самовивіз, ${city}${order.pickupAddress ? `, ${order.pickupAddress}` : ''}`
  }
  if (!order.street) return city

  const apartment = order.isPrivateHouse ? 'приватний будинок' : `кв. ${order.apartment}`
  return `${city}, вул. ${order.street}, буд. ${order.building}, ${apartment}`
}

const OrdersTable = ({ orders }) => {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center text-text-muted">
        Немає замовлень.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-text-subtle">
            <th className="p-3 font-medium">Час</th>
            <th className="p-3 font-medium">Клієнт</th>
            <th className="p-3 font-medium">Телефон</th>
            <th className="p-3 font-medium">Товари</th>
            <th className="p-3 font-medium">Доставка</th>
            <th className="p-3 text-right font-medium">Сума</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order._id}
              className="border-b border-border last:border-0 hover:bg-surface-hover"
            >
              <td className="whitespace-nowrap p-3 text-text-muted">
                {new Date(order.createdAt).toLocaleString('uk-UA')}
              </td>
              <td className="p-3 font-medium">{order.name}</td>
              <td className="p-3 text-text-muted">{order.phoneNumber}</td>
              <td className="p-3 text-text-muted">
                {order.items
                  .map((item) => `${item.productName} ×${item.quantity}`)
                  .join(', ')}
              </td>
              <td className="p-3 text-text-muted">{formatFulfillment(order)}</td>
              <td className="p-3 text-right font-semibold text-accent">
                {order.total} ₴
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
      active
        ? 'bg-primary text-black'
        : 'bg-surface text-text-muted hover:bg-surface-hover hover:text-text'
    }`}
  >
    {children}
  </button>
)

export const AdminOrdersPage = () => {
  const [tab, setTab] = useState('today')
  const [pointFilter, setPointFilter] = useState('')
  const [dayOrders, setDayOrders] = useState([])
  const [phone, setPhone] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (tab === 'search') return
    setLoading(true)
    setError('')
    fetchOrdersByDay({ day: tab, pickupPointId: pointFilter || undefined })
      .then(setDayOrders)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [tab, pointFilter])

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
      <h1 className="mb-4 text-2xl font-extrabold">Замовлення</h1>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <TabButton active={tab === 'today'} onClick={() => setTab('today')}>
          Сьогодні
        </TabButton>
        <TabButton active={tab === 'yesterday'} onClick={() => setTab('yesterday')}>
          Вчора
        </TabButton>
        <TabButton active={tab === 'search'} onClick={() => setTab('search')}>
          Пошук за телефоном
        </TabButton>

        {tab !== 'search' && (
          <select
            value={pointFilter}
            onChange={(e) => setPointFilter(e.target.value)}
            className="ml-auto rounded-full border border-border bg-surface-raised px-3.5 py-1.5 text-sm text-text outline-none focus:border-primary"
          >
            <option value="">Усі точки</option>
            {LOCATIONS.map((point) => (
              <option key={point.id} value={point.id}>
                {CITY_LABELS[point.city]} · {point.address}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-accent">
          {error}
        </p>
      )}

      {tab !== 'search' &&
        (loading ? (
          <p className="flex items-center gap-2 text-text-muted">
            <SpinnerIcon className="h-4 w-4 animate-spin" /> Завантаження…
          </p>
        ) : (
          <OrdersTable orders={dayOrders} />
        ))}

      {tab === 'search' && (
        <div>
          <form onSubmit={handleSearch} className="mb-4 flex gap-2">
            <div className="relative w-64">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle" />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Номер телефону"
                className="w-full rounded-xl border border-border bg-surface-raised py-2 pl-9 pr-3 text-text placeholder:text-text-subtle outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-primary px-4 py-2 font-semibold text-black transition hover:bg-primary-light"
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
