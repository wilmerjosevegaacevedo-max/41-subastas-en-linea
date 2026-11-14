import Link from "next/link";
import type { BidTabFilter } from "../schema";

export function MyBidsEmptyState({ tab }: { tab: BidTabFilter }) {
  let title = "No tienes pujas registradas";
  let description = "Aún no has participado en ninguna subasta. Explora el catálogo y encuentra artículos únicos.";

  if (tab === "activas") {
    title = "No tienes pujas en curso";
    description = "No estás participando en ninguna subasta activa en este momento.";
  }

  if (tab === "ganadas") {
    title = "No tienes subastas ganadas aún";
    description = "Sigue pujando en las subastas activas para adjudicarte tus artículos favoritos.";
  }

  return (
    <section
      aria-label="Sin pujas en esta categoría"
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface p-12 text-center"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-alt text-2xl text-ink-muted">
        <p aria-hidden="true">🏷️</p>
      </div>
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-ink-muted">{description}</p>
      <Link
        href="/"
        className="mt-6 flex min-h-[44px] items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        Explorar catálogo de subastas
      </Link>
    </section>
  );
}
