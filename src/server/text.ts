// כלי טקסט עבריים: ניקוי, נרמול לחיפוש, מספרים עבריים ובניית שאילתות.

const NIQQUD = /[֑-ׇ]/g

/** ניקוי קטע טקסט מספריא: בלי הערות שוליים ובלי תגיות HTML */
export function cleanSegment(html: string) {
  return html
    .replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, '')
    .replace(/<i[^>]*class="footnote"[^>]*>[\s\S]*?<\/i>/gi, '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

/** נרמול לאינדקס: בלי ניקוד וטעמים, בלי פיסוק, אחיד בגרשיים */
export function normalizeForSearch(text: string) {
  return text
    .replace(NIQQUD, '')
    .replace(/[״"׳']/g, '')
    .replace(/[^א-ת0-9a-zA-Z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const ONES = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט']
const TENS = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ']
const HUNDREDS = ['', 'ק', 'ר', 'ש', 'ת', 'תק', 'תר', 'תש', 'תת', 'תתק']

/** מספר עברי בכתיב של מראי מקום: 15 → ט״ו, 649 → תרמ״ט, 1 → א׳ */
export function hebrewNumeral(n: number) {
  if (n <= 0 || n >= 1000) return String(n)
  let s = HUNDREDS[Math.floor(n / 100)]
  const rest = n % 100
  if (rest === 15) s += 'טו'
  else if (rest === 16) s += 'טז'
  else s += TENS[Math.floor(rest / 10)] + ONES[rest % 10]
  return s.length === 1 ? `${s}׳` : `${s.slice(0, -1)}״${s.slice(-1)}`
}

const PREFIXES = ['', 'ו', 'ה', 'ב', 'ל', 'מ', 'ש', 'כ', 'וה', 'וב', 'ול', 'ומ', 'וש', 'שה', 'שב', 'של', 'מה', 'כש', 'דה']

/** גזע גס למילה עברית: בלי אותיות שימוש בתחילה ובלי סיומות */
export function stem(word: string) {
  let w = normalizeForSearch(word)
  if (w.length > 4) w = w.replace(/^(וה|וב|ול|ומ|וש|שה|שב|ו|ה|ב|ל|מ|ש|כ)/, '')
  if (w.length > 3) w = w.replace(/(ים|ין|ות|יה|ה|ת|ו)$/, '')
  return w
}

/**
 * שאילתת FTS5 למילה אחת: הגזע + תחיליות נפוצות, כולן כחיפוש קידומת.
 * כך "מברכים" ימצא גם "ומברך", "שמברכין" וכו׳.
 */
function wordQuery(word: string) {
  const s = stem(word)
  if (s.length < 2) return null
  return '(' + PREFIXES.map((p) => `"${p}${s}"*`).join(' OR ') + ')'
}

/** כל המילים חייבות להופיע (mode=all), או לפחות אחת (mode=any) */
export function ftsQuery(words: Array<string>, mode: 'all' | 'any') {
  const parts = words.map(wordQuery).filter((q): q is string => Boolean(q))
  if (!parts.length) return null
  return parts.join(mode === 'all' ? ' AND ' : ' OR ')
}
