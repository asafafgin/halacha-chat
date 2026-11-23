// חיפוש בעותק המקומי של הספרייה (data/library.db), שנבנה ב־npm run library:build.
// אין כאן שום פנייה לאתר חיצוני בזמן חיפוש.

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import type { LibraryEntry } from '#/data/library'
import type { SourceHit } from '../types'
import { ftsQuery } from '../text'

let db: DatabaseSync | null | undefined

function open() {
  if (db !== undefined) return db
  const path = resolve(process.env.HALACHA_LIBRARY_DB || 'data/library.db')
  db = existsSync(path) ? new DatabaseSync(path, { readOnly: true }) : null
  return db
}

export function localLibraryAvailable() {
  return open() !== null
}

/** רשומות שיש להן טקסט במסד המקומי */
export function localEntryIds(): Set<string> {
  const d = open()
  if (!d) return new Set()
  const rows = d.prepare('SELECT DISTINCT entry_id FROM books').all() as Array<{ entry_id: string }>
  return new Set(rows.map((r) => r.entry_id))
}

type Row = { entry_id: string; book: string; ref_en: string; ref_he: string; text: string; score: number }

export function searchLocal(
  words: Array<string>,
  entries: Array<LibraryEntry>,
  mode: 'all' | 'any',
  perEntry = 3,
  limit = 20,
): Array<SourceHit> {
  const d = open()
  const query = ftsQuery(words, mode)
  if (!d || !query || !entries.length) return []
  const ids = entries.map((e) => e.id)
  const rows = d
    .prepare(
      `SELECT s.entry_id, s.book, s.ref_en, s.ref_he, s.text, bm25(segments_fts) AS score
       FROM segments_fts JOIN segments s ON s.id = segments_fts.rowid
       WHERE segments_fts MATCH ? AND s.entry_id IN (${ids.map(() => '?').join(',')})
       ORDER BY score LIMIT 300`,
    )
    .all(query, ...ids) as Array<Row>

  const counts = new Map<string, number>()
  const out: Array<SourceHit> = []
  for (const r of rows) {
    const n = counts.get(r.entry_id) ?? 0
    if (n >= perEntry) continue
    counts.set(r.entry_id, n + 1)
    out.push({
      entryId: r.entry_id,
      book: r.book,
      ref: r.ref_he,
      text: r.text,
      url: `https://www.sefaria.org/${encodeURIComponent(r.ref_en.replace(/ /g, '_'))}?lang=he`,
      repository: 'ספריא (עותק מקומי)',
      domain: 'sefaria.org',
      match: mode === 'all' ? 'ישיר' : 'סוגיה דומה',
    })
    if (out.length >= limit) break
  }
  return out
}
