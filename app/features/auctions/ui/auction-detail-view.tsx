"use client";

import { useState } from "react";
import Image from "next/image";
import type { AuctionDetail } from "../schema";
import { CountdownTimer } from "./countdown-timer";
import { useAuctionPolling } from "./use-auction-polling";
import { BidForm } from "@/features/bids/ui/bid-form";

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

interface NotificationBannerProps {
  notification: string;
  onDismiss: () => void;
}

function NotificationBanner({ notification, onDismiss }: NotificationBannerProps) {
  return (
    <aside
      role="status"
      aria-live="polite"
      className="flex items-center justify-between rounded-xl border border-primary/40 bg-surface-alt p-4 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <strong aria-hidden="true" className="text-xl">
          🔔
        </strong>
        <p className="text-sm font-semibold text-primary">{notification}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="text-xs font-bold text-ink-muted hover:text-ink px-2 py-1 rounded"
      >
        Entendido
      </button>
    </aside>
  );
}

export function AuctionDetailView({ auction }: AuctionDetailViewProps) {
  const [currentBidCents, setCurrentBidCents] = useState<number>(auction.puja_actual_centavos);
  const [isAuctionClosed, setIsAuctionClosed] = useState<boolean>(auction.estado === "cerrada");
  const [winnerUid, setWinnerUid] = useState<string | null>(auction.ganador_uid);

  const { notification, refreshManual, clearNotification } = useAuctionPolling({
    subastaId: auction.id,
    initialCents: currentBidCents,
    onPriceUpdated: (newCents) => {
      setCurrentBidCents(newCents);
    },
    onAuctionClosed: (winner) => {
      setIsAuctionClosed(true);
      setWinnerUid(winner);
    },
  });

  const currentBidFormatted = formatMoney(currentBidCents);
  const minIncrementFormatted = formatMoney(auction.incremento_centavos);
  let mainPhoto = "";
  if (auction.fotos.length > 0) {
    mainPhoto = auction.fotos[0];
  }

  return (
    <article className="space-y-8">
      {notification !== null && <NotificationBanner notification={notification} onDismiss={clearNotification} />}

      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold tracking-wide uppercase text-primary">Subasta #{auction.id}</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink md:text-4xl">{auction.titulo}</h1>
        </div>
        <button
          type="button"
          onClick={() => {
            void refreshManual();
          }}
          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink-muted hover:bg-surface-alt hover:text-ink transition"
          title="Actualizar estado manualmente"
        >
          <strong aria-hidden="true">🔄</strong>
          Actualizar
        </button>
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
            {winnerUid !== null && (
              <p className="mt-1 text-xs text-success font-semibold">
                Ganador actual: <strong className="underline">{winnerUid}</strong>
              </p>
            )}
          </div>
        </section>

        <section aria-label="Control de tiempo y cierre" className="space-y-4">
          <CountdownTimer closesAtIso={auction.cierra_en} />
        </section>
      </div>

      <BidForm
        subastaId={auction.id}
        pujaActualCentavos={currentBidCents}
        incrementoCentavos={auction.incremento_centavos}
        isClosed={isAuctionClosed}
        onBidAccepted={(newCents) => {
          setCurrentBidCents(newCents);
        }}
      />

      <section aria-label="Descripción del artículo" className="space-y-3 rounded-xl border border-line bg-surface p-6">
        <h2 className="text-lg font-bold text-ink">Descripción detallada</h2>
        <p className="leading-relaxed text-ink-muted">{auction.descripcion}</p>
      </section>
    </article>
  );
}
