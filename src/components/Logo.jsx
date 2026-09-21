export const LogoMark = ({ className = 'h-8 w-8' }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <rect width="32" height="32" rx="9" fill="#000000" />
    <rect
      width="31"
      height="31"
      x="0.5"
      y="0.5"
      rx="8.5"
      stroke="var(--color-border-strong)"
    />
    <circle cx="16" cy="16" r="11.5" fill="var(--color-accent)" />
    <circle cx="16" cy="16" r="7.5" fill="#000000" />
    <circle cx="16" cy="16" r="3.5" fill="var(--color-primary)" />
  </svg>
)

export const Logo = ({ className = '' }) => (
  <span className={`inline-flex items-center gap-2 ${className}`}>
    <LogoMark />
    <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text font-extrabold tracking-tight text-transparent">
      Susidy
    </span>
  </span>
)
