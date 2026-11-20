// רשימת האתרים המאושרים כברירת מחדל.
// המשתמש יכול לשנות אותה בעמוד "אתרים מאושרים"; השינוי נשמר בדפדפן,
// והסינון בפועל מתבצע בשרת לפי הרשימה שנשלחת עם כל חיפוש.

export type ApprovedSite = {
  domain: string
  name: string
  enabled: boolean
}

export const DEFAULT_SITES: Array<ApprovedSite> = [
  { domain: 'sefaria.org', name: 'ספריא', enabled: true },
  { domain: 'sefaria.org.il', name: 'ספריא (ישראל)', enabled: true },
  { domain: 'he.wikisource.org', name: 'ויקיטקסט', enabled: true },
  { domain: 'hebrewbooks.org', name: 'HebrewBooks', enabled: true },
  { domain: 'otzar.org', name: 'אוצר החכמה', enabled: true },
  { domain: 'toraland.org.il', name: 'מכון התורה והארץ', enabled: true },
  { domain: 'ph.yhb.org.il', name: 'פניני הלכה', enabled: true },
  { domain: 'mechon-mamre.org', name: 'מכון ממרא', enabled: true },
  { domain: 'daat.ac.il', name: 'דעת', enabled: true },
  { domain: 'yeshiva.org.il', name: 'ישיבה', enabled: true },
  { domain: 'din.org.il', name: 'דין', enabled: true },
  { domain: 'halachayomit.co.il', name: 'הלכה יומית', enabled: true },
  { domain: 'asif.co.il', name: 'אסיף', enabled: true },
  { domain: 'toratemetfreeware.com', name: 'תורת אמת', enabled: true },
  { domain: 'shulchanaruchharav.com', name: 'שולחן ערוך הרב', enabled: true },
  { domain: 'kipa.co.il', name: 'כיפה', enabled: false },
  { domain: 'moreshet.co.il', name: 'מורשת', enabled: false },
  { domain: 'hidabroot.org', name: 'הידברות', enabled: false },
  { domain: 'chabad.org', name: 'חב״ד', enabled: false },
]

export function normalizeDomain(input: string) {
  let d = input.trim().toLowerCase()
  d = d.replace(/^https?:\/\//, '').replace(/^www\./, '')
  d = d.split('/')[0]
  return d
}

/** האם host שייך לאחד הדומיינים המאושרים (כולל תת־דומיינים) */
export function hostAllowed(host: string, domains: Array<string>) {
  const h = normalizeDomain(host)
  return domains.some((d) => h === d || h.endsWith('.' + d))
}
