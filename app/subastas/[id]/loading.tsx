export default function LoadingAuction() {
  return (
    <article aria-busy="true" aria-label="Cargando subasta" className="animate-pulse space-y-8">
      <header className="space-y-2">
        <div className="h-4 w-32 rounded bg-surface-strong" />
        <div className="h-8 w-3/4 rounded bg-surface-strong" />
      </header>
      <div className="aspect-video w-full rounded-xl bg-surface-strong" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="h-40 rounded-xl bg-surface-strong" />
        <div className="h-40 rounded-xl bg-surface-strong" />
      </div>
    </article>
  );
}
