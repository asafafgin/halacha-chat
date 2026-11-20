// =====================================================================
// הספרייה — המקום היחיד שממנו המערכת לוקחת תשובות.
//
// כל ספר, קישור או מאגר שתרצו שהחיפוש יכלול נרשם כאן.
// מה שלא רשום כאן לא נכנס לתוצאות, גם אם הוא קיים באינטרנט.
//
// סוגי גישה (access):
//   sefaria    — ספר שהטקסט שלו נשלף מספריא. path הוא נתיב הקטגוריה בספריא.
//   wikisource — ספר בוויקיטקסט העברי. titlePrefix הוא תחילת שם הדף.
//   web        — רשימת דפים ספציפיים (קישורים). המערכת קוראת רק את הדפים האלה.
//   none       — רשום בספרייה אבל עדיין לא מחובר טכנית (יוצג כ"לא מחובר").
// =====================================================================

export const COMMUNITIES = ['כללי', 'ספרדי', 'אשכנזי', 'תימני', 'חסידי'] as const
export type Community = (typeof COMMUNITIES)[number]

export type LibraryAccess =
  | { type: 'sefaria'; path: string }
  | { type: 'wikisource'; titlePrefix: string }
  | { type: 'web'; urls: Array<string> }
  | { type: 'none'; note?: string }

export type LibraryEntry = {
  id: string
  /** שם הספר */
  title: string
  /** שם המחבר / הפוסק */
  author: string
  community: Community
  access: LibraryAccess
}

export const LIBRARY: Array<LibraryEntry> = [
  // ---------- כללי ----------
  {
    id: 'tur',
    title: 'טור',
    author: 'רבי יעקב בן אשר',
    community: 'כללי',
    access: { type: 'sefaria', path: 'Halakhah/Tur/Tur' },
  },
  {
    id: 'mishneh-torah',
    title: 'משנה תורה',
    author: 'הרמב״ם',
    community: 'כללי',
    access: { type: 'sefaria', path: 'Halakhah/Mishneh Torah' },
  },
  {
    id: 'peninei-halakhah',
    title: 'פניני הלכה',
    author: 'הרב אליעזר מלמד',
    community: 'כללי',
    access: { type: 'sefaria', path: 'Halakhah/Modern/Peninei Halakhah' },
  },

  // ---------- ספרדי ----------
  {
    id: 'shulchan-arukh-oc',
    title: 'שולחן ערוך, אורח חיים',
    author: 'רבי יוסף קארו',
    community: 'ספרדי',
    access: { type: 'sefaria', path: 'Halakhah/Shulchan Arukh/Shulchan Arukh, Orach Chayim' },
  },
  {
    id: 'shulchan-arukh-yd',
    title: 'שולחן ערוך, יורה דעה',
    author: 'רבי יוסף קארו',
    community: 'ספרדי',
    access: { type: 'sefaria', path: "Halakhah/Shulchan Arukh/Shulchan Arukh, Yoreh De'ah" },
  },
  {
    id: 'ben-ish-hai',
    title: 'בן איש חי',
    author: 'רבי יוסף חיים מבגדאד',
    community: 'ספרדי',
    access: { type: 'sefaria', path: 'Halakhah/Ben Ish Hai' },
  },
  {
    id: 'yalkut-yosef',
    title: 'ילקוט יוסף',
    author: 'הרב יצחק יוסף',
    community: 'ספרדי',
    access: { type: 'none', note: 'ממתין למאגר מורשה' },
  },

  // ---------- אשכנזי ----------
  {
    id: 'mishnah-berurah',
    title: 'משנה ברורה',
    author: 'החפץ חיים',
    community: 'אשכנזי',
    access: { type: 'sefaria', path: 'Halakhah/Shulchan Arukh/Commentary/Mishnah Berurah' },
  },
  {
    id: 'magen-avraham',
    title: 'מגן אברהם',
    author: 'רבי אברהם אבלי גומבינר',
    community: 'אשכנזי',
    access: { type: 'sefaria', path: 'Halakhah/Shulchan Arukh/Commentary/Magen Avraham' },
  },
  {
    id: 'kitzur-shulchan-arukh',
    title: 'קיצור שולחן ערוך',
    author: 'רבי שלמה גנצפריד',
    community: 'אשכנזי',
    access: { type: 'sefaria', path: 'Halakhah/Kitzur Shulchan Arukh' },
  },
  {
    id: 'arukh-hashulchan',
    title: 'ערוך השולחן',
    author: 'רבי יחיאל מיכל עפשטיין',
    community: 'אשכנזי',
    access: { type: 'sefaria', path: 'Halakhah/Arukh HaShulchan' },
  },

  // ---------- חסידי ----------
  {
    id: 'shulchan-arukh-harav',
    title: 'שולחן ערוך הרב',
    author: 'רבי שניאור זלמן מלאדי',
    community: 'חסידי',
    access: { type: 'sefaria', path: 'Halakhah/Shulchan Arukh HaRav' },
  },

  // ---------- תימני ----------
  // הרב קאפח אינו נכלל, לפי האפיון.
  {
    id: 'ratzabi',
    title: 'שלחן ערוך המקוצר',
    author: 'הרב יצחק רצאבי',
    community: 'תימני',
    access: { type: 'none', note: 'ממתין למאגר מורשה' },
  },
  {
    id: 'korach',
    title: 'ספרי הרב שלמה קורח',
    author: 'הרב שלמה קורח',
    community: 'תימני',
    access: { type: 'none', note: 'ממתין למאגר מורשה' },
  },
  {
    id: 'tzubiri',
    title: 'ספרי הרב יוסף צובירי',
    author: 'הרב יוסף צובירי',
    community: 'תימני',
    access: { type: 'none', note: 'ממתין למאגר מורשה' },
  },
]

export function libraryEntry(id: string) {
  return LIBRARY.find((e) => e.id === id)
}

/** הדומיין שממנו מגיע הטקסט של רשומה (לצורך סינון אתרים מאושרים) */
export function entryDomains(entry: LibraryEntry): Array<string> {
  switch (entry.access.type) {
    case 'sefaria':
      return ['sefaria.org']
    case 'wikisource':
      return ['he.wikisource.org']
    case 'web':
      return entry.access.urls.map((u) => hostOf(u))
    case 'none':
      return []
  }
}

export function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function accessLabel(access: LibraryAccess) {
  switch (access.type) {
    case 'sefaria':
      return 'ספריא'
    case 'wikisource':
      return 'ויקיטקסט'
    case 'web':
      return 'קישורים'
    case 'none':
      return 'לא מחובר'
  }
}
