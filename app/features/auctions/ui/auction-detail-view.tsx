import Image from "next/image";
import type { AuctionDetail } from "../schema";
import { CountdownTimer } from "./countdown-timer";

export interface AuctionDetailViewProps {
  auction: AuctionDetail;
}

function formatMoney(cents: number): string {
  const pesos = Math.floor(cents / 100);
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(pesos);
}

export function AuctionDetailView({ auction }: AuctionDetailViewProps) {
  const currentBidFormatted = formatMoney(auction.puja_actual_centavos);
  const minIncrementFormatted = formatMoney(auction.incremento_centavos);
  const mainPhoto = auction.fotos[0] ?? "";

  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold tracking-wide uppercase text-primary">Subasta #{auction.id}</p>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink md:text-4xl">{auction.titulo}</h1>
      </header>

      <section
        aria-label="Fotografías del artículo"
        className="overflow-hidden rounded-xl border border-line bg-surface"
      >
        <figure className="relative aspect-video w-full bg-surface-alt">
          <Image
            src={mainPhoto}
            alt={`Fotografía principal de ${auction.titulo}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority
            unoptimized
          />
        </figure>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section aria-label="Información de precios" className="space-y-4 rounded-xl border border-line bg-surface p-6">
          <div>
            <p className="text-sm font-medium text-ink-muted">Puja más alta actual</p>
            <p className="mt-1 text-3xl font-black text-ink">{currentBidFormatted}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-ink-muted">Incremento mínimo por puja</p>
            <p className="mt-1 text-lg font-bold text-primary-strong">+{minIncrementFormatted}</p>
          </div>
          <div className="border-t border-line pt-3">
            <p className="text-xs text-ink-muted">
              Vendido por: <strong className="text-ink">{auction.vendedor_uid}</strong>
            </p>
          </div>
        </section>

        <section aria-label="Control de tiempo y cierre" className="space-y-4">
          <CountdownTimer closesAtIso={auction.cierra_en} />
        </section>
      </div>

      <section aria-label="Descripción del artículo" className="space-y-3 rounded-xl border border-line bg-surface p-6">
        <h2 className="text-lg font-bold text-ink">Descripción detallada</h2>
        <p className="leading-relaxed text-ink-muted">{auction.descripcion}</p>
      </section>
    </article>
  );
}
