import { Logo } from './Logo.jsx'
import { LOCATIONS, SOCIAL_LINKS } from '../lib/constants.js'
import { FacebookIcon, InstagramIcon, MapPinIcon, PhoneIcon } from './icons.jsx'

export const Footer = () => (
  <footer className="mt-16 border-t border-border">
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-8 sm:grid-cols-[auto_1fr_auto] sm:items-start">
        <Logo />

        <div className="grid gap-4 sm:grid-cols-2">
          {LOCATIONS.map((location) => (
            <div key={location.city} className="text-sm text-text-muted">
              <p className="mb-1.5 font-semibold text-text">{location.label}</p>
              <p className="flex items-start gap-1.5">
                <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-text-subtle" />
                {location.address}
              </p>
              {location.phone && (
                <a
                  href={`tel:${location.phone}`}
                  className="mt-1 flex items-center gap-1.5 hover:text-text"
                >
                  <PhoneIcon className="h-4 w-4 shrink-0 text-text-subtle" />
                  {location.phone}
                </a>
              )}
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

      <p className="mt-8 text-center text-sm text-text-subtle sm:text-left">
        © {new Date().getFullYear()} Susidy
      </p>
    </div>
  </footer>
)
