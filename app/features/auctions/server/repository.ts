import type { AuctionDetail, AuctionStatus } from "../schema";

export interface AuctionListFilters {
  estado?: AuctionStatus;
  q?: string;
  limite?: number;
}

export interface AuctionRepository {
  findById(id: string): Promise<AuctionDetail | null>;
  list(filters?: AuctionListFilters): Promise<AuctionDetail[]>;
  listActive(): Promise<AuctionDetail[]>;
  create(auction: AuctionDetail): Promise<AuctionDetail>;
  update(id: string, partial: { titulo?: string; descripcion?: string }): Promise<AuctionDetail>;
  cancel(id: string): Promise<AuctionDetail>;
}
