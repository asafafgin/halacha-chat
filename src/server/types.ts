export type SourceHit = {
  entryId: string
  /** מראה מקום בעברית, כפי שהמאגר מחזיר אותו */
  ref: string
  /** לשון המקור, כפי שנמצאה בפועל */
  text: string
  url: string
  /** המאגר שממנו הגיע הטקסט */
  repository: string
  /** דומיין המקור, לסינון אתרים מאושרים */
  domain: string
}
