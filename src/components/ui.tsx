export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-card p-4 shadow-sm">
      <h2 className="mb-3 font-serif text-lg font-bold text-accent">{title}</h2>
      {children}
    </section>
  )
}

export function Notice({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg bg-warn px-4 py-3 text-sm text-warn-ink">{children}</div>
}

export function PageTitle({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h1 className="font-serif text-2xl font-bold">{title}</h1>
      {children && <p className="mt-1 text-sm text-muted">{children}</p>}
    </div>
  )
}
