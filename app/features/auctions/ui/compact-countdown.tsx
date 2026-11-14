"use client";

import { useCountdown } from "./use-countdown";

export interface CompactCountdownProps {
  closesAtIso: string;
}

export function CompactCountdown({ closesAtIso }: CompactCountdownProps) {
  const { remaining } = useCountdown({ closesAtIso });

  if (remaining.formatted === "--:--:--") {
    return (
      <span
        role="timer"
        aria-label="Cargando tiempo restante"
        className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-500"
      >
        <strong>⏱ --:--:--</strong>
      </span>
    );
  }

  if (remaining.isFinished) {
    return (
      <span
        role="timer"
        aria-label="Subasta finalizada"
        className="inline-flex items-center rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700"
      >
        <strong>Finalizada</strong>
      </span>
    );
  }

  if (remaining.isUnderOneMinute) {
    return (
      <span
        role="timer"
        aria-label="Tiempo restante: últimos segundos"
        className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 font-mono text-xs font-bold text-danger animate-pulse"
      >
        <strong>⏱ {remaining.formatted}</strong>
      </span>
    );
  }

  return (
    <span
      role="timer"
      aria-label={`Tiempo restante: ${remaining.formatted}`}
      className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 font-mono text-xs font-bold text-primary"
    >
      <strong>⏱ {remaining.formatted}</strong>
    </span>
  );
}
