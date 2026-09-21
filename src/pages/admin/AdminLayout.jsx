import { NavLink, Outlet } from 'react-router-dom'
import { BoxIcon, ReceiptIcon, UsersIcon } from '../../components/icons.jsx'

const linkClass = ({ isActive }) =>
  `flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
    isActive
      ? 'bg-primary text-black'
      : 'text-text-muted hover:bg-surface-hover hover:text-text'
  }`

export const AdminLayout = () => {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      <aside className="lg:w-56 lg:shrink-0">
        <p className="mb-3 hidden text-xs font-semibold uppercase tracking-widest text-text-subtle lg:block">
          Адмінка
        </p>
        <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
          <NavLink to="/admin/orders" className={linkClass}>
            <ReceiptIcon className="h-4.5 w-4.5" />
            Замовлення
          </NavLink>
          <NavLink to="/admin/products" className={linkClass}>
            <BoxIcon className="h-4.5 w-4.5" />
            Товари
          </NavLink>
          <NavLink to="/admin/users" className={linkClass}>
            <UsersIcon className="h-4.5 w-4.5" />
            Клієнти
          </NavLink>
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  )
}
