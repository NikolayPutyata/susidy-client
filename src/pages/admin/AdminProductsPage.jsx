import { useEffect, useState } from 'react'
import { fetchAllProducts } from '../../api/products.js'
import {
  createAdminProduct,
  deleteAdminProduct,
  updateAdminProduct,
  updateAdminProductStop,
} from '../../api/admin.js'
import { CATEGORIES, CITY_LABELS, LOCATIONS } from '../../lib/constants.js'
import { getErrorMessage } from '../../lib/errors.js'
import { SpinnerIcon, TrashIcon, UploadIcon } from '../../components/icons.jsx'

const pointById = Object.fromEntries(LOCATIONS.map((point) => [point.id, point]))

// Short label for the per-product stop chips — just the address, no city,
// so it fits on one line instead of wrapping inside the table column.
const pointAddress = (pointId) => pointById[pointId]?.address ?? pointId

const emptyForm = {
  name: '',
  priceKiev: '',
  priceKharkov: '',
  category: 'other',
  description: '',
  weight: '',
}

const inputClass =
  'w-full rounded-xl border border-border bg-surface-raised px-3 py-1.5 text-text placeholder:text-text-subtle outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30'

export const AdminProductsPage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [files, setFiles] = useState([])
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [pointFilter, setPointFilter] = useState('')
  const [stopBusyId, setStopBusyId] = useState(null)

  const load = () => {
    setLoading(true)
    fetchAllProducts()
      .then(setProducts)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const startEdit = (product) => {
    setEditingId(product._id)
    setForm({
      name: product.name,
      priceKiev: product.priceKiev,
      priceKharkov: product.priceKharkov,
      category: product.category,
      description: product.description || '',
      weight: product.weight || '',
    })
    setFiles([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setFiles([])
  }

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const formData = new FormData()
    Object.entries(form).forEach(([key, value]) => formData.append(key, value))
    files.forEach((file) => formData.append('images', file))

    try {
      if (editingId) {
        const updated = await updateAdminProduct(editingId, formData)
        setProducts((prev) => prev.map((p) => (p._id === editingId ? updated : p)))
      } else {
        const created = await createAdminProduct(formData)
        setProducts((prev) => [created, ...prev])
      }
      resetForm()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Видалити товар?')) return
    setDeletingId(id)
    setError('')
    try {
      await deleteAdminProduct(id)
      setProducts((prev) => prev.filter((p) => p._id !== id))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleStop = async (product) => {
    if (!pointFilter) return
    const stoppedHere = product.stoppedPoints?.includes(pointFilter)

    setStopBusyId(product._id)
    setError('')
    try {
      const updated = await updateAdminProductStop(
        product._id,
        pointFilter,
        !stoppedHere,
      )
      setProducts((prev) => prev.map((p) => (p._id === product._id ? updated : p)))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setStopBusyId(null)
    }
  }

  return (
    <div>
      <h1 className="mb-3 text-xl font-extrabold">Товари</h1>

      {error && (
        <p className="mb-3 rounded-xl border border-accent/30 bg-accent/10 px-3.5 py-2.5 text-accent">
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="mx-auto mb-6 max-w-xl space-y-3 rounded-2xl border border-border bg-surface p-4"
      >
        <h2 className="text-center font-semibold">
          {editingId ? 'Редагувати товар' : 'Новий товар'}
        </h2>

        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Назва"
          required
          className={inputClass}
        />
        <div className="flex gap-1.5">
          <input
            name="priceKiev"
            type="number"
            value={form.priceKiev}
            onChange={handleChange}
            placeholder="Ціна, Київ"
            required
            className={inputClass}
          />
          <input
            name="priceKharkov"
            type="number"
            value={form.priceKharkov}
            onChange={handleChange}
            placeholder="Ціна, Харків"
            required
            className={inputClass}
          />
        </div>
        <input
          name="weight"
          type="number"
          min="0"
          value={form.weight}
          onChange={handleChange}
          placeholder="Вага, г"
          className={inputClass}
        />
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className={inputClass}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Опис"
          rows={3}
          className={inputClass}
        />

        <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-dashed border-border-strong px-3.5 py-2.5 text-xs text-text-muted transition hover:border-primary hover:text-text">
          <UploadIcon className="h-4 w-4" />
          {files.length > 0
            ? `Обрано файлів: ${files.length}`
            : 'Фото товару (до 10)'}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files))}
            className="hidden"
          />
        </label>
        {editingId && files.length === 0 && (
          <p className="text-xs text-text-subtle">
            Фото не обрано — старі зображення залишаться без змін.
          </p>
        )}

        <div className="flex gap-1.5 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 font-semibold text-black transition hover:bg-primary-light disabled:opacity-60"
          >
            {saving && <SpinnerIcon className="h-4 w-4 animate-spin" />}
            {saving ? 'Зберігаємо…' : editingId ? 'Зберегти' : 'Додати товар'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl bg-surface-raised px-3.5 py-2 font-medium text-text-muted transition hover:text-text"
            >
              Скасувати
            </button>
          )}
        </div>
      </form>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-1.5">
        <p className="text-xs text-text-muted">
          {pointFilter
            ? 'Кнопка в колонці "На обраній точці" стопить/повертає позицію саме на цій точці — інші точки не зміняться.'
            : 'Оберіть точку, щоб ставити позиції на стоп саме на ній.'}
        </p>
        <select
          value={pointFilter}
          onChange={(e) => setPointFilter(e.target.value)}
          className="rounded-full border border-border bg-surface-raised px-3 py-1 text-xs text-text outline-none focus:border-primary"
        >
          <option value="">Усі точки</option>
          {LOCATIONS.map((point) => (
            <option key={point.id} value={point.id}>
              {CITY_LABELS[point.city]} · {point.address}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="flex items-center gap-1.5 text-text-muted">
          <SpinnerIcon className="h-4 w-4 animate-spin" /> Завантаження…
        </p>
      ) : (
        <div className="space-y-6">
          {CATEGORIES.map((category) => {
            const categoryProducts = products.filter(
              (p) => p.category === category.value,
            )
            if (categoryProducts.length === 0) return null

            return (
              <div key={category.value}>
                <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-primary-light">
                  {category.label} · {categoryProducts.length}
                </h3>
                <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
                  <table className="w-full table-fixed text-left text-xs">
                    <colgroup>
                      <col className="w-[180px]" />
                      <col className="w-[100px]" />
                      <col className="w-[220px]" />
                      <col className="w-[160px]" />
                      <col className="w-[190px]" />
                    </colgroup>
                    <thead>
                      <tr className="border-b border-border text-text-subtle">
                        <th className="p-2 font-medium">Назва</th>
                        <th className="p-2 font-medium">Ціна, Київ / Харків</th>
                        <th className="p-2 font-medium">Стоп на точках</th>
                        <th className="p-2 font-medium">На обраній точці</th>
                        <th className="p-2 font-medium">Дії</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryProducts.map((product) => {
                        const stoppedHere = Boolean(
                          pointFilter && product.stoppedPoints?.includes(pointFilter),
                        )

                        return (
                          <tr
                            key={product._id}
                            className={`border-b border-border last:border-0 hover:bg-surface-hover ${
                              stoppedHere ? 'bg-accent/5' : ''
                            }`}
                          >
                            <td className="truncate p-2 font-medium">
                              {product.name}
                              {product.weight > 0 && (
                                <span className="ml-1 text-xs font-normal text-text-subtle">
                                  {product.weight} г
                                </span>
                              )}
                            </td>
                            <td className="whitespace-nowrap p-2 text-text-muted">
                              {product.priceKiev} / {product.priceKharkov} ₴
                            </td>
                            <td className="p-2">
                              {product.stoppedPoints?.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {product.stoppedPoints.map((pointId) => (
                                    <span
                                      key={pointId}
                                      className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs ${
                                        pointId === pointFilter
                                          ? 'bg-accent/20 text-accent'
                                          : 'bg-surface-raised text-text-subtle'
                                      }`}
                                    >
                                      {pointAddress(pointId)}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-text-subtle">—</span>
                              )}
                            </td>
                            <td className="p-2">
                              {pointFilter ? (
                                <button
                                  onClick={() => handleToggleStop(product)}
                                  disabled={stopBusyId === product._id}
                                  className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold transition disabled:opacity-50 ${
                                    stoppedHere
                                      ? 'bg-accent/20 text-accent hover:bg-accent/30'
                                      : 'bg-primary/15 text-primary-light hover:bg-primary/25'
                                  }`}
                                >
                                  {stoppedHere ? 'Повернути' : 'Поставити на стоп'}
                                </button>
                              ) : (
                                <span className="text-xs text-text-subtle">
                                  Оберіть точку
                                </span>
                              )}
                            </td>
                            <td className="p-2">
                              <div className="flex gap-2 text-xs">
                                <button
                                  onClick={() => startEdit(product)}
                                  className="text-primary-light underline underline-offset-2"
                                >
                                  Редагувати
                                </button>
                                <button
                                  onClick={() => handleDelete(product._id)}
                                  disabled={deletingId === product._id}
                                  className="flex items-center gap-1 text-accent underline underline-offset-2 disabled:opacity-50"
                                >
                                  <TrashIcon className="h-3.5 w-3.5" />
                                  Видалити
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
