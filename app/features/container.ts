import { AuctionService } from "./auctions/server/auction-service";
import { createSampleAuctions, MemoryAuctionRepository } from "./auctions/server/repository.memory";
import { BidService } from "./bids/server/bid-service";
import { createSampleUserBids, MemoryBidRepository } from "./bids/server/repository.memory";

export interface AppContainer {
  auctionService: AuctionService;
  bidService: BidService;
}

function initializeContainer(): AppContainer {
  const now = new Date();
  const initialAuctions = createSampleAuctions(now);
  const auctionRepository = new MemoryAuctionRepository(initialAuctions);
  const auctionService = new AuctionService({ repository: auctionRepository });

  const sampleBids = createSampleUserBids(now);
  const bidRepository = new MemoryBidRepository({
    "comprador-demo-01": sampleBids,
  });
  const bidService = new BidService({ repository: bidRepository });

  return {
    auctionService,
    bidService,
  };
}

export const container = initializeContainer();
