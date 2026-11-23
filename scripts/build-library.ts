// בניית עותק מקומי של הספרייה.
//
// מוריד מספריא את הטקסט העברי של כל ספר שרשום ב־src/data/library.ts עם גישה מסוג sefaria,
// ושומר אותו במסד SQLite עם אינדקס חיפוש מלא (FTS5). אחרי זה החיפוש לא פונה לספריא בכלל.
//
// הרצה:  npm run library:build            (כל הספרייה)
//        npm run library:build -- mishnah-berurah tur   (רק רשומות מסוימות)
//
// הקובץ נוצר ב־data/library.db (או בנתיב שב־HALACHA_LIBRARY_DB).

import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { LIBRARY, sefariaPaths, type LibraryEntry } from '../src/data/library.ts'
import { cleanSegment, hebrewNumeral, normalizeForSearch } from '../src/server/text.ts'

const DB_PATH = process.env.HALACHA_LIBRARY_DB || 'data/library.db'
const UA = process.env.HALACHA_USER_AGENT || 'HalachaChat/0.1'

type IndexNode = { title?: string; heTitle?: string; categories?: Array<string>; contents?: Array<IndexNode> }
type SchemaNode = { enTitle?: string; heTitle?: string; key?: string; nodes?: Array<SchemaNode> }
type Jagged = string | Array<Jagged>
type VersionFile = { title: string; heTitle: string; text: Jagged | Record<string, unknown>; schema?: SchemaNode }

async function getJson<T>(url: string): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } })
      if (!res.ok) throw new Error(`${res.status} ${url}`)
      return (await res.json()) as T
    } catch (err) {
      if (attempt >= 3) throw err
      await new Promise((r) => setTimeout(r, 2000 * attempt))
    }
  }
}

function collectBooks(nodes: Array<IndexNode>, out: Array<{ title: string; path: string }> = []) {
  for (const n of nodes) {
    if (n.contents) collectBooks(n.contents, out)
    else if (n.title && n.categories) out.push({ title: n.title, path: [...n.categories, n.title].join('/') })
  }
  return out
}

function booksFor(entry: LibraryEntry, all: Array<{ title: string; path: string }>) {
  const bases = sefariaPaths(entry)
  return all.filter((b) =>
    bases.some((base) => {
      if (b.path === base) return true
      if (!b.path.startsWith(base + '/')) return false
      // פרשנים על הספר אינם חלק מהספר עצמו
      return !b.path.slice(base.length).includes('/Commentary')
    }),
  )
}

type Segment = { refEn: string; refHe: string; text: string }

/** מעבר על מבנה הטקסט של ספריא (מערכים מקוננים, או מילון של צמתים בספר מורכב) */
function walk(text: unknown, enPrefix: string, hePrefix: string, schema: SchemaNode | undefined, out: Array<Segment>) {
  if (text && typeof text === 'object' && !Array.isArray(text)) {
    for (const [key, value] of Object.entries(text as Record<string, unknown>)) {
      const node = schema?.nodes?.find((n) => (n.enTitle ?? n.key ?? '') === key)
      const en = key ? `${enPrefix}, ${key}` : enPrefix
      const he = node?.heTitle ? `${hePrefix}, ${node.heTitle}` : hePrefix
      walk(value, en, he, node, out)
    }
    return
  }
  walkJagged(text as Jagged, enPrefix, hePrefix, [], out)
}

function walkJagged(text: Jagged, en: string, he: string, address: Array<number>, out: Array<Segment>) {
  if (typeof text === 'string') {
    const clean = cleanSegment(text)
    if (!clean) return
    const enAddr = address.map((n) => n + 1).join(':')
    const heAddr = address.map((n) => hebrewNumeral(n + 1)).join(':')
    out.push({ refEn: enAddr ? `${en} ${enAddr}` : en, refHe: heAddr ? `${he} ${heAddr}` : he, text: clean })
    return
  }
  if (!Array.isArray(text)) return
  text.forEach((child, i) => walkJagged(child, en, he, [...address, i], out))
}

