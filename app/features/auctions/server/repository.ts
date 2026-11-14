import type { AuctionDetail } from "../schema";

export interface AuctionRepository {
  findById(id: string): Promise<AuctionDetail | null>;
  listActive(): Promise<AuctionDetail[]>;
  create(auction: AuctionDetail): Promise<AuctionDetail>;
}
