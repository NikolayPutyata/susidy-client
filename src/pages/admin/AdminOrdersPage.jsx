import { Fragment, useEffect, useState } from 'react'
import { fetchOrdersByDay, searchAdminOrders } from '../../api/admin.js'
import { getErrorMessage } from '../../lib/errors.js'
import { CITY_LABELS, LOCATIONS } from '../../lib/constants.js'
import { SearchIcon, SpinnerIcon } from '../../components/icons.jsx'
import { Pagination } from '../../components/Pagination.jsx'

const PER_PAGE = 10

const formatFulfillment = (order) => {
  const city = CITY_LABELS[order.city] || order.city || '—'
  if (order.fulfillment === 'pickup') {
    return `Самовивіз, ${city}${order.pickupAddress ? `, ${order.pickupAddress}` : ''}`
  }
  if (!order.street) return city

  const apartment = order.isPrivateHouse ? 'приватний будинок' : `кв. ${order.apartment}`
  return `${city}, вул. ${order.street}, буд. ${order.building}, ${apartment}`
}

const formatRequestedTime = (order) => {
  if (!order.requestedTime) return null
  return order.requestedTime === 'asap' ? 'Якнайшвидше' : order.requestedTime
}

const summarizeItems = (items) => {
  if (items.length === 1) return `${items[0].productName} ×${items[0].quantity}`
  return `${items[0].productName} × ${items[0].quantity} + ще ${items.length - 1}`
}

const OrdersTable = ({ orders }) => {
  const [expandedId, setExpandedId] = useState(null)

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
            <th className="w-28 p-3 text-right font-medium">Сума</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const expanded = expandedId === order._id
            const requestedTime = formatRequestedTime(order)

            return (
              <Fragment key={order._id}>
                <tr
                  onClick={() => setExpandedId(expanded ? null : order._id)}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-hover"
                >
                  <td className="whitespace-nowrap p-3 text-text-muted">
                    {new Date(order.createdAt).toLocaleString('uk-UA')}
                  </td>
                  <td className="p-3 font-medium">{order.name}</td>
                  <td className="p-3 text-text-muted">{order.phoneNumber}</td>
                  <td className="max-w-[220px] truncate p-3 text-text-muted">
                    {summarizeItems(order.items)}
                  </td>
                  <td className="p-3 text-text-muted">
                    <div>{formatFulfillment(order)}</div>
                    {requestedTime && (
                      <div className="text-xs text-text-subtle">
                        ⏰ {requestedTime}
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap p-3 text-right font-semibold text-accent">
                    {order.total} ₴
                  </td>
                </tr>
                {expanded && (
                  <tr className="border-b border-border bg-surface-raised/40 last:border-0">
                    <td colSpan={6} className="p-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="mb-1.5 font-medium text-text">Товари</p>
                          <ul className="space-y-1 divide-y divide-border text-text-muted">
                            {order.items.map((item) => (
                              <li
                                key={item.product_id}
                                className="flex justify-between gap-3 py-1"
                              >
                                <span>
                                  {item.productName} × {item.quantity}
                                </span>
                                <span className="shrink-0 text-text">
                                  {item.price * item.quantity} ₴
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-1.5 text-text-muted">
                          <p>
                            <span className="text-text-subtle">Час: </span>
                            {requestedTime || '—'}
                          </p>
                          <p>
                            <span className="text-text-subtle">Приборів: </span>
                            {order.cutlery ?? 1}
                          </p>
                          <p>
                            <span className="text-text-subtle">Оплата: </span>
                            {order.paymentMethod === 'online' ? 'Онлайн' : 'При отриманні'}
                          </p>
                          {order.details && (
                            <p>
                              <span className="text-text-subtle">Коментар: </span>
                              {order.details}
                            </p>
                          )}
                          {order.noCallback && (
                            <p className="text-accent">Просив(ла) не передзвонювати</p>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
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
  const [activePhone, setActivePhone] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (tab === 'search') return
    setLoading(true)
    setError('')
    fetchOrdersByDay({
      day: tab,
      pickupPointId: pointFilter || undefined,
      page,
      perPage: PER_PAGE,
    })
      .then((res) => {
        setDayOrders(res.data)
        setTotalPages(res.totalPages || 1)
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [tab, pointFilter, page])

  useEffect(() => {
    if (tab !== 'search' || !activePhone) return
    setLoading(true)
    setError('')
    searchAdminOrders({ phone: activePhone, page, perPage: PER_PAGE })
      .then((res) => {
        setSearchResults(res.data)
        setTotalPages(res.totalPages || 1)
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [tab, activePhone, page])

  const handleTabChange = (newTab) => {
    setTab(newTab)
    setPage(1)
  }

  const handlePointFilterChange = (pointId) => {
    setPointFilter(pointId)
    setPage(1)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!phone.trim()) return
    setPage(1)
    setActivePhone(phone.trim())
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-extrabold">Замовлення</h1>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <TabButton active={tab === 'today'} onClick={() => handleTabChange('today')}>
          Сьогодні
        </TabButton>
        <TabButton active={tab === 'yesterday'} onClick={() => handleTabChange('yesterday')}>
          Вчора
        </TabButton>
        <TabButton active={tab === 'search'} onClick={() => handleTabChange('search')}>
          Пошук за телефоном
        </TabButton>

        {tab !== 'search' && (
          <select
            value={pointFilter}
            onChange={(e) => handlePointFilterChange(e.target.value)}
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
          <>
            <OrdersTable orders={dayOrders} />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
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
          {loading ? (
            <p className="flex items-center gap-2 text-text-muted">
              <SpinnerIcon className="h-4 w-4 animate-spin" /> Завантаження…
            </p>
          ) : (
            searchResults && (
              <>
                <OrdersTable orders={searchResults} />
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </>
            )
          )}
        </div>
      )}
    </div>
  )
}