async function main() {
  const only = process.argv.slice(2)
  const entries = LIBRARY.filter((e) => e.access.type === 'sefaria' && (!only.length || only.includes(e.id)))

  mkdirSync(dirname(DB_PATH), { recursive: true })
  const db = new DatabaseSync(DB_PATH)
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS segments (
      id INTEGER PRIMARY KEY,
      entry_id TEXT NOT NULL,
      book TEXT NOT NULL,
      ref_en TEXT NOT NULL,
      ref_he TEXT NOT NULL,
      text TEXT NOT NULL,
      source TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS segments_entry ON segments(entry_id);
    CREATE VIRTUAL TABLE IF NOT EXISTS segments_fts USING fts5(norm, content='', tokenize='unicode61');
    CREATE TABLE IF NOT EXISTS books (
      entry_id TEXT NOT NULL,
      title TEXT NOT NULL,
      he_title TEXT NOT NULL,
      segments INTEGER NOT NULL,
      fetched_at TEXT NOT NULL,
      PRIMARY KEY (entry_id, title)
    );
  `)

  console.log('טוען את תוכן העניינים של ספריא…')
  const allBooks = collectBooks(await getJson<Array<IndexNode>>('https://www.sefaria.org/api/index'))

  const insertSeg = db.prepare(
    'INSERT INTO segments (entry_id, book, ref_en, ref_he, text, source) VALUES (?, ?, ?, ?, ?, ?)',
  )
  const insertFts = db.prepare('INSERT INTO segments_fts (rowid, norm) VALUES (?, ?)')
  const insertBook = db.prepare(
    'INSERT OR REPLACE INTO books (entry_id, title, he_title, segments, fetched_at) VALUES (?, ?, ?, ?, ?)',
  )

  for (const entry of entries) {
    const books = booksFor(entry, allBooks)
    console.log(`\n${entry.title}: ${books.length} ספרים`)

    // מחיקת גרסה קודמת של הרשומה (גם מהאינדקס)
    const old = db.prepare('SELECT id, text FROM segments WHERE entry_id = ?').all(entry.id) as Array<{ id: number; text: string }>
    const del = db.prepare("INSERT INTO segments_fts (segments_fts, rowid, norm) VALUES ('delete', ?, ?)")
    db.exec('BEGIN')
    for (const o of old) del.run(o.id, normalizeForSearch(o.text))
    db.prepare('DELETE FROM segments WHERE entry_id = ?').run(entry.id)
    db.prepare('DELETE FROM books WHERE entry_id = ?').run(entry.id)
    db.exec('COMMIT')

    for (const book of books) {
      const url = `https://www.sefaria.org/download/version/${encodeURIComponent(`${book.title} - he - merged`)}.json`
      let file: VersionFile
      try {
        file = await getJson<VersionFile>(url)
      } catch (err) {
        console.warn(`  ✗ ${book.title}: ${(err as Error).message}`)
        continue
      }
      const segments: Array<Segment> = []
      walk(file.text, file.title, file.heTitle, file.schema, segments)

      db.exec('BEGIN')
      for (const s of segments) {
        const { lastInsertRowid } = insertSeg.run(entry.id, file.heTitle, s.refEn, s.refHe, s.text, 'sefaria')
        insertFts.run(lastInsertRowid, normalizeForSearch(s.text))
      }
      insertBook.run(entry.id, book.title, file.heTitle, segments.length, new Date().toISOString())
      db.exec('COMMIT')
      console.log(`  ✓ ${file.heTitle}: ${segments.length} קטעים`)
    }
  }

  db.exec("INSERT INTO segments_fts (segments_fts) VALUES ('optimize')")
  const total = db.prepare('SELECT COUNT(*) AS n FROM segments').get() as { n: number }
  console.log(`\nסיום. ${total.n} קטעים במסד ${DB_PATH}`)
  db.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
