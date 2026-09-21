import { Logo } from './Logo.jsx'

export const Footer = () => (
  <footer className="mt-16 border-t border-border">
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
      <Logo />
      <p className="text-sm text-text-subtle">
        © {new Date().getFullYear()} Susidy. Суші та роли з доставкою.
      </p>
    </div>
  </footer>
)
