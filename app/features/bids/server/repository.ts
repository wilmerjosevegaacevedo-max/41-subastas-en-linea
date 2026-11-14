import type { AuctionUpdatedSnapshot, BidItem, UserBidSummary } from "../schema";

export interface AuctionStateForBidding {
  id: string;
  titulo: string;
  fotos: string[];
  precio_inicial_centavos: number;
  puja_actual_centavos: number;
  incremento_centavos: number;
  vendedor_uid: string;
  ganador_uid: string | null;
  cierra_en: string;
  estado: "activa" | "cerrada" | "cancelada";
}

export interface AuctionBiddingPort {
  getAuction(id: string): Promise<AuctionStateForBidding | null>;
  updateAuction(id: string, updates: Partial<AuctionStateForBidding>): Promise<void>;
}

export interface PlaceBidTransactionParams {
  auctionId: string;
  bidderUid: string;
  montoCentavos: number;
  now: Date;
}

export interface PlaceBidTransactionResult {
  bid: BidItem;
  updatedAuction: AuctionUpdatedSnapshot;
}

export interface BidRepository {
  listByBidder(bidderUid: string): Promise<UserBidSummary[]>;
  placeBid(params: PlaceBidTransactionParams): Promise<PlaceBidTransactionResult>;
}
