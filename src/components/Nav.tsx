import { Link } from '@tanstack/react-router'
import { APP_NAME } from '#/config'

const LINKS = [
  { to: '/halacha', label: 'חיפוש' },
  { to: '/sources', label: 'מקורות מידע' },
  { to: '/sites', label: 'אתרים מאושרים' },
  { to: '/poskim', label: 'פוסקים' },
] as const

export function Nav() {
  return (
    <header className="border-b border-line bg-card">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/halacha" className="font-serif text-2xl font-bold text-accent">
          {APP_NAME}
        </Link>
        <nav className="flex flex-wrap gap-1 text-sm">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-1.5 text-muted hover:bg-soft hover:text-ink"
              activeProps={{ className: 'rounded-md px-3 py-1.5 bg-soft text-accent font-semibold' }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
