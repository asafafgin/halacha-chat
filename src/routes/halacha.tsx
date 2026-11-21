import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { Card, Notice } from '#/components/ui'
import { COMMUNITIES, LIBRARY } from '#/data/library'
import { MAX_QUESTION_LENGTH } from '#/config'
import { useApprovedSites } from '#/lib/useApprovedSites'
import { resizeImage } from '#/lib/image'
import { useDictation } from '#/lib/useDictation'
import { describeUploadedImage, searchHalacha, type SearchResponse } from '#/server/search'

export const Route = createFileRoute('/halacha')({
  component: HalachaPage,
  head: () => ({ meta: [{ title: 'חיפוש · הלכה בצ׳אט' }] }),
})

type Community = 'הכל' | (typeof COMMUNITIES)[number]

function HalachaPage() {
  const [question, setQuestion] = useState('')
  const [community, setCommunity] = useState<Community>('הכל')
  const [poskim, setPoskim] = useState<Array<string>>([])
  const [image, setImage] = useState<{ preview: string; description: string | null; note: string | null } | null>(null)
  const [imageBusy, setImageBusy] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SearchResponse | null>(null)
  const { enabledDomains } = useApprovedSites()
  const dictation = useDictation((text) =>
    setQuestion((q) => (q ? `${q} ${text}` : text).slice(0, MAX_QUESTION_LENGTH)),
  )
  const fileRef = useRef<HTMLInputElement>(null)

  async function runSearch() {
    const q = question.trim()
    if (!q || busy) return
    setBusy(true)
    setError(null)
    try {
      const res = await searchHalacha({
        data: {
          question: q,
          imageDescription: image?.description ?? undefined,
          community,
          poskim,
          approvedDomains: enabledDomains,
        },
      })
      setResult(res)
    } catch (err) {
      console.error(err)
      setError('החיפוש נכשל. נסו שוב בעוד רגע.')
    } finally {
      setBusy(false)
    }
  }

  async function onImage(file: File | undefined) {
    if (!file) return
    setImageBusy(true)
    try {
      const { base64, dataUrl } = await resizeImage(file)
      setImage({ preview: dataUrl, description: null, note: null })
      const res = await describeUploadedImage({ data: { base64, mediaType: 'image/jpeg' } })
      setImage({ preview: dataUrl, description: res.description, note: res.reason })
    } catch (err) {
      console.error(err)
      setImage((img) => (img ? { ...img, note: 'לא ניתן היה לעבד את התמונה.' } : null))
    } finally {
      setImageBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-line bg-card p-4 shadow-sm sm:p-5">
        <label htmlFor="q" className="mb-2 block font-serif text-xl font-bold">
          מה השאלה?
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="q"
            value={question}
            maxLength={MAX_QUESTION_LENGTH}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSearch()}
            placeholder="למשל: מה מברכים על אתרוג?"
            className="min-w-0 flex-1 rounded-lg border border-line bg-bg px-3 py-2.5 text-base outline-none focus:border-accent"
          />
          <div className="flex gap-2">
            {dictation.supported && (
              <button
                type="button"
                onClick={dictation.listening ? dictation.stop : dictation.start}
                className={`rounded-lg border border-line px-3 py-2.5 text-sm ${dictation.listening ? 'bg-warn text-warn-ink' : 'bg-card hover:bg-soft'}`}
                aria-pressed={dictation.listening}
              >
                {dictation.listening ? 'מקשיב… עצור' : '🎙 הכתבה'}
              </button>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-lg border border-line bg-card px-3 py-2.5 text-sm hover:bg-soft"
              disabled={imageBusy}
            >
              {imageBusy ? 'מעבד…' : '📷 תמונה'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onImage(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={runSearch}
              disabled={busy || !question.trim()}
              className="rounded-lg bg-accent px-5 py-2.5 font-semibold text-card disabled:opacity-50"
            >
              {busy ? 'מחפש…' : 'חיפוש'}
            </button>
          </div>
        </div>
        <div className="mt-1 text-left text-xs text-muted">
          {question.length}/{MAX_QUESTION_LENGTH}
        </div>

        {image && (
          <div className="mt-3 flex gap-3 rounded-lg bg-soft p-3 text-sm">
            <img src={image.preview} alt="התמונה שצורפה" className="h-20 w-20 rounded object-cover" />
            <div className="flex-1">
              <div className="font-semibold">תיאור עובדתי של התמונה</div>
              <div className="text-muted">
                {image.description ?? image.note ?? 'מתאר…'}
              </div>
              <div className="mt-1 text-xs text-muted">התיאור משמש הקשר לשאלה בלבד ואינו קובע כשרות.</div>
            </div>
            <button type="button" onClick={() => setImage(null)} className="self-start text-muted hover:text-ink" aria-label="הסרת התמונה">
              ✕
            </button>
          </div>
        )}

        <Filters community={community} setCommunity={setCommunity} poskim={poskim} setPoskim={setPoskim} />
        {dictation.error && <p className="mt-2 text-sm text-warn-ink">{dictation.error}</p>}
      </section>

      {error && <Notice>{error}</Notice>}
      {result && <Results result={result} />}
    </div>
  )
}

function Filters(props: {
  community: Community
  setCommunity: (c: Community) => void
  poskim: Array<string>
  setPoskim: (p: Array<string>) => void
}) {
  const { community, setCommunity, poskim, setPoskim } = props
  const shown = LIBRARY.filter((e) => community === 'הכל' || e.community === community)
  return (
    <div className="mt-4 space-y-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted">עדה:</span>
        {(['הכל', ...COMMUNITIES] as Array<Community>).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setCommunity(c)
              setPoskim([])
            }}
            className={`rounded-full border px-3 py-1 ${community === c ? 'border-accent bg-soft font-semibold text-accent' : 'border-line hover:bg-soft'}`}
          >
            {c}
          </button>
        ))}
      </div>
      <details>
        <summary className="cursor-pointer text-muted">
          פוסק / ספר {poskim.length ? `(${poskim.length} נבחרו)` : '(כל הספרים)'}
        </summary>
        <div className="mt-2 grid gap-1 sm:grid-cols-2">
          {shown.map((e) => (
            <label key={e.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={poskim.includes(e.id)}
                onChange={() => setPoskim(poskim.includes(e.id) ? poskim.filter((p) => p !== e.id) : [...poskim, e.id])}
              />
              <span>
                {e.title} <span className="text-muted">· {e.author}</span>
                {e.access.type === 'none' && <span className="text-warn-ink"> · לא מחובר</span>}
              </span>
            </label>
          ))}
        </div>
      </details>
    </div>
  )
}

function Results({ result }: { result: SearchResponse }) {
  const { stageA, stageB, results } = result
  const comparison = Object.values(
    results.reduce<Record<string, (typeof results)[number]>>((acc, r) => {
      acc[r.entryId] ??= r
      return acc
    }, {}),
  )
  return (
    <div className="space-y-4">
      <Card title="שלב א׳ · הבנת השאלה">
        <dl className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
          <dt className="text-muted">מה נשאל בפועל</dt>
          <dd>{stageA.intent}</dd>
          <dt className="text-muted">נושא</dt>
          <dd>{stageA.topic ?? 'לא זוהה נושא מהמילון'}</dd>
          <dt className="text-muted">ניסוח החיפוש</dt>
          <dd>{stageA.searchQuery || '—'}</dd>
        </dl>
        {!stageA.aiUsed && (
          <p className="mt-2 text-xs text-muted">ההבנה נעשתה בחילוץ מילים פשוט, בלי בינה מלאכותית.</p>
        )}
      </Card>

      <Card title="שלב ב׳ · סוגיה דומה וחיפוש במאגרים">
        <p className="text-sm">
          מונחי חיפוש: <span className="text-muted">{stageB.terms.join(' · ') || '—'}</span>
        </p>
        {stageB.similar ? (
          <p className="mt-1 text-sm">
            הסוגיה הקרובה שנמצאה:{' '}
            <a href={stageB.similar.url} target="_blank" rel="noreferrer" className="text-accent underline">
              {stageB.similar.ref}
            </a>
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted">לא נמצאה סוגיה בספרי הספרייה.</p>
        )}
      </Card>

      {result.notConnected.length > 0 && (
        <Notice>
          אין עדיין מאגר מחובר עבור: {result.notConnected.map((n) => `${n.title} (${n.author})`).join(', ')}. לא הוצגו
          מהם מקורות.
        </Notice>
      )}

      {results.length === 0 ? (
        <Notice>
          {result.filteredOutBySites > 0
            ? `נמצאו ${result.filteredOutBySites} מקורות, אבל כולם מאתרים שאינם ברשימת האתרים המאושרים. לא מוצגת תשובה.`
            : result.unavailable.length > 0
              ? `לא ניתן היה לחפש כרגע: ${result.unavailable.join(', ')} לא זמין. זה לא אומר שאין מקור. נסו שוב מאוחר יותר.`
              : 'לא נמצא מקור בספרייה המוגדרת לשאלה הזו. לא מוצגת תשובה.'}
        </Notice>
      ) : (
        <>
          {result.filteredOutBySites > 0 && (
            <p className="text-xs text-muted">{result.filteredOutBySites} מקורות נוספים סוננו כי אינם מאתרים מאושרים.</p>
          )}

          <Card title={`מקורות (${results.length})`}>
            <ol className="space-y-4">
              {results.map((r) => (
                <li key={`${r.entryId}|${r.ref}`} className="border-b border-line pb-4 last:border-0 last:pb-0">
                  <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
                    <span className="font-semibold">{r.author}</span>
                    <span className="text-muted">←</span>
                    <span className="font-semibold">{r.title}</span>
                    <span className="text-muted">←</span>
                    <span>{r.ref}</span>
                    {r.match === 'סוגיה דומה' && (
                      <span className="rounded bg-warn px-1.5 text-xs text-warn-ink">סוגיה דומה בלבד</span>
                    )}
                  </div>
                  <blockquote className="mt-2 border-r-2 border-accent pr-3 font-serif text-lg leading-relaxed">
                    <LongText text={r.text} />
                  </blockquote>
                  <div className="mt-2 flex flex-wrap gap-x-3 text-xs text-muted">
                    <span>עדה: {r.community}</span>
                    <span>מאגר: {r.repository}</span>
                    <a href={r.url} target="_blank" rel="noreferrer" className="text-accent underline">
                      לקישור למקור
                    </a>
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          {comparison.length > 1 && (
            <Card title="השוואת פוסקים · בלי הכרעה">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead className="text-right text-muted">
                    <tr>
                      <th className="p-2 font-normal">ספר / פוסק</th>
                      <th className="p-2 font-normal">עדה</th>
                      <th className="p-2 font-normal">לשון המקור</th>
                      <th className="p-2 font-normal">מראה מקום</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map((r) => (
                      <tr key={r.entryId} className="border-t border-line align-top">
                        <td className="p-2">
                          {r.title}
                          <div className="text-xs text-muted">{r.author}</div>
                        </td>
                        <td className="p-2">{r.community}</td>
                        <td className="p-2 font-serif">{r.text.length > 220 ? r.text.slice(0, 220) + '…' : r.text}</td>
                        <td className="p-2">
                          <a href={r.url} target="_blank" rel="noreferrer" className="text-accent underline">
                            {r.ref}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      {result.images.length > 0 && (
        <Card title="מקור חזותי מאושר">
          {result.images.map((img) => (
            <figure key={img.image} className="flex flex-col gap-3 sm:flex-row">
              <img src={img.image} alt={img.title} className="max-h-48 rounded border border-line object-contain" />
              <figcaption className="text-sm">
                <div className="font-semibold">{img.title}</div>
                <div className="text-muted">{img.site}</div>
                <a href={img.page} target="_blank" rel="noreferrer" className="text-accent underline">
                  להסבר המקורי באתר
                </a>
                <p className="mt-2 text-xs text-muted">התמונה להמחשה מתוך מקור תורני. המערכת אינה קובעת כשרות.</p>
              </figcaption>
            </figure>
          ))}
        </Card>
      )}

      {results.length > 0 && result.unavailable.length > 0 && (
        <Notice>
          {result.unavailable.join(', ')} לא זמין כרגע, ולכן ייתכן שיש מקורות נוספים שלא הוצגו.
        </Notice>
      )}
    </div>
  )
}

function LongText({ text, max = 600 }: { text: string; max?: number }) {
  const [open, setOpen] = useState(false)
  if (text.length <= max) return <>{text}</>
  return (
    <>
      {open ? text : text.slice(0, max) + '…'}{' '}
      <button type="button" onClick={() => setOpen(!open)} className="font-sans text-sm text-accent underline">
        {open ? 'פחות' : 'להמשך הקטע'}
      </button>
    </>
  )
}
