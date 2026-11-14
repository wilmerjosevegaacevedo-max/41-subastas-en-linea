import Image from "next/image";
import Link from "next/link";
import type { AuctionDetail } from "../schema";
import { CompactCountdown } from "./compact-countdown";

export interface AuctionCardProps {
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

export function AuctionCard({ auction }: AuctionCardProps) {
  const formattedPrice = formatMoney(auction.puja_actual_centavos);
  const mainPhoto = auction.fotos[0] ?? "";

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-xs transition hover:border-ink/20 hover:shadow-md">
      <figure className="relative aspect-video w-full overflow-hidden bg-surface-alt">
        <Image
          src={mainPhoto}
          alt={`Fotografía principal de ${auction.titulo}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition duration-300 hover:scale-105"
          unoptimized
        />
        <div className="absolute top-3 right-3">
          <CompactCountdown closesAtIso={auction.cierra_en} />
        </div>
      </figure>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div className="space-y-2.5">
          <p className="text-xs font-semibold tracking-wide uppercase text-primary">Subasta #{auction.id}</p>
          <h3 className="line-clamp-2 text-lg font-bold text-ink">{auction.titulo}</h3>
          <p className="line-clamp-2 text-sm text-ink-muted leading-relaxed">{auction.descripcion}</p>
        </div>

        <div className="mt-5 space-y-4 border-t border-line/60 pt-4">
          <div>
            <p className="text-xs font-medium text-ink-muted">Puja actual</p>
            <p className="text-xl font-extrabold text-ink">{formattedPrice}</p>
          </div>

          <Link
            href={`/subastas/${auction.id}`}
            className="flex min-h-[44px] w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-bold text-white transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Ver subasta
          </Link>
        </div>
      </div>
    </article>
  );
}
