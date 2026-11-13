export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <section className="relative overflow-hidden bg-ink-950 pt-44 pb-24">
        <div className="absolute inset-0 bg-gradient-to-br from-ink-950 via-brand-950 to-ink-900" />
        <div className="container-page relative space-y-5">
          <div className="h-4 w-40 rounded bg-white/10" />
          <div className="h-12 w-2/3 max-w-xl rounded-lg bg-white/10" />
          <div className="h-5 w-1/2 max-w-md rounded bg-white/10" />
        </div>
      </section>
      <div className="container-page grid gap-6 py-16 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card overflow-hidden">
            <div className="skeleton aspect-[16/10] rounded-none" />
            <div className="space-y-3 p-6">
              <div className="skeleton h-3 w-24" />
              <div className="skeleton h-5 w-full" />
              <div className="skeleton h-5 w-3/4" />
              <div className="skeleton h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
