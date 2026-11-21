import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { COMMUNITIES, LIBRARY, entryDomains, type LibraryEntry } from '#/data/library'
import { hostAllowed, normalizeDomain } from '#/data/sites'
import { TOPICS, keywords } from '#/data/synonyms'
import { findApprovedImages, type ApprovedImage } from '#/data/images'
import { MAX_QUESTION_LENGTH } from '#/config'
import { aiEnabled, describeImage, understandQuestion, type Understanding } from './ai'
import { searchSefaria } from './connectors/sefaria'
import { searchWikisource } from './connectors/wikisource'
import { searchWeb } from './connectors/web'
import type { SourceHit } from './types'
import { localEntryIds, searchLocal } from './connectors/local'
import { normalizeForSearch, stem } from './text'

const SearchInput = z.object({
  question: z.string().trim().min(1).max(MAX_QUESTION_LENGTH),
  imageDescription: z.string().max(2000).optional(),
  community: z.enum(['הכל', ...COMMUNITIES]).default('הכל'),
  poskim: z.array(z.string()).default([]),
  approvedDomains: z.array(z.string()).default([]),
})

export type SearchResult = SourceHit & {
  title: string
  author: string
  community: string
  /** האם כל מילות החיפוש העיקריות נמצאו בטקסט, או שזו רק סוגיה דומה */
  match: 'ישיר' | 'סוגיה דומה'
}

export type SearchResponse = {
  stageA: Understanding
  stageB: {
    terms: Array<string>
    /** הסוגיה הקרובה ביותר שנמצאה בספרי ההלכה שבספרייה */
    similar: { title: string; ref: string; url: string } | null
  }
  results: Array<SearchResult>
  /** כמה תוצאות נמצאו אבל סוננו כי האתר שלהן לא ברשימה המאושרת */
  filteredOutBySites: number
  /** פוסקים שנבחרו אבל עדיין אין להם מאגר מחובר */
  notConnected: Array<{ title: string; author: string; note?: string }>
  images: Array<ApprovedImage>
  /** מאגרים שלא ענו בזמן החיפוש */
  unavailable: Array<string>
  errors: Array<string>
}

function buildTerms(u: Understanding, question: string) {
  const terms: Array<string> = []
  const add = (t: string | undefined) => {
    const v = t?.trim()
    if (v && !terms.includes(v)) terms.push(v)
  }
  add(u.searchQuery)
  // מילון הנרדפות: מונחים מהנושא שמופיעים גם בשאלה, ואז המונח הראשי של הנושא
  const topic = TOPICS.find((t) => t.topic === u.topic)
  if (topic) {
    for (const t of topic.terms) if (question.includes(t)) add(t)
    add(`${keywords(question).find((w) => !topic.terms.includes(w)) ?? ''} ${topic.terms[0]}`)
  }
  add(keywords(question).slice(0, 4).join(' '))
  return terms.slice(0, 4)
}

function selectEntries(community: string, poskim: Array<string>) {
  return LIBRARY.filter((e) => {
    if (poskim.length) return poskim.includes(e.id)
    if (community !== 'הכל') return e.community === community
    return true
  })
}

function isDirect(text: string, query: string) {
  const words = keywords(query)
  return words.length > 0 && words.every((w) => normalizeForSearch(text).includes(stem(w)))
}

