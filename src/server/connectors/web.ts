import { hostOf, type LibraryEntry } from '#/data/library'
import type { SourceHit } from '../types'
import { fetchWithTimeout, stripHtml } from './http'

// קריאה של דפים ספציפיים שנרשמו בספרייה בלבד. אין סריקה של אתרים שלמים ואין עקיפת הגנות.

const cache = new Map<string, { at: number; title: string; paragraphs: Array<string> }>()
const TTL = 60 * 60 * 1000

async function loadPage(url: string) {
  const hit = cache.get(url)
  if (hit && Date.now() - hit.at < TTL) return hit
  const res = await fetchWithTimeout(url)
  if (!res.ok) throw new Error(`${hostOf(url)} ${res.status}`)
  const html = await res.text()
  const title = stripHtml(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '') || url
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? html
  const paragraphs = body
    .split(/<\/(?:p|div|li|h[1-6]|blockquote|td)>|<br\s*\/?>/i)
    .map(stripHtml)
    .filter((p) => p.length > 30)
  const page = { at: Date.now(), title, paragraphs }
  cache.set(url, page)
  return page
}

export async function searchWeb(terms: Array<string>, entries: Array<LibraryEntry>): Promise<Array<SourceHit>> {
  const out: Array<SourceHit> = []
  const words = [...new Set(terms.flatMap((t) => t.split(/\s+/)).filter((w) => w.length > 1))]
  for (const e of entries) {
    if (e.access.type !== 'web') continue
    for (const url of e.access.urls) {
      const page = await loadPage(url)
      let best = { score: 0, text: '' }
      for (const p of page.paragraphs) {
        const score = words.reduce((n, w) => n + (p.includes(w) ? 1 : 0), 0)
        if (score > best.score) best = { score, text: p }
      }
      if (best.score === 0) continue
      out.push({
        entryId: e.id,
        ref: page.title,
        text: best.text.length > 900 ? best.text.slice(0, 900) + '…' : best.text,
        url,
        repository: 'קישור מוגדר',
        domain: hostOf(url),
      })
    }
  }
  return out
}
