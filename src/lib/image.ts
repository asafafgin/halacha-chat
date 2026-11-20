/** הקטנת תמונה בדפדפן לפני שליחה לשרת (JPEG, עד 1280 פיקסלים בצלע הארוכה) */
export async function resizeImage(file: File, max = 1280): Promise<{ base64: string; dataUrl: string }> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
  return { dataUrl, base64: dataUrl.split(',')[1] }
}
