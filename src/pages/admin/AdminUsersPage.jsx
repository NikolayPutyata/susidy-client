import { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import {
  exportAdminUsers,
  fetchAdminUsers,
  searchAdminUsers,
  updateUserDiscountRequest,
} from '../../api/admin.js'
import { getErrorMessage } from '../../lib/errors.js'
import { CITIES } from '../../lib/constants.js'
import { SearchIcon, SortAscIcon, SortDescIcon, SpinnerIcon, UploadIcon } from '../../components/icons.jsx'
import { Pagination } from '../../components/Pagination.jsx'

const toIsoDate = (date) => (date ? date.toISOString().slice(0, 10) : undefined)

const PER_PAGE_OPTIONS = [20, 50, 100]

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([])
  const [phone, setPhone] = useState('')
  const [activePhone, setActivePhone] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(PER_PAGE_OPTIONS[0])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState(null)
  const [exportFrom, setExportFrom] = useState(null)
  const [exportTo, setExportTo] = useState(null)
  const [exportCity, setExportCity] = useState('')
  const [exporting, setExporting] = useState(false)
  const [sortBy, setSortBy] = useState('')
  const [sortDir, setSortDir] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    const sortParams = sortBy ? { sortBy, sortDir } : {}
    const request = activePhone
      ? searchAdminUsers({ phone: activePhone, page, perPage, ...sortParams })
      : fetchAdminUsers({ page, perPage, ...sortParams })

    request
      .then((res) => {
        setUsers(res.data)
        setTotalPages(res.totalPages || 1)
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [page, perPage, activePhone, sortBy, sortDir])

  const toggleSort = (field) => {
    setPage(1)
    if (sortBy !== field) {
      setSortBy(field)
      setSortDir('desc')
    } else {
      setSortDir((prev) => (prev === 'desc' ? 'asc' : 'desc'))
    }
  }

  const handlePerPageChange = (value) => {
    setPage(1)
    setPerPage(value)
  }

  const sortIcon = (field) => {
    if (sortBy !== field) return <SortDescIcon className="h-3.5 w-3.5 opacity-30" />
    return sortDir === 'asc' ? (
      <SortAscIcon className="h-3.5 w-3.5" />
    ) : (
      <SortDescIcon className="h-3.5 w-3.5" />
    )
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setActivePhone(phone.trim())
  }

  const handleResetSearch = () => {
    setPhone('')
    setPage(1)
    setActivePhone('')
  }

  const handleDiscountChange = async (user, input) => {
    const discount = Number(input.value)
    if (Number.isNaN(discount) || discount === user.discount) return

    if (!confirm(`Змінити знижку для ${user.name} на ${discount}%?`)) {
      input.value = user.discount
      return
    }

    setSavingId(user._id)
    setError('')
    try {
      const updated = await updateUserDiscountRequest(user._id, discount)
      setUsers((prev) => prev.map((u) => (u._id === user._id ? updated : u)))
    } catch (err) {
      setError(getErrorMessage(err))
      input.value = user.discount
    } finally {
      setSavingId(null)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    setError('')
    try {
      const blob = await exportAdminUsers({
        from: toIsoDate(exportFrom),
        to: toIsoDate(exportTo),
        city: exportCity || undefined,
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = exportCity ? `customers-${exportCity}.csv` : 'customers.csv'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <h1 className="mb-3 text-xl font-extrabold">Клієнти</h1>

      <form onSubmit={handleSearch} className="mb-3 flex flex-wrap gap-1.5">
        <div className="relative w-64">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle" />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Пошук за телефоном"
            className="w-full rounded-xl border border-border bg-surface-raised py-1.5 pl-9 pr-3 text-xs text-text placeholder:text-text-subtle outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-primary px-3.5 py-1.5 text-xs font-semibold text-black transition hover:bg-primary-light"
        >
          Знайти
        </button>
        <button
          type="button"
          onClick={handleResetSearch}
          className="rounded-xl bg-surface px-3.5 py-1.5 text-xs font-medium text-text-muted transition hover:bg-surface-hover hover:text-text"
        >
          Скинути
        </button>
      </form>

      <div className="mb-4 flex flex-wrap items-end gap-2 rounded-2xl border border-border bg-surface p-3">
        <div>
          <p className="mb-1 text-xs text-text-muted">Період (необов'язково)</p>
          <div className="flex items-center gap-1.5">
            <DatePicker
              selected={exportFrom}
              onChange={setExportFrom}
              selectsStart
              startDate={exportFrom}
              endDate={exportTo}
              dateFormat="dd.MM.yyyy"
              placeholderText="Від"
              className="w-32 rounded-xl border border-border bg-surface-raised px-2.5 py-1.5 text-xs text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
            <span className="text-text-subtle">—</span>
            <DatePicker
              selected={exportTo}
              onChange={setExportTo}
              selectsEnd
              startDate={exportFrom}
              endDate={exportTo}
              minDate={exportFrom}
              dateFormat="dd.MM.yyyy"
              placeholderText="До"
              className="w-32 rounded-xl border border-border bg-surface-raised px-2.5 py-1.5 text-xs text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
        <div>
          <p className="mb-1 text-xs text-text-muted">Місто (необов'язково)</p>
          <select
            value={exportCity}
            onChange={(e) => setExportCity(e.target.value)}
            className="rounded-xl border border-border bg-surface-raised px-2.5 py-1.5 text-xs text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Усі міста</option>
            {CITIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-semibold text-black transition hover:bg-primary-light disabled:opacity-60"
        >
          {exporting ? (
            <SpinnerIcon className="h-4 w-4 animate-spin" />
          ) : (
            <UploadIcon className="h-4 w-4 rotate-180" />
          )}
          Вивантажити список клієнтів
        </button>
      </div>

      {error && (
        <p className="mb-3 rounded-xl border border-accent/30 bg-accent/10 px-3.5 py-2.5 text-accent">
          {error}
        </p>
      )}

      {loading ? (
        <p className="flex items-center gap-1.5 text-text-muted">
          <SpinnerIcon className="h-4 w-4 animate-spin" /> Завантаження…
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-text-subtle">
                <th className="p-2 font-medium">Ім'я</th>
                <th className="p-2 font-medium">Телефон</th>
                <th className="p-2 font-medium">
                  <button
                    type="button"
                    onClick={() => toggleSort('ordersCount')}
                    className="flex items-center gap-1 font-medium text-text-subtle transition hover:text-text"
                  >
                    Замовлень
                    {sortIcon('ordersCount')}
                  </button>
                </th>
                <th className="p-2 font-medium">
                  <button
                    type="button"
                    onClick={() => toggleSort('totalSpent')}
                    className="flex items-center gap-1 font-medium text-text-subtle transition hover:text-text"
                  >
                    Сума, ₴
                    {sortIcon('totalSpent')}
                  </button>
                </th>
                <th className="p-2 font-medium">Знижка, %</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u._id}
                  className="border-b border-border last:border-0 hover:bg-surface-hover"
                >
                  <td className="p-2 font-medium">{u.name}</td>
                  <td className="p-2 text-text-muted">{u.phoneNumber}</td>
                  <td className="p-2 text-text-muted">{u.ordersCount ?? 0}</td>
                  <td className="p-2 text-text-muted">{u.totalSpent ?? 0} ₴</td>
                  <td className="p-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      defaultValue={u.discount}
                      disabled={savingId === u._id}
                      onBlur={(e) => handleDiscountChange(u, e.target)}
                      className="w-20 rounded-lg border border-border bg-surface-raised px-2.5 py-1.5 text-xs text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        perPage={perPage}
        perPageOptions={PER_PAGE_OPTIONS}
        onPerPageChange={handlePerPageChange}
      />
    </div>
  )
}
