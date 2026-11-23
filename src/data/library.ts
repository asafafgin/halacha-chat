// =====================================================================
// הספרייה — המקום היחיד שממנו המערכת לוקחת תשובות.
//
// כל ספר, קישור או מאגר שתרצו שהחיפוש יכלול נרשם כאן.
// מה שלא רשום כאן לא נכנס לתוצאות, גם אם הוא קיים באינטרנט.
//
// סוגי גישה (access):
//   sefaria    — ספר שהטקסט שלו נשלף מספריא. path הוא נתיב הקטגוריה בספריא (או כמה נתיבים).
//   wikisource — ספר בוויקיטקסט העברי. titlePrefix הוא תחילת שם הדף.
//   web        — רשימת דפים ספציפיים (קישורים). המערכת קוראת רק את הדפים האלה.
//   feed       — קובץ נתונים שמפורסם במקום אחר (למשל באתר צג חומה). נקרא ישירות משם, בלי עותק כפול.
//   none       — רשום בספרייה אבל עדיין לא מחובר טכנית (יוצג כ"לא מחובר").
// =====================================================================

export const COMMUNITIES = ['כללי', 'ספרדי', 'אשכנזי', 'תימני', 'חסידי'] as const
export type Community = (typeof COMMUNITIES)[number]

export type LibraryAccess =
  | { type: 'sefaria'; path: string | Array<string> }
  | { type: 'wikisource'; titlePrefix: string }
  | { type: 'web'; urls: Array<string> }
  | { type: 'feed'; format: 'tzaghoma-yalkut'; url: string; partsUrl: string; credit: string }
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
    title: 'קיצור שולחן ערוך ילקוט יוסף',
    author: 'הרב יצחק יוסף',
    community: 'ספרדי',
    access: {
      type: 'feed',
      format: 'tzaghoma-yalkut',
      url: 'https://tzaghoma.co.il/kneset/js/yalkut-data.js',
      partsUrl: 'https://tzaghoma.co.il/kneset/js/yalkut-parts.js',
      credit: 'קיצור שולחן ערוך ילקוט יוסף (תשס״ז), באישור המכון להצגה במסכי צג חומה',
    },
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

  // ---------- שו״ת ----------
  {
    id: 'rashba',
    title: 'שו״ת הרשב״א',
    author: 'רבי שלמה בן אדרת',
    community: 'כללי',
    access: { type: 'sefaria', path: "Responsa/Rishonim/Rashba" },
  },
  {
    id: 'teshuvot-harosh',
    title: 'תשובות הרא״ש',
    author: 'רבנו אשר בן יחיאל',
    community: 'כללי',
    access: { type: 'sefaria', path: "Responsa/Rishonim/Teshuvot HaRosh" },
  },
  {
    id: 'teshuvot-harambam',
    title: 'תשובות הרמב״ם',
    author: 'הרמב״ם',
    community: 'כללי',
    access: { type: 'sefaria', path: "Responsa/Rishonim/Rambam/Teshuvot HaRambam" },
  },
  {
    id: 'rivash',
    title: 'שו״ת הריב״ש',
    author: 'רבי יצחק בר ששת',
    community: 'כללי',
    access: { type: 'sefaria', path: "Responsa/Rishonim/Teshuvot HaRivash" },
  },
  {
    id: 'teshuvot-haran',
    title: 'שו״ת הר״ן',
    author: 'רבנו נסים גירונדי',
    community: 'כללי',
    access: { type: 'sefaria', path: "Responsa/Rishonim/Teshuvot HaRan" },
  },
  {
    id: 'bmareh-habazak',
    title: 'שו״ת במראה הבזק',
    author: 'רבני ארץ חמדה',
    community: 'כללי',
    access: { type: 'sefaria', path: "Responsa/Modern/B'Mareh HaBazak" },
  },
  {
    id: 'radbaz',
    title: 'שו״ת הרדב״ז',
    author: 'רבי דוד בן זמרה',
    community: 'ספרדי',
    access: { type: 'sefaria', path: "Responsa/Acharonim/Radbaz" },
  },
  {
    id: 'maharit',
    title: 'שו״ת מהרי״ט',
    author: 'רבי יוסף מטראני',
    community: 'ספרדי',
    access: { type: 'sefaria', path: "Responsa/Acharonim/Teshuvot Maharit" },
  },
  {
    id: 'maharashdam',
    title: 'שו״ת מהרשד״ם',
    author: 'רבי שמואל די מדינה',
    community: 'ספרדי',
    access: { type: 'sefaria', path: "Responsa/Acharonim/Responsa Maharashdam" },
  },
  {
    id: 'rav-pealim',
    title: 'שו״ת רב פעלים',
    author: 'רבי יוסף חיים מבגדאד',
    community: 'ספרדי',
    access: { type: 'sefaria', path: "Responsa/Acharonim/Responsa Rav Pealim" },
  },
  {
    id: 'mishpetei-uziel',
    title: 'משפטי עוזיאל',
    author: 'הרב בן ציון מאיר חי עוזיאל',
    community: 'ספרדי',
    access: { type: 'sefaria', path: "Responsa/Modern/Mishpetei Uziel" },
  },
  {
    id: 'terumat-hadeshen',
    title: 'תרומת הדשן',
    author: 'רבי ישראל איסרלין',
    community: 'אשכנזי',
    access: { type: 'sefaria', path: "Responsa/Rishonim/Terumat HaDeshen" },
  },
  {
    id: 'teshuvot-maharam',
    title: 'תשובות מהר״ם',
    author: 'מהר״ם מרוטנבורג',
    community: 'אשכנזי',
    access: { type: 'sefaria', path: "Responsa/Rishonim/Teshuvot Maharam" },
  },
  {
    id: 'teshuvot-harema',
    title: 'שו״ת הרמ״א',
    author: 'רבי משה איסרליש',
    community: 'אשכנזי',
    access: { type: 'sefaria', path: "Responsa/Acharonim/Responsa of Rema" },
  },
  {
    id: 'teshuvot-habach',
    title: 'תשובות הב״ח',
    author: 'רבי יואל סירקיש',
    community: 'אשכנזי',
    access: { type: 'sefaria', path: "Responsa/Acharonim/Teshuvot Bayit Chadash" },
  },
  {
    id: 'maharshal',
    title: 'תשובות מהרש״ל',
    author: 'רבי שלמה לוריא',
    community: 'אשכנזי',
    access: { type: 'sefaria', path: "Responsa/Acharonim/Teshuvot Maharshal" },
  },
  {
    id: 'chakham-tzvi',
    title: 'שו״ת חכם צבי',
    author: 'רבי צבי הירש אשכנזי',
    community: 'אשכנזי',
    access: { type: 'sefaria', path: "Responsa/Acharonim/Chakham Tzvi" },
  },
  {
    id: 'havot-yair',
    title: 'שו״ת חוות יאיר',
    author: 'רבי יאיר חיים בכרך',
    community: 'אשכנזי',
    access: { type: 'sefaria', path: "Responsa/Acharonim/Havot Yair" },
  },
  {
    id: 'noda-biyehudah',
    title: 'נודע ביהודה',
    author: 'רבי יחזקאל לנדא',
    community: 'אשכנזי',
    access: { type: 'sefaria', path: ["Responsa/Acharonim/Noda BiYehudah I", "Responsa/Acharonim/Noda BiYehudah II"] },
  },
  {
    id: 'chatam-sofer',
    title: 'שו״ת חתם סופר',
    author: 'רבי משה סופר',
    community: 'אשכנזי',
    access: { type: 'sefaria', path: "Responsa/Acharonim/Responsa Chatam Sofer" },
  },
  {
    id: 'rabbi-akiva-eiger',
    title: 'תשובות רבי עקיבא איגר',
    author: 'רבי עקיבא איגר',
    community: 'אשכנזי',
    access: { type: 'sefaria', path: ["Responsa/Acharonim/Teshuvot Rabbi Akiva Eiger", "Responsa/Acharonim/Teshuvot Rabbi Akiva Eiger HaChadashot", "Responsa/Acharonim/Teshuvot Rabbi Akiva Eiger Tinyana"] },
  },
  {
    id: 'shoel-umeshiv',
    title: 'שואל ומשיב',
    author: 'רבי יוסף שאול נתנזון',
    community: 'אשכנזי',
    access: { type: 'sefaria', path: "Responsa/Acharonim/Shoel uMeshiv" },
  },
  {
    id: 'maharsham',
    title: 'שו״ת מהרש״ם',
    author: 'רבי שלום מרדכי שבדרון',
    community: 'אשכנזי',
    access: { type: 'sefaria', path: ["Responsa/Acharonim/Teshuvot Maharsham Volume I", "Responsa/Acharonim/Teshuvot Maharsham Volume II", "Responsa/Acharonim/Teshuvot Maharsham Volume III"] },
  },
  {
    id: 'melammed-lehoil',
    title: 'מלמד להועיל',
    author: 'רבי דוד צבי הופמן',
    community: 'אשכנזי',
    access: { type: 'sefaria', path: ["Responsa/Acharonim/Melammed Lehoil", "Responsa/Acharonim/Melammed Lehoil Part II", "Responsa/Acharonim/Melammed Lehoil Part III"] },
  },

  {
    id: 'teshuvot-hageonim',
    title: 'תשובות הגאונים',
    author: 'הגאונים',
    community: 'כללי',
    access: { type: 'sefaria', path: [
        "Responsa/Geonim/Teshuvot HaGeonim",
        "Responsa/Geonim/Toratan shel Rishonim",
        "Responsa/Geonim/Musafia Teshuvot HaGeonim",
        "Responsa/Geonim/Teshuvot HaGeonim (Harkavy)",
        "Responsa/Geonim/Teshuvot HaGeonim (Shaarei Teshuva)",
      ] },
  },
  {
    id: 'teshuvot-rashi',
    title: 'תשובות רש״י',
    author: 'רש״י',
    community: 'כללי',
    access: { type: 'sefaria', path: "Responsa/Rishonim/Teshuvot Rashi" },
  },
  {
    id: 'ri-migash',
    title: 'תשובות הר״י מיגאש',
    author: 'רבי יוסף אבן מיגאש',
    community: 'כללי',
    access: { type: 'sefaria', path: "Responsa/Rishonim/Teshuvot HaRi Migash" },
  },
  {
    id: 'peer-hador',
    title: 'פאר הדור, תשובות הרמב״ם',
    author: 'הרמב״ם',
    community: 'כללי',
    access: { type: 'sefaria', path: "Responsa/Rishonim/Rambam/Pe'er HaDor Teshuvot HaRambam" },
  },
  {
    id: 'min-hashamayim',
    title: 'שאלות ותשובות מן השמים',
    author: 'רבי יעקב ממרויש',
    community: 'כללי',
    access: { type: 'sefaria', path: "Responsa/Rishonim/Teshuvot Min HaShamayim" },
  },
  {
    id: 'rashbash',
    title: 'תשובות הרשב״ש',
    author: 'רבי שלמה בן שמעון דוראן',
    community: 'ספרדי',
    access: { type: 'sefaria', path: "Responsa/Rishonim/Teshuvot HaRashbash" },
  },
  {
    id: 'avkat-rokhel',
    title: 'אבקת רוכל',
    author: 'רבי יוסף קארו',
    community: 'ספרדי',
    access: { type: 'sefaria', path: "Responsa/Acharonim/Avkat Rokhel" },
  },
  {
    id: 'divrei-rivot',
    title: 'דברי ריבות',
    author: 'רבי יצחק אדרבי',
    community: 'ספרדי',
    access: { type: 'sefaria', path: "Responsa/Acharonim/Divrei Rivot" },
  },
  {
    id: 'halakhot-ketanot',
    title: 'הלכות קטנות',
    author: 'רבי יעקב חגיז',
    community: 'ספרדי',
    access: { type: 'sefaria', path: "Responsa/Acharonim/Halakhot Ketanot" },
  },
  {
    id: 'admat-kodesh',
    title: 'אדמת קודש',
    author: 'רבי נסים חיים משה מזרחי',
    community: 'ספרדי',
    access: { type: 'sefaria', path: "Responsa/Acharonim/Admat Kodesh" },
  },
  {
    id: 'yein-hatov',
    title: 'יין הטוב',
    author: 'הרב יצחק נסים',
    community: 'ספרדי',
    access: { type: 'sefaria', path: "Responsa/Yein HaTov" },
  },
  {
    id: 'maharach-or-zarua',
    title: 'תשובות מהר״ח אור זרוע',
    author: 'רבי חיים בן יצחק אור זרוע',
    community: 'אשכנזי',
    access: { type: 'sefaria', path: "Responsa/Rishonim/Maharach Or Zarua Responsa" },
  },
  {
    id: 'sefer-hatashbetz',
    title: 'ספר התשב״ץ',
    author: 'רבי שמשון בן צדוק',
    community: 'אשכנזי',
    access: { type: 'sefaria', path: "Responsa/Rishonim/Sefer HaTashbetz" },
  },
  {
    id: 'maharil',
    title: 'שו״ת מהרי״ל',
    author: 'רבי יעקב מולין',
    community: 'אשכנזי',
    access: { type: 'sefaria', path: "Responsa/Rishonim/Teshuvot Maharil" },
  },
  {
    id: 'mahari-weil',
    title: 'שו״ת מהר״י וייל',
    author: 'רבי יעקב וייל',
    community: 'אשכנזי',
    access: { type: 'sefaria', path: "Responsa/Rishonim/Mahari Weil" },
  },
  {
    id: 'mahari-bruna',
    title: 'שו״ת מהר״י ברונא',
    author: 'רבי ישראל ברונא',
    community: 'אשכנזי',
    access: { type: 'sefaria', path: "Responsa/Rishonim/Mahari Bruna" },
  },
  {
    id: 'maharik',
    title: 'שו״ת מהרי״ק',
    author: 'רבי יוסף קולון',
    community: 'אשכנזי',
    access: { type: 'sefaria', path: "Responsa/Rishonim/Teshuvot Maharik" },
  },
  {
    id: 'maharam-padua',
    title: 'שו״ת מהר״ם פדוואה',
    author: 'רבי מאיר קצנלנבוגן',
    community: 'אשכנזי',
    access: { type: 'sefaria', path: "Responsa/Acharonim/Responsa Maharam of Padua" },
  },
  {
    id: 'beer-sheva',
    title: 'באר שבע',
    author: 'רבי יששכר בער איילנבורג',
    community: 'אשכנזי',
    access: { type: 'sefaria', path: "Responsa/Acharonim/Be'er Sheva" },
  },
  {
    id: 'sheilat-yaavetz',
    title: 'שאילת יעבץ',
    author: 'רבי יעקב עמדין',
    community: 'אשכנזי',
    access: { type: 'sefaria', path: "Responsa/Acharonim/Sheilat Yaavetz" },
  },
  {
    id: 'shaagat-aryeh',
    title: 'שאגת אריה החדשות',
    author: 'רבי אריה לייב גינצבורג',
    community: 'אשכנזי',
    access: { type: 'sefaria', path: "Responsa/Acharonim/Sha'agat Aryeh HaChadashot" },
  },
  {
    id: 'teshuva-meahava',
    title: 'תשובה מאהבה',
    author: 'רבי אלעזר פלקלש',
    community: 'אשכנזי',
    access: { type: 'sefaria', path: "Responsa/Acharonim/Teshuva MeAhava Part I" },
  },
  {
    id: 'haelef-lekha-shlomo',
    title: 'האלף לך שלמה',
    author: 'רבי שלמה קלוגר',
    community: 'אשכנזי',
    access: { type: 'sefaria', path: "Responsa/Acharonim/HaElef Lekha Shlomo" },
  },
  {
    id: 'binyan-tziyon',
    title: 'בנין ציון',
    author: 'רבי יעקב עטלינגר',
    community: 'אשכנזי',
    access: { type: 'sefaria', path: "Responsa/Acharonim/Binyan Tziyon" },
  },
  {
    id: 'meshiv-davar',
    title: 'משיב דבר',
    author: 'הנצי״ב מוולוז׳ין',
    community: 'אשכנזי',
    access: { type: 'sefaria', path: "Responsa/Acharonim/Teshuvot Meshiv Davar" },
  },
  {
    id: 'beer-yitzchak',
    title: 'באר יצחק',
    author: 'רבי יצחק אלחנן ספקטור',
    community: 'אשכנזי',
    access: { type: 'sefaria', path: "Responsa/Acharonim/Be'er Yitzchak" },
  },
  {
    id: 'benei-banim',
    title: 'שו״ת בני בנים',
    author: 'הרב יהודה הרצל הנקין',
    community: 'אשכנזי',
    access: { type: 'sefaria', path: "Responsa/Modern/Responsa Benei Banim" },
  },
  {
    id: 'chiddushei-harim-teshuvot',
    title: 'שו״ת חידושי הרי״מ',
    author: 'רבי יצחק מאיר אלתר מגור',
    community: 'חסידי',
    access: { type: 'sefaria', path: "Responsa/Acharonim/Chiddushei HaRim Responsa" },
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

/** נתיבי ספריא של רשומה */
export function sefariaPaths(entry: LibraryEntry): Array<string> {
  if (entry.access.type !== 'sefaria') return []
  return Array.isArray(entry.access.path) ? entry.access.path : [entry.access.path]
}

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
    case 'feed':
      // הטקסט נמסר מקובץ שאושר לנו, לא מאתר מקורות; אין עליו סינון אתרים
      return []
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
    case 'feed':
      return 'צג חומה'
    case 'none':
      return 'לא מחובר'
  }
}
