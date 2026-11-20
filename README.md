# הלכה בצ׳אט

איתור מקורות הלכה מבוססי מקור. המערכת **אינה פוסקת הלכה**: היא מבינה את השאלה, מחפשת רק בספרייה המוגדרת, ומציגה את לשון המקור עם מראה מקום וקישור.

האפיון המלא: [docs/SPEC.md](docs/SPEC.md).

## הרצה

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && node .output/server/index.mjs   # הרצת גרסת ייצור
```

## משתני סביבה

| משתנה | חובה | מה הוא עושה |
|---|---|---|
| `ANTHROPIC_API_KEY` | לא | מפעיל את שכבת הבינה (הבנת שאלה ותיאור תמונה). בלעדיו החיפוש עובד עם חילוץ מילים פשוט, ותיאור תמונה כבוי. |
| `HALACHA_AI_MODEL` | לא | מודל הבינה. ברירת מחדל: `claude-opus-5-5`. |
| `HALACHA_USER_AGENT` | לא | User-Agent לבקשות למאגרים. ויקיטקסט מבקש User-Agent עם פרטי קשר. |

## הספרייה: מאיפה מגיעות התשובות

כל התשובות נלקחות רק מהרשימה שבקובץ [`src/data/library.ts`](src/data/library.ts). כדי להוסיף ספר, קישור או מאגר מוסיפים שם רשומה:

```ts
{
  id: 'mishnah-berurah',
  title: 'משנה ברורה',
  author: 'החפץ חיים',
  community: 'אשכנזי',
  access: { type: 'sefaria', path: 'Halakhah/Shulchan Arukh/Commentary/Mishnah Berurah' },
}
```

סוגי גישה:

- `sefaria`: ספר שהטקסט שלו נשלף מספריא, לפי נתיב הקטגוריה שם.
- `wikisource`: ספר בוויקיטקסט העברי, לפי תחילת שם הדף.
- `web`: רשימת דפים ספציפיים. המערכת קוראת רק את הדפים האלה.
- `none`: רשום, אבל עדיין אין מאגר מורשה. יוצג כ"לא מחובר".

קבצים נוספים:

- [`src/data/sites.ts`](src/data/sites.ts): האתרים המאושרים כברירת מחדל.
- [`src/data/synonyms.ts`](src/data/synonyms.ts): מילון הנרדפות לפי נושא.
- [`src/data/images.ts`](src/data/images.ts): מקורות חזותיים מאושרים.
- [`src/config.ts`](src/config.ts): שם האפליקציה והכתובת הראשית.

## מבנה

- `src/routes/`: העמודים (`/halacha`, `/sources`, `/sites`, `/poskim`; `/` מפנה לחיפוש).
- `src/server/search.ts`: פונקציות השרת של החיפוש ותיאור התמונה.
- `src/server/connectors/`: החיבור לכל מאגר.
- `src/server/ai.ts`: שכבת הבינה, מוגבלת להבנת שאלה ותיאור תמונה.
