import type { LibraryEntry } from '#/data/library'
import type { SourceHit } from '../types'
import { fetchWithTimeout, stripHtml } from './http'

const API = 'https://he.wikisource.org/w/api.php'

/** חיפוש בוויקיטקסט, רק בדפים ששמם מתחיל בכותרת שהוגדרה בספרייה */
export async function searchWikisource(term: string, entries: Array<LibraryEntry>): Promise<Array<SourceHit>> {
  const out: Array<SourceHit> = []
  for (const e of entries) {
    if (e.access.type !== 'wikisource') continue
    const params = new URLSearchParams({
      action: 'query',
      list: 'search',
      srsearch: `${term} prefix:${e.access.titlePrefix}`,
      srlimit: '5',
      srnamespace: '0',
      format: 'json',
      origin: '*',
    })
    const res = await fetchWithTimeout(`${API}?${params}`)
    if (!res.ok) throw new Error(`Wikisource ${res.status}`)
    const data = (await res.json()) as { query?: { search?: Array<{ title: string; snippet: string }> } }
    for (const r of data.query?.search ?? []) {
      if (!r.title.startsWith(e.access.titlePrefix)) continue
      const text = stripHtml(r.snippet)
      if (!text) continue
      out.push({
        entryId: e.id,
        ref: r.title,
        text,
        url: `https://he.wikisource.org/wiki/${encodeURIComponent(r.title.replace(/ /g, '_'))}`,
        repository: 'ויקיטקסט',
        domain: 'he.wikisource.org',
      })
    }
  }
  return out
}
