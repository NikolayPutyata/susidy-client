import { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import {
  exportAdminUsers,
  fetchAdminUsers,
  searchAdminUsers,
  updateUserDiscountRequest,
} from '../../api/admin.js'
import { getErrorMessage } from '../../lib/errors.js'
import { SearchIcon, SpinnerIcon, UploadIcon } from '../../components/icons.jsx'

const toIsoDate = (date) => (date ? date.toISOString().slice(0, 10) : undefined)

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([])
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState(null)
  const [exportFrom, setExportFrom] = useState(null)
  const [exportTo, setExportTo] = useState(null)
  const [exporting, setExporting] = useState(false)

  const loadAll = () => {
    setLoading(true)
    setError('')
    fetchAdminUsers({ perPage: 50 })
      .then((res) => setUsers(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(loadAll, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!phone.trim()) {
      loadAll()
      return
    }

    setLoading(true)
    setError('')
    try {
      const data = await searchAdminUsers(phone.trim())
      setUsers(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
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
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'customers.csv'
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
      <h1 className="mb-4 text-2xl font-extrabold">Клієнти</h1>

      <form onSubmit={handleSearch} className="mb-4 flex flex-wrap gap-2">
        <div className="relative w-64">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle" />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Пошук за телефоном"
            className="w-full rounded-xl border border-border bg-surface-raised py-2 pl-9 pr-3 text-text placeholder:text-text-subtle outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-primary px-4 py-2 font-semibold text-black transition hover:bg-primary-light"
        >
          Знайти
        </button>
        <button
          type="button"
          onClick={() => {
            setPhone('')
            loadAll()
          }}
          className="rounded-xl bg-surface px-4 py-2 font-medium text-text-muted transition hover:bg-surface-hover hover:text-text"
        >
          Скинути
        </button>
      </form>

      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface p-4">
        <div>
          <p className="mb-1.5 text-sm text-text-muted">Період (необов'язково)</p>
          <div className="flex items-center gap-2">
            <DatePicker
              selected={exportFrom}
              onChange={setExportFrom}
              selectsStart
              startDate={exportFrom}
              endDate={exportTo}
              dateFormat="dd.MM.yyyy"
              placeholderText="Від"
              className="w-32 rounded-xl border border-border bg-surface-raised px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
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
              className="w-32 rounded-xl border border-border bg-surface-raised px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-black transition hover:bg-primary-light disabled:opacity-60"
        >
          {exporting ? (
            <SpinnerIcon className="h-4 w-4 animate-spin" />
          ) : (
            <UploadIcon className="h-4 w-4 rotate-180" />
          )}
          Вивантажити список клієнтів
        </button>
        <p className="text-xs text-text-subtle">
          Без дат — за весь час. CSV: Ім'я, номер, місто.
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-accent">
          {error}
        </p>
      )}

      {loading ? (
        <p className="flex items-center gap-2 text-text-muted">
          <SpinnerIcon className="h-4 w-4 animate-spin" /> Завантаження…
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-text-subtle">
                <th className="p-3 font-medium">Ім'я</th>
                <th className="p-3 font-medium">Телефон</th>
                <th className="p-3 font-medium">Замовлень</th>
                <th className="p-3 font-medium">Знижка, %</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u._id}
                  className="border-b border-border last:border-0 hover:bg-surface-hover"
                >
                  <td className="p-3 font-medium">{u.name}</td>
                  <td className="p-3 text-text-muted">{u.phoneNumber}</td>
                  <td className="p-3 text-text-muted">{u.ordersCount ?? 0}</td>
                  <td className="p-3">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      defaultValue={u.discount}
                      disabled={savingId === u._id}
                      onBlur={(e) => handleDiscountChange(u, e.target)}
                      className="w-20 rounded-lg border border-border bg-surface-raised px-2 py-1 text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
