import { describe, expect, it } from "vitest";
import { MemoryAuctionRepository } from "../server/repository.memory";
import { AuctionService, calculateMinimumIncrementCentavos, generateAuctionSlug } from "../server/auction-service";

describe("F4 · Publicar subasta (create-auction)", () => {
  const baseNow = new Date("2026-11-14T12:00:00Z");

  describe("calculateMinimumIncrementCentavos", () => {
    it("aplica el piso mínimo de $1.000 COP (100.000 centavos) cuando el 5% es menor", () => {
      // 5% de $10.000 COP es $500 COP (< $1.000 COP)
      const increment = calculateMinimumIncrementCentavos(10000);
      expect(increment).toBe(100000);
    });

    it("calcula el 5% para montos medianos (ej: $50.000 COP -> $2.500 COP)", () => {
      // 5% de $50.000 COP es $2.500 COP = 250.000 centavos
      const increment = calculateMinimumIncrementCentavos(50000);
      expect(increment).toBe(250000);
    });

    it("calcula el 5% para montos mayores (ej: $1.000.000 COP -> $50.000 COP)", () => {
      // 5% de $1.000.000 COP es $50.000 COP = 5.000.000 centavos
      const increment = calculateMinimumIncrementCentavos(1000000);
      expect(increment).toBe(5000000);
    });
  });

  describe("generateAuctionSlug", () => {
    it("genera un slug legible y sanitizado a partir del título", () => {
      const slug = generateAuctionSlug("Cámara Clásica Vintage 1954", baseNow);
      expect(slug).toContain("camara-clasica-vintage-1954");
    });
  });

  describe("AuctionService.createAuction", () => {
    it("crea una subasta activa con valores iniciales y fecha de cierre correcta", async () => {
      const repository = new MemoryAuctionRepository([]);
      const service = new AuctionService({ repository });

      const newAuction = await service.createAuction(
        {
          titulo: "Reloj Vintage Suizo de Oro",
          descripcion: "Reloj suizo original en oro de 18 kilates con correa de cuero legítimo en perfecto estado.",
          foto_url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800",
          precio_inicial_pesos: 80000,
          duracion_dias: 3,
        },
        "vendedor-test-01",
        baseNow,
      );

      expect(newAuction.estado).toBe("activa");
      expect(newAuction.precio_inicial_centavos).toBe(8000000);
      expect(newAuction.puja_actual_centavos).toBe(8000000);
      expect(newAuction.incremento_centavos).toBe(400000); // 5% de 80.000 = 4.000 COP
      expect(newAuction.vendedor_uid).toBe("vendedor-test-01");
      expect(newAuction.ganador_uid).toBeNull();

      // Cierre en exactamente 3 días
      const expectedClose = new Date(baseNow.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
      expect(newAuction.cierra_en).toBe(expectedClose);

      // Debe estar disponible en el repositorio
      const activeList = await repository.listActive();
      expect(activeList.length).toBe(1);
      expect(activeList[0]?.id).toBe(newAuction.id);
    });

    it("falla si el título tiene menos de 5 caracteres", async () => {
      const repository = new MemoryAuctionRepository([]);
      const service = new AuctionService({ repository });

      await expect(
        service.createAuction(
          {
            titulo: "Hola",
            descripcion: "Descripción con suficientes caracteres para pasar la validación.",
            foto_url: "https://images.unsplash.com/photo-123?w=800",
            precio_inicial_pesos: 20000,
            duracion_dias: 1,
          },
          "vendedor-01",
          baseNow,
        ),
      ).rejects.toThrow();
    });

    it("falla si la descripción tiene menos de 20 caracteres", async () => {
      const repository = new MemoryAuctionRepository([]);
      const service = new AuctionService({ repository });

      await expect(
        service.createAuction(
          {
            titulo: "Título Válido de Subasta",
            descripcion: "Corta",
            foto_url: "https://images.unsplash.com/photo-123?w=800",
            precio_inicial_pesos: 20000,
            duracion_dias: 1,
          },
          "vendedor-01",
          baseNow,
        ),
      ).rejects.toThrow();
    });

    it("falla si el precio inicial es menor a $10.000 COP", async () => {
      const repository = new MemoryAuctionRepository([]);
      const service = new AuctionService({ repository });

      await expect(
        service.createAuction(
          {
            titulo: "Título Válido de Subasta",
            descripcion: "Descripción suficientemente extensa para la prueba unitaria.",
            foto_url: "https://images.unsplash.com/photo-123?w=800",
            precio_inicial_pesos: 5000,
            duracion_dias: 1,
          },
          "vendedor-01",
          baseNow,
        ),
      ).rejects.toThrow();
    });
  });
});
