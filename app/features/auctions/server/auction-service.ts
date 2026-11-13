import { DomainError } from "@/shared/server/errors";
import type { AuctionDetail } from "../schema";
import type { AuctionRepository } from "./repository";

export interface AuctionServiceDependencies {
  repository: AuctionRepository;
}

export class AuctionService {
  private readonly repository: AuctionRepository;

  constructor(dependencies: AuctionServiceDependencies) {
    this.repository = dependencies.repository;
  }

  async getAuctionById(id: string): Promise<AuctionDetail> {
    const auction = await this.repository.findById(id);
    if (auction === null) {
      throw new DomainError("NOT_FOUND", "La subasta solicitada no existe");
    }
    return auction;
  }

  async getActiveAuctions(): Promise<AuctionDetail[]> {
    return this.repository.listActive();
  }
}

export function createAuctionService(dependencies: AuctionServiceDependencies): AuctionService {
  return new AuctionService(dependencies);
}
