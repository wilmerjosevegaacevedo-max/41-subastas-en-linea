import type { UserBidSummary } from "../schema";
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
}

export function createBidService(dependencies: BidServiceDependencies): BidService {
  return new BidService(dependencies);
}
