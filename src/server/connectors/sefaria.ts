import type { LibraryEntry } from '#/data/library'
import type { SourceHit } from '../types'
import { fetchWithTimeout, stripHtml } from './http'

const SEARCH_URL = 'https://www.sefaria.org/api/search-wrapper'

type SefariaSource = { ref?: string; heRef?: string; path?: string; exact?: string }

/** חיפוש בספריא, מוגבל לנתיבי הספרים שברשימה בלבד */
export async function searchSefaria(term: string, entries: Array<LibraryEntry>): Promise<Array<SourceHit>> {
  const paths = entries.flatMap((e) => (e.access.type === 'sefaria' ? [{ id: e.id, path: e.access.path }] : []))
  if (!paths.length) return []

  const res = await fetchWithTimeout(SEARCH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: term,
      type: 'text',
      field: 'naive_lemmatizer',
      slop: 10,
      size: 40,
      source_proj: ['ref', 'heRef', 'path', 'exact'],
      filters: paths.map((p) => p.path),
      filter_fields: paths.map(() => 'path'),
    }),
  })
  if (!res.ok) throw new Error(`Sefaria ${res.status}`)
  const data = (await res.json()) as { hits?: { hits?: Array<{ _source?: SefariaSource }> } }

  const out: Array<SourceHit> = []
  const seen = new Set<string>()
  for (const h of data.hits?.hits ?? []) {
    const s = h._source ?? {}
    if (!s.ref || seen.has(s.ref)) continue
    // התאמה לרשומה בספרייה לפי הנתיב הארוך ביותר שמתאים
    const match = paths
      .filter((p) => {
        if (s.path === p.path) return true
        if (!s.path?.startsWith(p.path + '/')) return false
        // פרשנים על הספר (Commentary) אינם חלק מהספר עצמו
        return !s.path.slice(p.path.length).includes('/Commentary')
      })
      .sort((a, b) => b.path.length - a.path.length)[0]
    if (!match) continue
    const text = stripHtml(s.exact ?? '')
    if (!text) continue
    seen.add(s.ref)
    out.push({
      entryId: match.id,
      ref: s.heRef || s.ref,
      text,
      url: `https://www.sefaria.org/${encodeURIComponent(s.ref.replace(/ /g, '_'))}?lang=he`,
      repository: 'ספריא',
      domain: 'sefaria.org',
    })
  }
  return out
}
