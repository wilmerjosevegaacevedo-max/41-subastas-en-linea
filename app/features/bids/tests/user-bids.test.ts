import { describe, expect, it } from "vitest";
import { createSampleUserBids, MemoryBidRepository } from "../server/repository.memory";
import { BidService } from "../server/bid-service";
import { filterBidsByTab } from "../ui/bid-tabs-filter";

describe("F5 · Historial de mis pujas (user-bids)", () => {
  const baseNow = new Date("2026-11-14T12:00:00Z");
  const sampleBids = createSampleUserBids(baseNow);

  describe("filterBidsByTab", () => {
    it("devuelve todas las pujas en la pestaña 'todas'", () => {
      const result = filterBidsByTab(sampleBids, "todas");
      expect(result.length).toBe(3);
    });

    it("filtra solo las subastas activas en la pestaña 'activas'", () => {
      const result = filterBidsByTab(sampleBids, "activas");
      expect(result.length).toBe(2);
      expect(result.every((b) => b.estado_subasta === "activa")).toBe(true);
    });

    it("filtra solo las subastas ganadas en la pestaña 'ganadas'", () => {
      const result = filterBidsByTab(sampleBids, "ganadas");
      expect(result.length).toBe(1);
      expect(result[0]?.estado_participacion).toBe("ganada");
      expect(result[0]?.subasta_id).toBe("reloj-vintage-oro");
    });

    it("devuelve arreglo vacío si la lista de entrada está vacía", () => {
      const result = filterBidsByTab([], "activas");
      expect(result).toEqual([]);
    });
  });

  describe("BidService y MemoryBidRepository", () => {
    it("recupera las pujas asociadas al comprador", async () => {
      const repository = new MemoryBidRepository({
        "comprador-demo-01": sampleBids,
      });
      const service = new BidService({ repository });

      const bids = await service.getBidsForUser("comprador-demo-01");
      expect(bids.length).toBe(3);
    });

    it("devuelve arreglo vacío para un usuario sin historial", async () => {
      const repository = new MemoryBidRepository({
        "comprador-demo-01": sampleBids,
      });
      const service = new BidService({ repository });

      const bids = await service.getBidsForUser("comprador-nuevo-99");
      expect(bids).toEqual([]);
    });
  });
});
