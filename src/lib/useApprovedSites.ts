import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_SITES, normalizeDomain, type ApprovedSite } from '#/data/sites'

const KEY = 'halacha-chat:approved-sites'

function read(): Array<ApprovedSite> {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_SITES
    const parsed = JSON.parse(raw) as Array<ApprovedSite>
    return Array.isArray(parsed) ? parsed : DEFAULT_SITES
  } catch {
    return DEFAULT_SITES
  }
}

/** רשימת האתרים המאושרים, שמורה בדפדפן */
export function useApprovedSites() {
  const [sites, setSites] = useState<Array<ApprovedSite>>(DEFAULT_SITES)

  useEffect(() => setSites(read()), [])

  const save = useCallback((next: Array<ApprovedSite>) => {
    setSites(next)
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      /* אחסון לא זמין — הרשימה תישמר רק לחלון הזה */
    }
  }, [])

  return {
    sites,
    enabledDomains: sites.filter((s) => s.enabled).map((s) => s.domain),
    toggle: (domain: string) => save(sites.map((s) => (s.domain === domain ? { ...s, enabled: !s.enabled } : s))),
    remove: (domain: string) => save(sites.filter((s) => s.domain !== domain)),
    add: (name: string, domainInput: string) => {
      const domain = normalizeDomain(domainInput)
      if (!domain || sites.some((s) => s.domain === domain)) return false
      save([...sites, { domain, name: name.trim() || domain, enabled: true }])
      return true
    },
    reset: () => save(DEFAULT_SITES),
  }
}
