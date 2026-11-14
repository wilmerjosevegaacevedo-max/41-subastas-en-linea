import Image from "next/image";
import Link from "next/link";
import type { UserBidSummary } from "../schema";
import { BidStatusBadge } from "./bid-status-badge";

function formatMoney(cents: number): string {
  const pesos = Math.floor(cents / 100);
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(pesos);
}

export function MyBidCard({ bid }: { bid: UserBidSummary }) {
  const myBidFormatted = formatMoney(bid.mi_puja_centavos);
  const currentBidFormatted = formatMoney(bid.puja_actual_centavos);

  let actionButton = (
    <Link
      href={`/subastas/${bid.subasta_id}`}
      className="flex min-h-[44px] w-full items-center justify-center rounded-lg border border-line bg-surface-alt px-4 py-2.5 text-center text-sm font-semibold text-ink transition hover:bg-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      Ver subasta
    </Link>
  );

  if (bid.estado_participacion === "superada") {
    actionButton = (
      <Link
        href={`/subastas/${bid.subasta_id}`}
        className="flex min-h-[44px] w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-bold text-white transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        Pujar de nuevo
      </Link>
    );
  }

  let statusDescription = <p className="text-xs text-ink-muted">Subasta activa</p>;
  if (bid.estado_subasta === "cerrada") {
    statusDescription = <p className="text-xs text-ink-muted">Subasta cerrada</p>;
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-xs transition hover:border-ink/20">
      <figure className="relative aspect-video w-full overflow-hidden bg-surface-alt">
        <Image
          src={bid.subasta_foto}
          alt={`Foto de ${bid.subasta_titulo}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
          unoptimized
        />
        <div className="absolute top-3 right-3">
          <BidStatusBadge status={bid.estado_participacion} />
        </div>
      </figure>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div className="space-y-3">
          <div>
            <h3 className="line-clamp-2 text-base font-bold text-ink">{bid.subasta_titulo}</h3>
            {statusDescription}
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-lg border border-line bg-surface-alt p-3">
            <div>
              <p className="text-xs text-ink-muted">Mi última puja</p>
              <p className="mt-0.5 text-sm font-bold text-ink">{myBidFormatted}</p>
            </div>
            <div>
              <p className="text-xs text-ink-muted">Puja más alta</p>
              <p className="mt-0.5 text-sm font-extrabold text-primary">{currentBidFormatted}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-line/60 pt-4">{actionButton}</div>
      </div>
    </article>
  );
}
