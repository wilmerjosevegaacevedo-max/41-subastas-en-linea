import { AuctionService } from "./auctions/server/auction-service";
import type { AuctionRepository } from "./auctions/server/repository";
import { FirestoreAuctionRepository } from "./auctions/server/repository.firestore";
import { createSampleAuctions, MemoryAuctionRepository } from "./auctions/server/repository.memory";
import { BidService } from "./bids/server/bid-service";
import type { AuctionBiddingPort, BidRepository } from "./bids/server/repository";
import { FirestoreBidRepository } from "./bids/server/repository.firestore";
import { createSampleUserBids, MemoryBidRepository } from "./bids/server/repository.memory";

export interface AppContainer {
  auctionService: AuctionService;
  bidService: BidService;
}

function initializeContainer(): AppContainer {
  const now = new Date();
  let auctionRepository: AuctionRepository;

  if (process.env.USE_FIRESTORE === "true") {
    auctionRepository = new FirestoreAuctionRepository();
  } else {
    const initialAuctions = createSampleAuctions(now);
    auctionRepository = new MemoryAuctionRepository(initialAuctions);
  }

  const auctionService = new AuctionService({ repository: auctionRepository });

  const auctionBiddingPort: AuctionBiddingPort = {
    async getAuction(id: string) {
      const a = await auctionRepository.findById(id);
      if (a === null) {
        return null;
      }
      return {
        id: a.id,
        titulo: a.titulo,
        fotos: a.fotos,
        precio_inicial_centavos: a.precio_inicial_centavos,
        puja_actual_centavos: a.puja_actual_centavos,
        incremento_centavos: a.incremento_centavos,
        vendedor_uid: a.vendedor_uid,
        ganador_uid: a.ganador_uid,
        cierra_en: a.cierra_en,
        estado: a.estado,
      };
    },
    async updateAuction(id: string, updates) {
      const existing = await auctionRepository.findById(id);
      if (existing !== null) {
        const merged = {
          ...existing,
          ...updates,
        };
        await auctionRepository.create(merged);
      }
    },
  };

  let bidRepository: BidRepository;
  if (process.env.USE_FIRESTORE === "true") {
    bidRepository = new FirestoreBidRepository();
  } else {
    const sampleBids = createSampleUserBids(now);
    bidRepository = new MemoryBidRepository(
      {
        "comprador-demo-01": sampleBids,
      },
      auctionBiddingPort,
    );
  }

  const bidService = new BidService({ repository: bidRepository });

  return {
    auctionService,
    bidService,
  };
}

export const container = initializeContainer();
