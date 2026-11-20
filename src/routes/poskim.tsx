import { createFileRoute } from '@tanstack/react-router'
import { Card, PageTitle } from '#/components/ui'
import { COMMUNITIES, LIBRARY, accessLabel } from '#/data/library'

export const Route = createFileRoute('/poskim')({
  component: PoskimPage,
  head: () => ({ meta: [{ title: 'פוסקים · הלכה בצ׳אט' }] }),
})

function PoskimPage() {
  return (
    <div className="space-y-4">
      <PageTitle title="פוסקים וספרים לפי עדה">
        הספרים שבספרייה. ספר שמסומן "לא מחובר" רשום, אבל עדיין אין מאגר מורשה שממנו נשלף הטקסט שלו.
      </PageTitle>
      <div className="grid gap-4 sm:grid-cols-2">
        {COMMUNITIES.map((c) => {
          const books = LIBRARY.filter((e) => e.community === c)
          return (
            <Card key={c} title={c}>
              {books.length === 0 ? (
                <p className="text-sm text-muted">אין עדיין ספרים בעדה זו.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {books.map((b) => (
                    <li key={b.id}>
                      <div className="font-semibold">{b.author}</div>
                      <div className="text-muted">
                        {b.title} · {accessLabel(b.access)}
                        {b.access.type === 'none' && b.access.note ? ` (${b.access.note})` : ''}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {c === 'תימני' && <p className="mt-3 text-xs text-muted">פוסקים נוספים יתווספו לאחר אישור.</p>}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
