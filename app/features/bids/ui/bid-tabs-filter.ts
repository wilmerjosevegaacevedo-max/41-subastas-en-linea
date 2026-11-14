import type { BidTabFilter, UserBidSummary } from "../schema";

export function filterBidsByTab(bids: UserBidSummary[], tab: BidTabFilter): UserBidSummary[] {
  if (tab === "activas") {
    const list: UserBidSummary[] = [];
    for (const bid of bids) {
      if (bid.estado_subasta === "activa") {
        list.push(bid);
      }
    }
    return list;
  }

  if (tab === "ganadas") {
    const list: UserBidSummary[] = [];
    for (const bid of bids) {
      if (bid.estado_participacion === "ganada") {
        list.push(bid);
      }
    }
    return list;
  }

  return [...bids];
}
