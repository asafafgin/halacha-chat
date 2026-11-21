// מקורות מסוג feed: קובץ נתונים שמפורסם במקום אחר ונקרא ישירות משם, בלי עותק כפול.
// כרגע: ילקוט יוסף מהאתר של צג חומה (js/yalkut-data.js ו־js/yalkut-parts.js).
// הקובץ נטען לזיכרון בפעם הראשונה ומתרענן כל כמה שעות. אם הטעינה נכשלת, משתמשים בגרסה האחרונה שנטענה.

import { readFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import type { LibraryEntry } from '#/data/library'
import type { SourceHit } from '../types'
import { fetchWithTimeout } from './http'
import { normalizeForSearch, stem } from '../text'

type Item = { part: string; siman: string; n: string; text: string; source: string; norm: string }
type Loaded = { at: number; items: Array<Item> }

const TTL = 6 * 60 * 60 * 1000
const cache = new Map<string, Loaded>()
const inflight = new Map<string, Promise<Loaded>>()

async function loadText(url: string) {
  // לפיתוח בלבד: קריאה מתיקייה מקומית של הריפו של צג חומה, כשאין גישה לאתר
  const devDir = process.env.TZAGHOMA_JS_DIR
  if (devDir) return readFile(join(devDir, basename(new URL(url).pathname)), 'utf8')
  const res = await fetchWithTimeout(url, {}, 30000)
  if (!res.ok) throw new Error(`${new URL(url).hostname} ${res.status}`)
  return res.text()
}

/** חילוץ ערך JSON מתוך קובץ JavaScript, בלי להריץ אותו */
function extractJson(js: string, marker: string) {
  const at = js.indexOf(marker)
  if (at < 0) throw new Error(`missing ${marker}`)
  const start = js.slice(at + marker.length).search(/[[{]/) + at + marker.length
  const open = js[start]
  const close = open === '[' ? ']' : '}'
  let depth = 0
  let inStr = false
  for (let i = start; i < js.length; i++) {
    const c = js[i]
    if (inStr) {
      if (c === '\\') i++
      else if (c === '"') inStr = false
      continue
    }
    if (c === '"') inStr = true
    else if (c === open || c === '[' || c === '{') depth++
    else if (c === close || c === ']' || c === '}') {
      depth--
      if (depth === 0) return JSON.parse(js.slice(start, i + 1))
    }
  }
  throw new Error(`unterminated ${marker}`)
}

async function loadYalkut(entry: LibraryEntry): Promise<Loaded> {
  if (entry.access.type !== 'feed') throw new Error('not a feed')
  const [dataJs, partsJs] = await Promise.all([loadText(entry.access.url), loadText(entry.access.partsUrl)])
  const data = extractJson(dataJs, 'TZ_YALKUT =') as Array<Array<[string, string, string, string]>>
  const parts = extractJson(partsJs, 'parts:') as Array<{ name: string }>
  const items: Array<Item> = []
  data.forEach((rows, i) => {
    const part = parts[i]?.name ?? ''
    for (const [siman, n, text, source] of rows) {
      items.push({ part, siman, n, text, source, norm: ' ' + normalizeForSearch(text) + ' ' })
    }
  })
  return { at: Date.now(), items }
}

async function getItems(entry: LibraryEntry) {
  const hit = cache.get(entry.id)
  if (hit && Date.now() - hit.at < TTL) return hit.items
  let p = inflight.get(entry.id)
  if (!p) {
    p = loadYalkut(entry).finally(() => inflight.delete(entry.id))
    inflight.set(entry.id, p)
  }
  try {
    const loaded = await p
    cache.set(entry.id, loaded)
    return loaded.items
  } catch (err) {
    if (hit) return hit.items // גרסה ישנה עדיפה על כלום
    throw err
  }
}

const PREFIX = '(?:ו|ה|ב|ל|מ|ש|כ|וה|וב|ול|ומ|וש|שה|שב|של|מה|כש|דה)?'

function wordPattern(word: string) {
  const s = stem(word)
  if (s.length < 2) return null
  return new RegExp(` ${PREFIX}${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)
}

function refOf(it: Item) {
  const siman = /^[א-ת]{1,4}$/.test(it.siman) ? `סימן ${it.siman}` : it.siman
  return `ילקוט יוסף, ${it.part}, ${siman}, הלכה ${it.n}`
}

export async function searchFeeds(
  words: Array<string>,
  entries: Array<LibraryEntry>,
  mode: 'all' | 'any',
  limit = 3,
): Promise<Array<SourceHit>> {
  const patterns = words.map(wordPattern).filter((p): p is RegExp => Boolean(p))
  if (!patterns.length) return []
  const out: Array<SourceHit> = []
  for (const entry of entries) {
    if (entry.access.type !== 'feed') continue
    const items = await getItems(entry)
    const scored: Array<{ it: Item; score: number }> = []
    for (const it of items) {
      const matched = patterns.filter((p) => p.test(it.norm)).length
      if (mode === 'all' ? matched < patterns.length : matched === 0) continue
      // יותר מילים תואמות קודם; בתיקו, הלכה קצרה וממוקדת קודם
      scored.push({ it, score: matched * 1000 - Math.min(it.norm.length, 999) / 10 })
    }
    scored.sort((a, b) => b.score - a.score)
    for (const { it } of scored.slice(0, limit)) {
      out.push({
        entryId: entry.id,
        ref: refOf(it),
        text: it.text,
        note: it.source ? `מקור בספר: ${it.source}` : undefined,
        url: '',
        repository: 'צג חומה',
        domain: '',
        match: mode === 'all' ? 'ישיר' : 'סוגיה דומה',
      })
    }
  }
  return out
}
