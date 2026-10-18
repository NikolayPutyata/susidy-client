import { NavLink, Outlet } from 'react-router-dom'
import { BoxIcon, ImageIcon, ReceiptIcon, UsersIcon } from '../../components/icons.jsx'

const linkClass = ({ isActive }) =>
  `flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition ${
    isActive
      ? 'bg-primary text-black'
      : 'text-text-muted hover:bg-surface-hover hover:text-text'
  }`

export const AdminLayout = () => {
  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6 mt-8">
        <aside className="lg:w-56 lg:shrink-0">
          <p className="mb-2 hidden text-xs font-semibold uppercase tracking-widest text-text-subtle lg:block">
            Адмін панель
          </p>
          <nav className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            <NavLink to="/admin/orders" className={linkClass}>
              <ReceiptIcon className="h-4.5 w-4.5" />
              Замовлення
            </NavLink>
            <NavLink to="/admin/products" className={linkClass}>
              <BoxIcon className="h-4.5 w-4.5" />
              Товари
            </NavLink>
            <NavLink to="/admin/banners" className={linkClass}>
              <ImageIcon className="h-4.5 w-4.5" />
              Банери
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
    </div>
  )
}
