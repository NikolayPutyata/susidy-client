import { useCity } from '../hooks/useCity.js'
import { CITIES } from '../lib/constants.js'

// Показується, поки юзер жодного разу не обрав місто — від цього залежить,
// яка з цін товару (priceKiev/priceKharkov) показується й додається в кошик.
export const CityModal = () => {
  const { city, setCity } = useCity()

  if (city) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-surface p-6 text-center">
        <h2 className="mb-1 text-xl font-extrabold">Оберіть місто</h2>
        <p className="mb-5 text-sm text-text-muted">
          Від міста залежать ціни та точки самовивозу.
        </p>
        <div className="flex flex-col gap-2">
          {CITIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCity(c.value)}
              className="rounded-full bg-primary py-3 font-semibold text-black transition hover:bg-primary-light"
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
