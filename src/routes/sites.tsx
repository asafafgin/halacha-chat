import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Card, PageTitle } from '#/components/ui'
import { useApprovedSites } from '#/lib/useApprovedSites'

export const Route = createFileRoute('/sites')({
  component: SitesPage,
  head: () => ({ meta: [{ title: 'אתרים מאושרים · הלכה בצ׳אט' }] }),
})

function SitesPage() {
  const { sites, toggle, remove, add, reset } = useApprovedSites()
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <PageTitle title="אתרים מאושרים">
        מקורות מאתר שאינו מסומן כאן לא יוצגו. הרשימה נשמרת בדפדפן, והסינון מתבצע בשרת.
      </PageTitle>

      <Card title="הוספת אתר">
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault()
            setMsg(add(name, domain) ? 'האתר נוסף.' : 'כתובת לא תקינה או שהאתר כבר ברשימה.')
            setName('')
            setDomain('')
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="שם האתר"
            className="rounded-lg border border-line bg-bg px-3 py-2"
          />
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.org"
            dir="ltr"
            className="flex-1 rounded-lg border border-line bg-bg px-3 py-2"
            required
          />
          <button className="rounded-lg bg-accent px-4 py-2 font-semibold text-card">הוספה</button>
        </form>
        {msg && <p className="mt-2 text-sm text-muted">{msg}</p>}
      </Card>

      <Card title={`רשימת האתרים (${sites.filter((s) => s.enabled).length} פעילים מתוך ${sites.length})`}>
        <ul className="divide-y divide-line">
          {sites.map((s) => (
            <li key={s.domain} className="flex items-center gap-3 py-2 text-sm">
              <input type="checkbox" checked={s.enabled} onChange={() => toggle(s.domain)} id={`s-${s.domain}`} />
              <label htmlFor={`s-${s.domain}`} className="flex-1">
                <span className={s.enabled ? 'font-semibold' : 'text-muted'}>{s.name}</span>{' '}
                <span dir="ltr" className="text-xs text-muted">
                  {s.domain}
                </span>
              </label>
              <button type="button" onClick={() => remove(s.domain)} className="text-xs text-muted hover:text-ink">
                מחיקה
              </button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={reset} className="mt-3 text-sm text-accent underline">
          שחזור ברירת מחדל
        </button>
      </Card>
    </div>
  )
}
