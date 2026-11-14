"use client";

import { useCountdown } from "./use-countdown";

export interface CountdownTimerProps {
  closesAtIso: string;
}

export function CountdownTimer({ closesAtIso }: CountdownTimerProps) {
  const { remaining, isSyncing } = useCountdown({ closesAtIso });

  if (remaining.formatted === "--:--:--") {
    return (
      <section
        role="timer"
        aria-label="Tiempo restante de la subasta"
        aria-live="polite"
        className="rounded-lg border border-line bg-surface-alt p-4 text-center"
      >
        <p className="text-sm font-semibold tracking-wide uppercase text-ink-muted">Tiempo restante</p>
        <p className="mt-1 font-mono text-3xl font-extrabold text-primary-strong">--:--:--</p>
        <p className="text-xs text-ink-muted">Sincronizando con reloj del servidor...</p>
      </section>
    );
  }

  if (remaining.isFinished) {
    return (
      <section
        role="timer"
        aria-label="Tiempo restante de la subasta"
        aria-live="polite"
        className="rounded-lg border border-line bg-surface-alt p-4 text-center"
      >
        <p className="text-sm font-semibold tracking-wide uppercase text-ink-muted">Estado del cierre</p>
        <p className="mt-1 font-mono text-3xl font-bold text-ink-muted">00:00:00</p>
        <p className="mt-2 inline-block rounded-full bg-slate-700 px-4 py-1 text-sm font-bold text-white">
          Subasta finalizada
        </p>
      </section>
    );
  }

  if (remaining.isUnderOneMinute) {
    return (
      <section
        role="timer"
        aria-label="Tiempo restante de la subasta"
        aria-live="polite"
        className="rounded-lg border-2 border-danger bg-red-50 p-4 text-center"
      >
        <p className="text-sm font-bold tracking-wide uppercase text-danger">¡Últimos segundos!</p>
        <p className="mt-1 font-mono text-4xl font-extrabold text-danger">{remaining.formatted}</p>
        <p className="mt-2 text-xs text-danger">Pujas en el último minuto extenderán el tiempo de la subasta.</p>
      </section>
    );
  }

  let syncNotice = null;
  if (isSyncing) {
    syncNotice = <p className="text-xs text-ink-muted">Sincronizando con reloj del servidor...</p>;
  }

  return (
    <section
      role="timer"
      aria-label="Tiempo restante de la subasta"
      aria-live="polite"
      className="rounded-lg border border-line bg-surface-alt p-4 text-center"
    >
      <p className="text-sm font-semibold tracking-wide uppercase text-ink-muted">Tiempo restante</p>
      <p className="mt-1 font-mono text-3xl font-extrabold text-primary-strong">{remaining.formatted}</p>
      {syncNotice}
    </section>
  );
}
