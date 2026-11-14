export function AuctionCardSkeleton() {
  return (
    <article
      aria-hidden="true"
      className="flex h-full animate-pulse flex-col overflow-hidden rounded-xl border border-line bg-surface"
    >
      <div className="aspect-video w-full bg-slate-200" />
      <div className="flex flex-1 flex-col justify-between p-5">
        <div className="space-y-3">
          <div className="h-3 w-20 rounded bg-slate-200" />
          <div className="h-5 w-4/5 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-200" />
          <div className="h-4 w-3/4 rounded bg-slate-200" />
        </div>
        <div className="mt-5 space-y-4 border-t border-line/60 pt-4">
          <div className="space-y-1">
            <div className="h-3 w-16 rounded bg-slate-200" />
            <div className="h-6 w-28 rounded bg-slate-200" />
          </div>
          <div className="h-11 w-full rounded-lg bg-slate-200" />
        </div>
      </div>
    </article>
  );
}
