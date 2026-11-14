import type { UserBidSummary } from "../schema";
import type { BidRepository } from "./repository";

export function createSampleUserBids(now: Date): UserBidSummary[] {
  const threeDaysAhead = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
  const fourDaysAhead = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
  const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();

  return [
    {
      subasta_id: "leica-m3-1954",
      subasta_titulo: "Cámara Vintage Leica M3 1954",
      subasta_foto: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
      mi_puja_centavos: 15000000,
      puja_actual_centavos: 15000000,
      cierra_en: threeDaysAhead,
      estado_subasta: "activa",
      estado_participacion: "ganando",
      fecha_puja: twoHoursAgo,
    },
    {
      subasta_id: "macbook-pro-m3-max",
      subasta_titulo: 'MacBook Pro 16" M3 Max 2023',
      subasta_foto: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
      mi_puja_centavos: 12000000,
      puja_actual_centavos: 12500000,
      cierra_en: fourDaysAhead,
      estado_subasta: "activa",
      estado_participacion: "superada",
      fecha_puja: fiveHoursAgo,
    },
    {
      subasta_id: "reloj-vintage-oro",
      subasta_titulo: "Reloj Vintage Suizo de Oro 18K",
      subasta_foto: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
      mi_puja_centavos: 9500000,
      puja_actual_centavos: 9500000,
      cierra_en: oneDayAgo,
      estado_subasta: "cerrada",
      estado_participacion: "ganada",
      fecha_puja: twoDaysAgo,
    },
  ];
}

export class MemoryBidRepository implements BidRepository {
  private readonly bidsByBidder: Map<string, UserBidSummary[]> = new Map();

  constructor(initialBids: Record<string, UserBidSummary[]> = {}) {
    for (const [bidder, bids] of Object.entries(initialBids)) {
      this.bidsByBidder.set(bidder, [...bids]);
    }
  }

  async listByBidder(bidderUid: string): Promise<UserBidSummary[]> {
    const list = this.bidsByBidder.get(bidderUid);
    if (list === undefined) {
      return [];
    }
    return [...list];
  }

  async addBid(bidderUid: string, bid: UserBidSummary): Promise<void> {
    const list = this.bidsByBidder.get(bidderUid);
    if (list === undefined) {
      this.bidsByBidder.set(bidderUid, [bid]);
    } else {
      list.push(bid);
    }
  }
}
