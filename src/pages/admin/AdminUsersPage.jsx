import { useEffect, useState } from 'react'
import {
  fetchAdminUsers,
  searchAdminUsers,
  updateUserDiscountRequest,
} from '../../api/admin.js'
import { getErrorMessage } from '../../lib/errors.js'

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([])
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState(null)

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

  const handleDiscountChange = async (id, value) => {
    const discount = Number(value)
    if (Number.isNaN(discount)) return

    setSavingId(id)
    setError('')
    try {
      const updated = await updateUserDiscountRequest(id, discount)
      setUsers((prev) => prev.map((u) => (u._id === id ? updated : u)))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Пошук за телефоном"
          className="w-64 rounded-lg border border-neutral-300 px-3 py-2"
        />
        <button
          type="submit"
          className="rounded-lg bg-neutral-900 px-4 py-2 text-white"
        >
          Знайти
        </button>
        <button
          type="button"
          onClick={() => {
            setPhone('')
            loadAll()
          }}
          className="rounded-lg bg-neutral-200 px-4 py-2"
        >
          Скинути
        </button>
      </form>

      {error && <p className="mb-4 text-rose-600">{error}</p>}
      {loading && <p>Завантаження…</p>}

      {!loading && (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 text-neutral-500">
              <tr>
                <th className="p-3">Ім'я</th>
                <th className="p-3">Телефон</th>
                <th className="p-3">Email</th>
                <th className="p-3">Роль</th>
                <th className="p-3">Знижка, %</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-neutral-100 last:border-0">
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.phoneNumber}</td>
                  <td className="p-3">{u.email || '—'}</td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      defaultValue={u.discount}
                      disabled={savingId === u._id}
                      onBlur={(e) => handleDiscountChange(u._id, e.target.value)}
                      className="w-20 rounded-lg border border-neutral-300 px-2 py-1"
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
