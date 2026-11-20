import { useEffect, useRef, useState } from 'react'

// הכתבה קולית בעברית דרך Web Speech API של הדפדפן (נתמך בכרום, אדג' וספארי).

type Recognition = {
  lang: string
  interimResults: boolean
  continuous: boolean
  start: () => void
  stop: () => void
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> ; resultIndex: number }) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
}

function getCtor(): (new () => Recognition) | undefined {
  if (typeof window === 'undefined') return undefined
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition
}

export function useDictation(onText: (text: string) => void) {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const rec = useRef<Recognition | null>(null)
  const cb = useRef(onText)
  cb.current = onText

  useEffect(() => setSupported(Boolean(getCtor())), [])

  function start() {
    const Ctor = getCtor()
    if (!Ctor) return
    const r = new Ctor()
    r.lang = 'he-IL'
    r.interimResults = false
    r.continuous = false
    r.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) cb.current(e.results[i][0].transcript.trim())
      }
    }
    r.onerror = (e) => setError(e.error === 'not-allowed' ? 'אין הרשאה למיקרופון.' : 'ההכתבה נכשלה.')
    r.onend = () => setListening(false)
    rec.current = r
    setError(null)
    setListening(true)
    r.start()
  }

  return { supported, listening, error, start, stop: () => rec.current?.stop() }
}
