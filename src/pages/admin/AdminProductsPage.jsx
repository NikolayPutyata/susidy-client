import { useEffect, useState } from 'react'
import { fetchAllProducts } from '../../api/products.js'
import {
  createAdminProduct,
  deleteAdminProduct,
  updateAdminProduct,
} from '../../api/admin.js'
import { CATEGORIES } from '../../lib/constants.js'
import { getErrorMessage } from '../../lib/errors.js'
import { SpinnerIcon, TrashIcon, UploadIcon } from '../../components/icons.jsx'

const emptyForm = {
  name: '',
  priceKiev: '',
  priceKharkov: '',
  category: 'other',
  description: '',
}

const inputClass =
  'w-full rounded-xl border border-border bg-surface-raised px-3.5 py-2 text-text placeholder:text-text-subtle outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30'

export const AdminProductsPage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [files, setFiles] = useState([])
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

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

  return (
    <div>
      <h1 className="mb-4 text-2xl font-extrabold">Товари</h1>

      {error && (
        <p className="mb-4 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-accent">
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="mx-auto mb-8 max-w-xl space-y-3 rounded-2xl border border-border bg-surface p-5"
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
        <div className="flex gap-2">
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

        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong px-4 py-3 text-sm text-text-muted transition hover:border-primary hover:text-text">
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

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-black transition hover:bg-primary-light disabled:opacity-60"
          >
            {saving && <SpinnerIcon className="h-4 w-4 animate-spin" />}
            {saving ? 'Зберігаємо…' : editingId ? 'Зберегти' : 'Додати товар'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl bg-surface-raised px-4 py-2.5 font-medium text-text-muted transition hover:text-text"
            >
              Скасувати
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p className="flex items-center gap-2 text-text-muted">
          <SpinnerIcon className="h-4 w-4 animate-spin" /> Завантаження…
        </p>
      ) : (
        <div className="space-y-8">
          {CATEGORIES.map((category) => {
            const categoryProducts = products.filter(
              (p) => p.category === category.value,
            )
            if (categoryProducts.length === 0) return null

            return (
              <div key={category.value}>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary-light">
                  {category.label} · {categoryProducts.length}
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {categoryProducts.map((product) => (
                    <div
                      key={product._id}
                      className="overflow-hidden rounded-2xl border border-border bg-surface"
                    >
                      <div className="aspect-square bg-black">
                        {product.images?.[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-contain"
                          />
                        )}
                      </div>
                      <div className="p-3">
                        <p className="truncate font-medium">{product.name}</p>
                        <p className="text-sm font-semibold text-accent">
                          {product.priceKiev} ₴
                        </p>
                        <div className="mt-2 flex gap-3 text-sm">
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
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
