export const Logo = ({ className = 'text-center items-center', imgClassName = 'w-[150px]' }) => (
  <span className={`inline-flex items-center gap-2 ${className}`}>
    <img src="/logo.png" alt="Сусіди" className={imgClassName} />
  </span>
)
