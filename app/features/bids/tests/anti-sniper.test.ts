import { DomainError } from "@/shared/server/errors";
import { describe, expect, it } from "vitest";
import { createBidService } from "../server/bid-service";
import type { AuctionBiddingPort, AuctionStateForBidding } from "../server/repository";
import { MemoryBidRepository } from "../server/repository.memory";

describe("F7 · Regla Anti-Francotirador (Anti-Sniping)", () => {
  const baseTime = new Date("2026-11-14T15:00:00.000Z");

  function createTestAuctionPort(initialAuction: AuctionStateForBidding): AuctionBiddingPort {
    let current = { ...initialAuction };
    return {
      async getAuction() {
        return { ...current };
      },
      async updateAuction(_id: string, updates: Partial<AuctionStateForBidding>) {
        current = {
          ...current,
          ...updates,
        };
      },
    };
  }

  it("extiende el cierre en +60s cuando la puja entra a menos de 60 segundos del final", async () => {
    // Cierra en 30 segundos (a las 15:00:30)
    const closesIn30s = new Date(baseTime.getTime() + 30 * 1000).toISOString();
    const auction: AuctionStateForBidding = {
      id: "subasta-sniper-1",
      titulo: "Reloj Vintage",
      fotos: ["https://example.com/foto.jpg"],
      precio_inicial_centavos: 10000000,
      puja_actual_centavos: 10000000,
      incremento_centavos: 500000,
      vendedor_uid: "vendedor-01",
      ganador_uid: null,
      cierra_en: closesIn30s,
      estado: "activa",
    };

    const port = createTestAuctionPort(auction);
    const repo = new MemoryBidRepository({}, port);
    const service = createBidService({ repository: repo });

    const result = await service.placeBid("subasta-sniper-1", "comprador-01", { monto_centavos: 10000000 }, baseTime);

    expect(result.subasta_actualizada.extension_aplicada).toBe(true);
    // Nuevo cierre debe ser 30s + 60s = 90 segundos después de baseTime
    const expectedClose = new Date(baseTime.getTime() + 90 * 1000).toISOString();
    expect(result.subasta_actualizada.cierra_en).toBe(expectedClose);
  });

  it("no extiende el cierre si faltan 60 segundos o más", async () => {
    // Cierra en 5 minutos (300 segundos)
    const closesIn5m = new Date(baseTime.getTime() + 300 * 1000).toISOString();
    const auction: AuctionStateForBidding = {
      id: "subasta-normal-1",
      titulo: "Cámara Leica",
      fotos: ["https://example.com/foto.jpg"],
      precio_inicial_centavos: 15000000,
      puja_actual_centavos: 15000000,
      incremento_centavos: 1000000,
      vendedor_uid: "vendedor-01",
      ganador_uid: null,
      cierra_en: closesIn5m,
      estado: "activa",
    };

    const port = createTestAuctionPort(auction);
    const repo = new MemoryBidRepository({}, port);
    const service = createBidService({ repository: repo });

    const result = await service.placeBid("subasta-normal-1", "comprador-01", { monto_centavos: 15000000 }, baseTime);

    expect(result.subasta_actualizada.extension_aplicada).toBe(false);
    expect(result.subasta_actualizada.cierra_en).toBe(closesIn5m);
  });

  it("rechaza la puja con FORBIDDEN si el vendedor intenta pujar en su propia subasta", async () => {
    const closesIn10m = new Date(baseTime.getTime() + 600 * 1000).toISOString();
    const auction: AuctionStateForBidding = {
      id: "subasta-propia",
      titulo: "Laptop Vendedor",
      fotos: ["https://example.com/foto.jpg"],
      precio_inicial_centavos: 5000000,
      puja_actual_centavos: 5000000,
      incremento_centavos: 250000,
      vendedor_uid: "vendedor-tramposo",
      ganador_uid: null,
      cierra_en: closesIn10m,
      estado: "activa",
    };

    const port = createTestAuctionPort(auction);
    const repo = new MemoryBidRepository({}, port);
    const service = createBidService({ repository: repo });

    await expect(
      service.placeBid("subasta-propia", "vendedor-tramposo", { monto_centavos: 5000000 }, baseTime),
    ).rejects.toThrowError(DomainError);
  });

  it("rechaza la puja con EXPIRED si la subasta ya finalizó", async () => {
    // Ya venció hace 1 segundo
    const expiredClose = new Date(baseTime.getTime() - 1000).toISOString();
    const auction: AuctionStateForBidding = {
      id: "subasta-vencida",
      titulo: "Objeto Vencido",
      fotos: ["https://example.com/foto.jpg"],
      precio_inicial_centavos: 5000000,
      puja_actual_centavos: 5000000,
      incremento_centavos: 250000,
      vendedor_uid: "vendedor-01",
      ganador_uid: null,
      cierra_en: expiredClose,
      estado: "activa",
    };

    const port = createTestAuctionPort(auction);
    const repo = new MemoryBidRepository({}, port);
    const service = createBidService({ repository: repo });

    await expect(
      service.placeBid("subasta-vencida", "comprador-01", { monto_centavos: 5000000 }, baseTime),
    ).rejects.toThrowError(DomainError);
  });

  it("rechaza la puja con CONFLICT si el monto no cumple con el incremento mínimo", async () => {
    const closesIn10m = new Date(baseTime.getTime() + 600 * 1000).toISOString();
    const auction: AuctionStateForBidding = {
      id: "subasta-con-puja",
      titulo: "Cuadro de Arte",
      fotos: ["https://example.com/foto.jpg"],
      precio_inicial_centavos: 10000000,
      puja_actual_centavos: 10000000,
      incremento_centavos: 1000000, // Requiere al menos 11.000.000
      vendedor_uid: "vendedor-01",
      ganador_uid: "comprador-lider",
      cierra_en: closesIn10m,
      estado: "activa",
    };

    const port = createTestAuctionPort(auction);
    const repo = new MemoryBidRepository({}, port);
    const service = createBidService({ repository: repo });

    // Intenta pujar 10.500.000 (menos del incremento de 1.000.000)
    await expect(
      service.placeBid("subasta-con-puja", "comprador-nuevo", { monto_centavos: 10500000 }, baseTime),
    ).rejects.toThrowError(DomainError);
  });
});
