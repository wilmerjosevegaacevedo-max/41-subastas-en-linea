import { type PlaceBidInput, PlaceBidInputSchema, type PlaceBidResponse, type UserBidSummary } from "../schema";
import type { BidRepository } from "./repository";

export interface BidServiceDependencies {
  repository: BidRepository;
}

export class BidService {
  private readonly repository: BidRepository;

  constructor(dependencies: BidServiceDependencies) {
    this.repository = dependencies.repository;
  }

  async getBidsForUser(bidderUid: string): Promise<UserBidSummary[]> {
    return this.repository.listByBidder(bidderUid);
  }

  async placeBid(auctionId: string, bidderUid: string, input: PlaceBidInput, now: Date): Promise<PlaceBidResponse> {
    const validated = PlaceBidInputSchema.parse(input);
    const result = await this.repository.placeBid({
      auctionId,
      bidderUid,
      montoCentavos: validated.monto_centavos,
      now,
    });
    return {
      puja: result.bid,
      subasta_actualizada: result.updatedAuction,
    };
  }
}

export function createBidService(dependencies: BidServiceDependencies): BidService {
  return new BidService(dependencies);
}
