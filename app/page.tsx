import { Suspense } from "react";
import { container } from "@/features/container";
import { AuctionCardSkeleton } from "@/features/auctions/ui/auction-card-skeleton";
import { AuctionCatalog } from "@/features/auctions/ui/auction-catalog";

function CatalogLoadingFallback() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <AuctionCardSkeleton />
      <AuctionCardSkeleton />
      <AuctionCardSkeleton />
    </div>
  );
}

export default async function HomePage() {
  const auctions = await container.auctionService.getActiveAuctions();

  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">Subastas en Línea</h1>
        <p className="text-lg text-ink-muted">
          Subastas en vivo con cuenta regresiva sincronizada, ofertas transparentes y cierre automático.
        </p>
      </header>

      <section aria-label="Catálogo de subastas activas">
        <Suspense fallback={<CatalogLoadingFallback />}>
          <AuctionCatalog initialAuctions={auctions} />
        </Suspense>
      </section>
    </article>
  );
}
