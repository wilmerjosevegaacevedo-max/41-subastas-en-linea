import type { BidParticipationStatus } from "../schema";

export function BidStatusBadge({ status }: { status: BidParticipationStatus }) {
  if (status === "ganando") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
        <strong aria-hidden="true">🟢</strong>
        <strong>Ganando</strong>
      </span>
    );
  }

  if (status === "superada") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
        <strong aria-hidden="true">⚠️</strong>
        <strong>Superada</strong>
      </span>
    );
  }

  if (status === "ganada") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-primary">
        <strong aria-hidden="true">🏆</strong>
        <strong>Subasta ganada</strong>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
      <strong>Finalizada</strong>
    </span>
  );
}
