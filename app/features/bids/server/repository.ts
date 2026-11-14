import type { UserBidSummary } from "../schema";

export interface BidRepository {
  listByBidder(bidderUid: string): Promise<UserBidSummary[]>;
}
