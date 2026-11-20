// מקורות חזותיים מאושרים (Whitelist). אין חיפוש תמונות אקראי באינטרנט.
// כל פריט: תמונה ממקור תורני + שם הספר/האתר + קישור להסבר המקורי.
// המערכת לא קובעת כשרות לפי תמונה.

export type ApprovedImage = {
  keys: Array<string>
  title: string
  image: string
  page: string
  site: string
}

export const APPROVED_IMAGES: Array<ApprovedImage> = [
  {
    keys: ['לולב', 'נפרצו', 'נפרדו'],
    title: 'איורי כתב יד הרמב״ם — נפרצו / נפרדו עליו',
    image: 'https://www.toraland.org.il/media/5265876/dekel2.jpg',
    page: 'https://www.toraland.org.il/%D7%94%D7%A6%D7%95%D7%9E%D7%97-%D7%95%D7%94%D7%97%D7%99-%D7%91%D7%9E%D7%A9%D7%A0%D7%AA-%D7%94%D7%A8%D7%9E%D7%91%D7%9D/%D7%96%D7%99%D7%94%D7%95%D7%99-%D7%94%D7%A6%D7%9E%D7%97%D7%99%D7%9D/%D7%93%D7%A7%D7%9C/',
    site: 'מכון התורה והארץ',
  },
]

export function findApprovedImages(text: string) {
  return APPROVED_IMAGES.filter((i) => i.keys.some((k) => text.includes(k)))
}
