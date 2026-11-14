import { describe, expect, it } from "vitest";
import { createSampleAuctions } from "../server/repository.memory";
import { filterAuctions, sortAuctions } from "../ui/catalog-filters";

describe("catalog-filters · filtrado y ordenamiento del catálogo (F3)", () => {
  const baseNow = new Date("2026-11-14T12:00:00Z");
  const sampleAuctions = createSampleAuctions(baseNow);

  describe("filterAuctions", () => {
    it("devuelve todas las subastas si la búsqueda está vacía", () => {
      const result = filterAuctions(sampleAuctions, "");
      expect(result.length).toBe(3);
    });

    it("filtra por coincidencia en el título (ej: 'Omega')", () => {
      const result = filterAuctions(sampleAuctions, "Omega");
      expect(result.length).toBe(1);
      expect(result[0]?.id).toBe("omega-speedmaster-1969");
    });

    it("filtra por coincidencia en la descripción (ej: 'Summicron')", () => {
      const result = filterAuctions(sampleAuctions, "summicron");
      expect(result.length).toBe(1);
      expect(result[0]?.id).toBe("leica-m3-1954");
    });

    it("ignora mayúsculas, minúsculas y tildes ('cámara' vs 'camara')", () => {
      const withAccents = filterAuctions(sampleAuctions, "cámara");
      const withoutAccents = filterAuctions(sampleAuctions, "camara");
      expect(withAccents.length).toBe(1);
      expect(withoutAccents.length).toBe(1);
      expect(withAccents[0]?.id).toBe("leica-m3-1954");
    });

    it("devuelve arreglo vacío si no hay coincidencias", () => {
      const result = filterAuctions(sampleAuctions, "inexistente999");
      expect(result).toEqual([]);
    });
  });

  describe("sortAuctions", () => {
    it("ordena por cierre más próximo por defecto", () => {
      const result = sortAuctions(sampleAuctions, "cierre_proximo");
      // Omega (36h) < Leica (72h) < MacBook (102h)
      expect(result[0]?.id).toBe("omega-speedmaster-1969");
      expect(result[1]?.id).toBe("leica-m3-1954");
      expect(result[2]?.id).toBe("macbook-pro-m3-max");
    });

    it("ordena por menor precio de puja", () => {
      const result = sortAuctions(sampleAuctions, "menor_precio");
      // MacBook (12.5M) < Leica (15M) < Omega (28M)
      expect(result[0]?.id).toBe("macbook-pro-m3-max");
      expect(result[1]?.id).toBe("leica-m3-1954");
      expect(result[2]?.id).toBe("omega-speedmaster-1969");
    });

    it("ordena por mayor precio de puja", () => {
      const result = sortAuctions(sampleAuctions, "mayor_precio");
      // Omega (28M) > Leica (15M) > MacBook (12.5M)
      expect(result[0]?.id).toBe("omega-speedmaster-1969");
      expect(result[1]?.id).toBe("leica-m3-1954");
      expect(result[2]?.id).toBe("macbook-pro-m3-max");
    });
  });
});
