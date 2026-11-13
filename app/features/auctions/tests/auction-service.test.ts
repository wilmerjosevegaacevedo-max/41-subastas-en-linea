import { DomainError } from "@/shared/server/errors";
import { describe, expect, it } from "vitest";
import { createAuctionService } from "../server/auction-service";
import { createSampleAuction, MemoryAuctionRepository } from "../server/repository.memory";

describe("F1 · servicio de subastas", () => {
  const now = new Date("2026-11-13T10:00:00.000Z");
  const sampleAuction = createSampleAuction(now);

  it("devuelve los detalles de una subasta existente", async () => {
    const repository = new MemoryAuctionRepository([sampleAuction]);
    const service = createAuctionService({ repository });

    const auction = await service.getAuctionById("leica-m3-1954");
    expect(auction.id).toBe("leica-m3-1954");
    expect(auction.titulo).toBe("Cámara Vintage Leica M3 1954");
    expect(auction.precio_inicial_centavos).toBe(15000000);
  });

  it("lanza NOT_FOUND con código 404 si la subasta no existe", async () => {
    const repository = new MemoryAuctionRepository([sampleAuction]);
    const service = createAuctionService({ repository });

    await expect(service.getAuctionById("subasta-inexistente")).rejects.toThrowError(DomainError);
  });

  it("lista las subastas activas disponibles", async () => {
    const repository = new MemoryAuctionRepository([sampleAuction]);
    const service = createAuctionService({ repository });

    const activeList = await service.getActiveAuctions();
    expect(activeList.length).toBe(1);
    expect(activeList[0]?.id).toBe("leica-m3-1954");
  });
});
