import { AuctionService } from "./auctions/server/auction-service";
import { createSampleAuctions, MemoryAuctionRepository } from "./auctions/server/repository.memory";

export interface AppContainer {
  auctionService: AuctionService;
}

function initializeContainer(): AppContainer {
  const initialAuctions = createSampleAuctions(new Date());
  const auctionRepository = new MemoryAuctionRepository(initialAuctions);
  const auctionService = new AuctionService({ repository: auctionRepository });

  return {
    auctionService,
  };
}

export const container = initializeContainer();
