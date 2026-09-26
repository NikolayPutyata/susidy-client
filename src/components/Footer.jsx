import { Logo } from './Logo.jsx'
import { CITIES, LOCATIONS, SOCIAL_LINKS, WORKING_HOURS } from '../lib/constants.js'
import { FacebookIcon, InstagramIcon, MapPinIcon } from './icons.jsx'

export const Footer = () => (
  <footer className="mt-16 border-t border-border">
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-8 sm:grid-cols-[auto_1fr_auto] sm:items-start">
        <Logo />

        <div className="grid gap-4 sm:grid-cols-2">
          {CITIES.map((city) => (
            <div key={city.value} className="text-sm text-text-muted">
              <p className="mb-1.5 font-semibold text-text">{city.label}</p>
              <ul className="space-y-1">
                {LOCATIONS.filter((l) => l.city === city.value).map((location) => (
                  <li key={location.id} className="flex items-start gap-1.5">
                    <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-text-subtle" />
                    {location.address}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex gap-2 sm:justify-end">
          <a
            href={SOCIAL_LINKS.instagram}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-text-muted transition hover:bg-surface-hover hover:text-text"
          >
            <InstagramIcon className="h-5 w-5" />
          </a>
          <a
            href={SOCIAL_LINKS.facebook}
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-text-muted transition hover:bg-surface-hover hover:text-text"
          >
            <FacebookIcon className="h-5 w-5" />
          </a>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-1 text-center text-sm text-text-subtle sm:flex-row sm:justify-between sm:text-left">
        <p>Час роботи: {WORKING_HOURS}</p>
        <p>© {new Date().getFullYear()} Susidy</p>
      </div>
    </div>
  </footer>
)
