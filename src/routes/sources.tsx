import { createFileRoute } from '@tanstack/react-router'
import { Card, PageTitle } from '#/components/ui'
import { REPOSITORIES } from '#/data/repositories'
import { LIBRARY, accessLabel } from '#/data/library'

export const Route = createFileRoute('/sources')({
  component: SourcesPage,
  head: () => ({ meta: [{ title: 'מקורות מידע · הלכה בצ׳אט' }] }),
})

const RULES = [
  'המערכת אינה פוסקת הלכה. הבינה המלאכותית משמשת רק להבנת השאלה ולתיאור תמונה.',
  'תשובות נלקחות רק מהספרייה המוגדרת: הספרים, הקישורים והמאגרים שרשומים בה.',
  'כל מקור מוצג כך: שם הרב ← שם הספר ← סימן / סעיף / עמוד ← לשון המקור ← קישור.',
  'אסור לכתוב "הרב פלוני פסק ש…" על סמך הסקה. אם נמצאה רק סוגיה דומה, זה נאמר במפורש.',
  'אם לא נמצא מקור, או שכל המקורות סוננו, מוצגת הודעה מפורשת ולא תשובה.',
  'אין עקיפת הגנות ואין שימוש במאגרים בלי הרשאה.',
]

function SourcesPage() {
  return (
    <div className="space-y-4">
      <PageTitle title="מקורות מידע">מדיניות המקורות, הספרייה והמאגרים המחוברים.</PageTitle>
      <Card title="מדיניות">
        <ul className="list-disc space-y-1 pr-5 text-sm">
          {RULES.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </Card>
      <Card title="מאגרים">
        <ul className="divide-y divide-line text-sm">
          {REPOSITORIES.map((r) => (
            <li key={r.name} className="flex flex-wrap items-baseline justify-between gap-2 py-2">
              <span className="font-semibold">{r.name}</span>
              <span className={r.status === 'פעיל' ? 'text-accent' : 'text-muted'}>{r.status}</span>
              <span className="w-full text-muted">{r.note}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card title={`הספרייה (${LIBRARY.length} ספרים)`}>
        <p className="mb-3 text-sm text-muted">
          זו הרשימה שממנה בלבד נלקחות תשובות. היא מוגדרת בקובץ <code>src/data/library.ts</code>.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead className="text-right text-muted">
              <tr>
                <th className="p-2 font-normal">ספר</th>
                <th className="p-2 font-normal">מחבר</th>
                <th className="p-2 font-normal">עדה</th>
                <th className="p-2 font-normal">מקור הטקסט</th>
              </tr>
            </thead>
            <tbody>
              {LIBRARY.map((e) => (
                <tr key={e.id} className="border-t border-line">
                  <td className="p-2">{e.title}</td>
                  <td className="p-2">{e.author}</td>
                  <td className="p-2">{e.community}</td>
                  <td className={`p-2 ${e.access.type === 'none' ? 'text-warn-ink' : ''}`}>{accessLabel(e.access)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
