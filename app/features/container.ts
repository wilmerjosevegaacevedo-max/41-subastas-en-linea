import { AuctionService } from "./auctions/server/auction-service";
import { createSampleAuction, MemoryAuctionRepository } from "./auctions/server/repository.memory";

export interface AppContainer {
  auctionService: AuctionService;
}

function initializeContainer(): AppContainer {
  const initialAuction = createSampleAuction(new Date());
  const auctionRepository = new MemoryAuctionRepository([initialAuction]);
  const auctionService = new AuctionService({ repository: auctionRepository });

  return {
    auctionService,
  };
}

export const container = initializeContainer();