export const searchHalacha = createServerFn({ method: 'POST' })
  .validator(SearchInput)
  .handler(async ({ data }): Promise<SearchResponse> => {
    const errors: Array<string> = []
    const domains = data.approvedDomains.map(normalizeDomain).filter(Boolean)

    // שלב א׳ — הבנת השאלה
    const stageA = await understandQuestion(data.question, data.imageDescription)
    const terms = buildTerms(stageA, data.question)

    // בחירת הספרים לפי עדה / פוסק, ואז לפי האתרים המאושרים
    const selected = selectEntries(data.community, data.poskim)
    const filtered = data.poskim.length > 0 || data.community !== 'הכל'
    const notConnected = selected
      .filter(() => filtered)
      .filter((e) => e.access.type === 'none')
      .map((e) => ({ title: e.title, author: e.author, note: e.access.type === 'none' ? e.access.note : undefined }))
    const connected = selected.filter((e) => e.access.type !== 'none')
    const allowed = connected.filter((e) => entryDomains(e).every((d) => hostAllowed(d, domains)))
    const blockedEntries = new Set(connected.filter((e) => !allowed.includes(e)).map((e) => e.id))

    // שלב ב׳ — חיפוש בספרים שבספרייה בלבד
    const hits: Array<SourceHit> = []
    const seen = new Set<string>()
    const push = (list: Array<SourceHit>) => {
      for (const h of list) {
        const key = `${h.entryId}|${h.ref}`
        if (seen.has(key)) continue
        seen.add(key)
        hits.push(h)
      }
    }
    // מחפשים גם בספרים שנחסמו, רק כדי לדווח כמה תוצאות סוננו
    const searchable = connected
    const unavailable = new Set<string>()

    // ספרים שיש להם עותק מקומי: מחפשים רק בו, בלי פנייה לאתרים
    const localIds = localEntryIds()
    const localEntries = searchable.filter((e) => localIds.has(e.id))
    const remoteEntries = searchable.filter((e) => !localIds.has(e.id))
    if (localEntries.length) {
      const mainWords = keywords(stageA.searchQuery)
      push(searchLocal(mainWords, localEntries, 'all'))
      for (const term of terms.slice(1)) {
        if (hits.length >= 12) break
        push(searchLocal(keywords(term), localEntries, 'all'))
      }
      // אם אין התאמה מלאה: סוגיה דומה (לפחות חלק מהמילים)
      if (!hits.length) push(searchLocal(mainWords, localEntries, 'any'))
    }

    if (remoteEntries.length) {
      for (const term of terms) {
        const [sef, wiki] = await Promise.allSettled([
          searchSefaria(term, remoteEntries),
          searchWikisource(term, remoteEntries),
        ])
        if (sef.status === 'fulfilled') push(sef.value)
        else {
          unavailable.add('ספריא')
          errors.push(`ספריא: ${String(sef.reason?.message ?? sef.reason)}`)
        }
        if (wiki.status === 'fulfilled') push(wiki.value)
        else {
          unavailable.add('ויקיטקסט')
          errors.push(`ויקיטקסט: ${String(wiki.reason?.message ?? wiki.reason)}`)
        }
        if (hits.filter((h) => !blockedEntries.has(h.entryId)).length >= 12) break
      }
      try {
        push(await searchWeb(terms, remoteEntries))
      } catch (err) {
        unavailable.add('קישורים מוגדרים')
        errors.push(`קישורים: ${String((err as Error).message ?? err)}`)
      }
    }

    const byId = new Map<string, LibraryEntry>(LIBRARY.map((e) => [e.id, e]))
    const visible = hits.filter((h) => !blockedEntries.has(h.entryId) && hostAllowed(h.domain, domains))
    const filteredOutBySites = hits.length - visible.length

    const results: Array<SearchResult> = visible.map((h) => {
      const e = byId.get(h.entryId)!
      return {
        ...h,
        title: h.book || e.title,
        author: e.author,
        community: e.community,
        match: h.match ?? (isDirect(h.text, stageA.searchQuery) ? 'ישיר' : 'סוגיה דומה'),
      } satisfies SearchResult
    })
      // התאמות ישירות קודם, בלי לשנות את סדר המאגר בתוך כל קבוצה
      .sort((a, b) => Number(b.match === 'ישיר') - Number(a.match === 'ישיר'))
      .slice(0, 15)

    const top = results[0]
    return {
      stageA,
      stageB: {
        terms,
        similar: top ? { title: top.title, ref: top.ref, url: top.url } : null,
      },
      results,
      filteredOutBySites,
      notConnected,
      images: findApprovedImages(`${data.question} ${data.imageDescription ?? ''}`),
      unavailable: [...unavailable],
      errors: [...new Set(errors)],
    }
  })

const ImageInput = z.object({
  base64: z.string().max(8_000_000),
  mediaType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
})

export const describeUploadedImage = createServerFn({ method: 'POST' })
  .validator(ImageInput)
  .handler(async ({ data }) => {
    if (!aiEnabled()) return { description: null, reason: 'תיאור תמונה דורש חיבור לשירות בינה (ANTHROPIC_API_KEY).' }
    try {
      return { description: await describeImage(data.base64, data.mediaType), reason: null }
    } catch (err) {
      console.error('describeImage failed', err)
      return { description: null, reason: 'תיאור התמונה נכשל.' }
    }
  })

export const getStatus = createServerFn({ method: 'GET' }).handler(async () => ({ ai: aiEnabled() }))
