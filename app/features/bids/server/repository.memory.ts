import { DomainError } from "@/shared/server/errors";
import type { AuctionUpdatedSnapshot, BidItem, UserBidSummary } from "../schema";
import type {
  AuctionBiddingPort,
  BidRepository,
  PlaceBidTransactionParams,
  PlaceBidTransactionResult,
} from "./repository";

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
  private readonly auctionPort?: AuctionBiddingPort;
  private transactionQueue: Promise<void> = Promise.resolve();

  constructor(initialBids: Record<string, UserBidSummary[]> = {}, auctionPort?: AuctionBiddingPort) {
    for (const [bidder, bids] of Object.entries(initialBids)) {
      this.bidsByBidder.set(bidder, [...bids]);
    }
    this.auctionPort = auctionPort;
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

  async placeBid(params: PlaceBidTransactionParams): Promise<PlaceBidTransactionResult> {
    const previous = this.transactionQueue;
    let release = () => {};
    this.transactionQueue = new Promise<void>((resolve) => {
      release = resolve;
    });

    try {
      await previous;
      return await this.executeAtomicBid(params);
    } finally {
      release();
    }
  }

  private async executeAtomicBid(params: PlaceBidTransactionParams): Promise<PlaceBidTransactionResult> {
    if (this.auctionPort === undefined) {
      throw new DomainError("INTERNAL_ERROR", "Puerto de subastas no configurado en repositorio");
    }

    const auction = await this.auctionPort.getAuction(params.auctionId);
    if (auction === null) {
      throw new DomainError("NOT_FOUND", "La subasta solicitada no existe");
    }
    if (auction.estado !== "activa") {
      throw new DomainError("CONFLICT", "La subasta no está activa");
    }
    if (new Date(auction.cierra_en).getTime() <= params.now.getTime()) {
      throw new DomainError("EXPIRED", "La subasta ya ha finalizado");
    }
    if (auction.vendedor_uid === params.bidderUid) {
      throw new DomainError("FORBIDDEN", "No puedes pujar en tu propia subasta");
    }

    let minRequired = auction.precio_inicial_centavos;
    if (auction.ganador_uid !== null) {
      minRequired = auction.puja_actual_centavos + auction.incremento_centavos;
    }

    if (params.montoCentavos < minRequired) {
      throw new DomainError("CONFLICT", `La puja debe ser de al menos ${minRequired} centavos`);
    }

    const remainingMs = new Date(auction.cierra_en).getTime() - params.now.getTime();
    let extensionAplicada = false;
    let nuevoCierraEn = auction.cierra_en;

    if (remainingMs < 60000) {
      extensionAplicada = true;
      const extendedTime = new Date(new Date(auction.cierra_en).getTime() + 60000);
      nuevoCierraEn = extendedTime.toISOString();
    }

    await this.auctionPort.updateAuction(params.auctionId, {
      puja_actual_centavos: params.montoCentavos,
      ganador_uid: params.bidderUid,
      cierra_en: nuevoCierraEn,
    });

    const bidId = `puja-${params.now.getTime()}-${Math.random().toString(36).substring(2, 7)}`;
    const bid: BidItem = {
      id: bidId,
      subasta_id: params.auctionId,
      postor_uid: params.bidderUid,
      monto_centavos: params.montoCentavos,
      creada_en: params.now.toISOString(),
    };

    const updatedAuction: AuctionUpdatedSnapshot = {
      id: params.auctionId,
      puja_actual_centavos: params.montoCentavos,
      ganador_uid: params.bidderUid,
      cierra_en: nuevoCierraEn,
      extension_aplicada: extensionAplicada,
    };

    const userSummary: UserBidSummary = {
      subasta_id: params.auctionId,
      subasta_titulo: auction.titulo,
      subasta_foto: auction.fotos[0] ?? "",
      mi_puja_centavos: params.montoCentavos,
      puja_actual_centavos: params.montoCentavos,
      cierra_en: nuevoCierraEn,
      estado_subasta: "activa",
      estado_participacion: "ganando",
      fecha_puja: params.now.toISOString(),
    };
    await this.addBid(params.bidderUid, userSummary);

    return { bid, updatedAuction };
  }
}
