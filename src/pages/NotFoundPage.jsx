import { Link } from 'react-router-dom'

export const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
    <p className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-6xl font-extrabold text-transparent">
      404
    </p>
    <p className="text-text-muted">Такої сторінки не існує.</p>
    <Link
      to="/"
      className="mt-2 rounded-full bg-primary px-5 py-2 font-semibold text-black transition hover:bg-primary-light"
    >
      На головну
    </Link>
  </div>
)
