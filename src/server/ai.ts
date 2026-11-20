// שכבת הבינה המלאכותית. תפקידה מוגבל:
//   1. הבנת השאלה (מה שואלים בפועל, נושא, ניסוח חיפוש)
//   2. תיאור עובדתי של תמונה
// היא לא פוסקת, לא מנסחת שאלות חדשות, לא מציעה שאלות ולא מביאה מקורות.
// בלי ANTHROPIC_API_KEY המערכת עובדת בלי בינה, עם חילוץ מילים פשוט.

import Anthropic from '@anthropic-ai/sdk'
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod'
import { z } from 'zod'
import { TOPICS, detectTopic, keywords } from '#/data/synonyms'

const MODEL = process.env.HALACHA_AI_MODEL || 'claude-opus-5-5'

let client: Anthropic | null = null
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null
  client ??= new Anthropic()
  return client
}

export function aiEnabled() {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}

export type Understanding = {
  /** מה השואל שואל בפועל, בלשונו ככל האפשר */
  intent: string
  topic: string | null
  /** ניסוח חיפוש קצר בלשון ספרי ההלכה */
  searchQuery: string
  aiUsed: boolean
}

const UnderstandingSchema = z.object({
  intent: z.string(),
  topic: z.string().nullable(),
  search_query: z.string(),
})

const UNDERSTAND_SYSTEM = `אתה רכיב בתוך מנוע חיפוש מקורות הלכה. התפקיד שלך הוא רק להבין את השאלה, לא לענות עליה.

החזר:
- intent: משפט אחד שמתאר מה השואל שואל בפועל. השתמש בלשון השואל ככל האפשר. אל תנסח שאלה חדשה, אל תרחיב אותה ואל תציע שאלות נוספות.
- topic: אחד מהנושאים ברשימה, או null אם אף אחד לא מתאים: ${TOPICS.map((t) => t.topic).join(', ')}.
- search_query: 2 עד 5 מילים בלשון ספרי ההלכה (למשל "ברכת אתרוג" או "נטילת לולב"), שיתאימו לחיפוש טקסט בשולחן ערוך ובנושאי כליו.

אל תפסוק, אל תציין מקורות, ספרים, סימנים או שמות רבנים, ואל תכתוב תשובה לשאלה.
אם צורף תיאור תמונה, הוא הקשר בלבד. השאלה היא מה שהמשתמש כתב.`

export async function understandQuestion(question: string, imageDescription?: string): Promise<Understanding> {
  const c = getClient()
  if (!c) return heuristicUnderstanding(question)

  try {
    const content = imageDescription
      ? `שאלה: ${question}\n\nתיאור התמונה שצורפה (הקשר בלבד): ${imageDescription}`
      : `שאלה: ${question}`
    const response = await c.beta.messages.parse({
      model: MODEL,
      max_tokens: 2000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low', format: betaZodOutputFormat(UnderstandingSchema) },
      system: UNDERSTAND_SYSTEM,
      messages: [{ role: 'user', content }],
    })
    const parsed = response.stop_reason === 'refusal' ? null : response.parsed_output
    if (!parsed) return heuristicUnderstanding(question)
    const topic = TOPICS.some((t) => t.topic === parsed.topic) ? parsed.topic : null
    return {
      intent: parsed.intent.trim() || question,
      topic,
      searchQuery: parsed.search_query.trim() || keywords(question).join(' '),
      aiUsed: true,
    }
  } catch (err) {
    console.error('understandQuestion failed', err)
    return heuristicUnderstanding(question)
  }
}

function heuristicUnderstanding(question: string): Understanding {
  const words = keywords(question)
  return {
    intent: question,
    topic: detectTopic(question)?.topic ?? null,
    searchQuery: words.slice(0, 5).join(' '),
    aiUsed: false,
  }
}

const IMAGE_SYSTEM = `תאר את מה שרואים בתמונה באופן עובדתי בלבד, בעברית, ב־1 עד 3 משפטים.
תאר צורה, צבע, סימנים ופגמים נראים לעין (למשל "כתם חום קטן בצד האתרוג, קרוב לפיטם").
אל תקבע כשרות או פסלות, אל תפסוק, אל תנסח שאלה ואל תציע מה לשאול.`

export async function describeImage(base64: string, mediaType: 'image/jpeg' | 'image/png' | 'image/webp') {
  const c = getClient()
  if (!c) return null
  const response = await c.beta.messages.create({
    model: MODEL,
    max_tokens: 1000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low' },
    system: IMAGE_SYSTEM,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text', text: 'תאר את התמונה.' },
        ],
      },
    ],
  })
  if (response.stop_reason === 'refusal') return null
  const text = response.content
    .flatMap((b) => (b.type === 'text' ? [b.text] : []))
    .join(' ')
    .trim()
  return text || null
}
