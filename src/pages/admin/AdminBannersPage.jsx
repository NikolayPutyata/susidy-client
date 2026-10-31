import { useEffect, useState } from 'react'
import {
  createAdminBanner,
  deleteAdminBanner,
  fetchAdminBanners,
  updateAdminBanner,
} from '../../api/admin.js'
import { getErrorMessage } from '../../lib/errors.js'
import { SpinnerIcon, TrashIcon, UploadIcon } from '../../components/icons.jsx'
import { cloudinaryUrl } from '../../lib/images.js'

const emptyForm = {
  title: '',
  subtitle: '',
  link: '',
  order: '',
  active: true,
}

const inputClass =
  'w-full rounded-xl border border-border bg-surface-raised px-3 py-1.5 text-text placeholder:text-text-subtle outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30'

export const AdminBannersPage = () => {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const load = () => {
    setLoading(true)
    fetchAdminBanners()
      .then(setBanners)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const startEdit = (banner) => {
    setEditingId(banner._id)
    setForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      link: banner.link || '',
      order: banner.order || '',
      active: banner.active,
    })
    setFile(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setFile(null)
  }

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!editingId && !file) {
      setError('Додайте зображення банера.')
      return
    }

    setSaving(true)
    setError('')

    const formData = new FormData()
    Object.entries(form).forEach(([key, value]) => formData.append(key, value))
    if (file) formData.append('image', file)

    try {
      if (editingId) {
        const updated = await updateAdminBanner(editingId, formData)
        setBanners((prev) => prev.map((b) => (b._id === editingId ? updated : b)))
      } else {
        const created = await createAdminBanner(formData)
        setBanners((prev) => [...prev, created].sort((a, b) => a.order - b.order))
      }
      resetForm()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Видалити банер?')) return
    setDeletingId(id)
    setError('')
    try {
      await deleteAdminBanner(id)
      setBanners((prev) => prev.filter((b) => b._id !== id))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <h1 className="mb-3 text-xl font-extrabold">Банери головної сторінки</h1>
      <p className="mb-3 text-xs text-text-muted">
        Велика карусель новин/акцій зверху головної сторінки. Порядок — менше
        число йде раніше; неактивний банер на сайті не показується.
      </p>

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
          {editingId ? 'Редагувати банер' : 'Новий банер'}
        </h2>

        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Заголовок"
          className={inputClass}
        />
        <input
          name="subtitle"
          value={form.subtitle}
          onChange={handleChange}
          placeholder="Підзаголовок"
          className={inputClass}
        />
        <input
          name="link"
          value={form.link}
          onChange={handleChange}
          placeholder="Посилання (необов'язково), напр. /category/sets"
          className={inputClass}
        />
        <div className="flex gap-1.5">
          <input
            name="order"
            type="number"
            value={form.order}
            onChange={handleChange}
            placeholder="Порядок"
            className={inputClass}
          />
          <label className="flex items-center gap-2 rounded-xl border border-border bg-surface-raised px-3.5 text-sm">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
              className="h-4 w-4 rounded border-border bg-surface accent-primary"
            />
            Активний
          </label>
        </div>

        <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-dashed border-border-strong px-3.5 py-2.5 text-xs text-text-muted transition hover:border-primary hover:text-text">
          <UploadIcon className="h-4 w-4" />
          {file ? file.name : 'Зображення банера'}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0] || null)}
            className="hidden"
          />
        </label>
        {editingId && !file && (
          <p className="text-xs text-text-subtle">
            Фото не обрано — старе зображення залишиться без змін.
          </p>
        )}

        <div className="flex gap-1.5 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 font-semibold text-black transition hover:bg-primary-light disabled:opacity-60"
          >
            {saving && <SpinnerIcon className="h-4 w-4 animate-spin" />}
            {saving ? 'Зберігаємо…' : editingId ? 'Зберегти' : 'Додати банер'}
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

      {loading ? (
        <p className="flex items-center gap-1.5 text-text-muted">
          <SpinnerIcon className="h-4 w-4 animate-spin" /> Завантаження…
        </p>
      ) : banners.length === 0 ? (
        <p className="text-text-muted">Банерів поки немає.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {banners.map((banner) => (
            <div
              key={banner._id}
              className={`overflow-hidden rounded-2xl border border-border bg-surface ${
                banner.active ? '' : 'opacity-50'
              }`}
            >
              <img
                src={cloudinaryUrl(banner.image, 640)}
                alt={banner.title || ''}
                loading="lazy"
                className="h-28 w-full object-cover"
              />
              <div className="space-y-1 p-3">
                <p className="truncate text-sm font-semibold">
                  {banner.title || '(без заголовка)'}
                </p>
                <p className="text-xs text-text-subtle">
                  Порядок: {banner.order} ·{' '}
                  {banner.active ? 'активний' : 'вимкнений'}
                </p>
                <div className="flex gap-2 pt-1 text-xs">
                  <button
                    onClick={() => startEdit(banner)}
                    className="text-primary-light underline underline-offset-2"
                  >
                    Редагувати
                  </button>
                  <button
                    onClick={() => handleDelete(banner._id)}
                    disabled={deletingId === banner._id}
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
      )}
    </div>
  )
}
