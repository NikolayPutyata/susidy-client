import { useEffect, useState } from 'react'
import { fetchAllProducts } from '../../api/products.js'
import {
  createAdminProduct,
  deleteAdminProduct,
  updateAdminProduct,
} from '../../api/admin.js'
import { CATEGORIES } from '../../lib/constants.js'
import { getErrorMessage } from '../../lib/errors.js'

const emptyForm = {
  name: '',
  priceKiev: '',
  priceKharkov: '',
  category: 'other',
  description: '',
}

export const AdminProductsPage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [files, setFiles] = useState([])
  const [saving, setSaving] = useState(false)

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
    setError('')
    try {
      await deleteAdminProduct(id)
      setProducts((prev) => prev.filter((p) => p._id !== id))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <form
        onSubmit={handleSubmit}
        className="h-fit space-y-3 rounded-2xl border border-neutral-200 bg-white p-4"
      >
        <h2 className="font-medium">
          {editingId ? 'Редагувати товар' : 'Новий товар'}
        </h2>

        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Назва"
          required
          className="w-full rounded-lg border border-neutral-300 px-3 py-2"
        />
        <div className="flex gap-2">
          <input
            name="priceKiev"
            type="number"
            value={form.priceKiev}
            onChange={handleChange}
            placeholder="Ціна, Київ"
            required
            className="w-1/2 rounded-lg border border-neutral-300 px-3 py-2"
          />
          <input
            name="priceKharkov"
            type="number"
            value={form.priceKharkov}
            onChange={handleChange}
            placeholder="Ціна, Харків"
            required
            className="w-1/2 rounded-lg border border-neutral-300 px-3 py-2"
          />
        </div>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2"
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
          className="w-full rounded-lg border border-neutral-300 px-3 py-2"
        />
        <div>
          <label className="mb-1 block text-sm text-neutral-600">
            Фото {editingId && '(лишіть порожнім, щоб не змінювати)'}
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files))}
            className="w-full text-sm"
          />
        </div>

        {error && <p className="text-rose-600">{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-lg bg-neutral-900 px-4 py-2 text-white disabled:opacity-50"
          >
            {saving ? 'Зберігаємо…' : editingId ? 'Зберегти' : 'Додати товар'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg bg-neutral-200 px-4 py-2"
            >
              Скасувати
            </button>
          )}
        </div>
      </form>

      <div>
        {loading ? (
          <p>Завантаження…</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {products.map((product) => (
              <div
                key={product._id}
                className="rounded-2xl border border-neutral-200 bg-white p-3"
              >
                <div className="mb-2 aspect-square overflow-hidden rounded-xl bg-neutral-100">
                  {product.images?.[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-neutral-500">{product.priceKiev} грн</p>
                <div className="mt-2 flex gap-2 text-sm">
                  <button
                    onClick={() => startEdit(product)}
                    className="text-neutral-700 underline"
                  >
                    Редагувати
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="text-rose-600 underline"
                  >
                    Видалити
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
