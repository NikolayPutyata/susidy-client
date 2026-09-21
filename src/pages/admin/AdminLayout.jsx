import { NavLink, Outlet } from 'react-router-dom'

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm ${
    isActive ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
  }`

export const AdminLayout = () => {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Адмінка</h1>
      <nav className="mb-6 flex gap-2">
        <NavLink to="/admin/orders" className={linkClass}>
          Замовлення
        </NavLink>
        <NavLink to="/admin/products" className={linkClass}>
          Товари
        </NavLink>
        <NavLink to="/admin/users" className={linkClass}>
          Клієнти
        </NavLink>
      </nav>
      <Outlet />
    </div>
  )
}
