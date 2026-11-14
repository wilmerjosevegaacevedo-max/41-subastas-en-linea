import { DELETE, GET as GET_BY_ID, PATCH } from "@/api/subastas/[id]/route";
import { GET as GET_LIST } from "@/api/subastas/route";
import { ErrorResponseSchema } from "@/shared/schema";
import { DomainError } from "@/shared/server/errors";
import { describe, expect, it } from "vitest";
import {
  type AuctionDetail,
  AuctionDetailResponseSchema,
  AuctionListResponseSchema,
  DeleteAuctionResponseSchema,
} from "../schema";
import { createAuctionService } from "../server/auction-service";
import { createSampleAuction, MemoryAuctionRepository } from "../server/repository.memory";

describe("F6 · CRUD y API REST de Subastas", () => {
  const now = new Date("2026-11-14T10:00:00.000Z");

  function buildAuction(overrides: Partial<AuctionDetail> = {}): AuctionDetail {
    const base = createSampleAuction(now);
    return {
      ...base,
      ...overrides,
    };
  }

  describe("Servicio: Actualización y Cancelación", () => {
    it("permite actualizar título y descripción si la subasta no tiene pujas", async () => {
      const auction = buildAuction({
        id: "subasta-sin-pujas",
        vendedor_uid: "vendedor-01",
        precio_inicial_centavos: 10000000,
        puja_actual_centavos: 10000000,
      });
      const repo = new MemoryAuctionRepository([auction]);
      const service = createAuctionService({ repository: repo });

      const updated = await service.updateAuction(
        "subasta-sin-pujas",
        {
          titulo: "Título Actualizado y Mejorado",
          descripcion: "Esta es una nueva descripción suficientemente larga para cumplir los criterios.",
        },
        "vendedor-01",
      );

      expect(updated.titulo).toBe("Título Actualizado y Mejorado");
      expect(updated.descripcion).toContain("nueva descripción");
    });

    it("rechaza la actualización con CONFLICT si la subasta ya recibió pujas", async () => {
      const auction = buildAuction({
        id: "subasta-con-pujas",
        vendedor_uid: "vendedor-01",
        precio_inicial_centavos: 10000000,
        puja_actual_centavos: 12000000, // Puja superior
      });
      const repo = new MemoryAuctionRepository([auction]);
      const service = createAuctionService({ repository: repo });

      await expect(
        service.updateAuction("subasta-con-pujas", { titulo: "Nuevo Título Válido" }, "vendedor-01"),
      ).rejects.toThrowError(DomainError);
    });

    it("rechaza la actualización con FORBIDDEN si el usuario no es el creador", async () => {
      const auction = buildAuction({
        id: "subasta-ajena",
        vendedor_uid: "vendedor-propietario",
      });
      const repo = new MemoryAuctionRepository([auction]);
      const service = createAuctionService({ repository: repo });

      await expect(
        service.updateAuction("subasta-ajena", { titulo: "Intruso Modificando" }, "usuario-ajeno"),
      ).rejects.toThrowError(DomainError);
    });

    it("permite cancelar lógicamente una subasta si no tiene pujas", async () => {
      const auction = buildAuction({
        id: "subasta-a-cancelar",
        vendedor_uid: "vendedor-01",
        precio_inicial_centavos: 5000000,
        puja_actual_centavos: 5000000,
        estado: "activa",
      });
      const repo = new MemoryAuctionRepository([auction]);
      const service = createAuctionService({ repository: repo });

      const cancelled = await service.cancelAuction("subasta-a-cancelar", "vendedor-01");
      expect(cancelled.estado).toBe("cancelada");
    });

    it("rechaza la cancelación con CONFLICT si la subasta ya tiene pujas", async () => {
      const auction = buildAuction({
        id: "subasta-con-pujas-2",
        vendedor_uid: "vendedor-01",
        precio_inicial_centavos: 5000000,
        puja_actual_centavos: 6000000,
      });
      const repo = new MemoryAuctionRepository([auction]);
      const service = createAuctionService({ repository: repo });

      await expect(service.cancelAuction("subasta-con-pujas-2", "vendedor-01")).rejects.toThrowError(DomainError);
    });
  });

  describe("Endpoints HTTP de Subastas", () => {
    it("GET /api/subastas responde con la lista y el total", async () => {
      const req = new Request("http://localhost:3000/api/subastas?estado=activa");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);

      const json = AuctionListResponseSchema.parse(await res.json());
      expect(Array.isArray(json.subastas)).toBe(true);
      expect(typeof json.total).toBe("number");
    });

    it("GET /api/subastas/[id] retorna 200 con subasta encontrada", async () => {
      const req = new Request("http://localhost:3000/api/subastas/leica-m3-1954");
      const context = { params: Promise.resolve({ id: "leica-m3-1954" }) };
      const res = await GET_BY_ID(req, context);
      expect(res.status).toBe(200);

      const json = AuctionDetailResponseSchema.parse(await res.json());
      expect(json.subasta.id).toBe("leica-m3-1954");
    });

    it("GET /api/subastas/[id] retorna 404 para subasta inexistente", async () => {
      const req = new Request("http://localhost:3000/api/subastas/no-existe-xyz");
      const context = { params: Promise.resolve({ id: "no-existe-xyz" }) };
      const res = await GET_BY_ID(req, context);
      expect(res.status).toBe(404);

      const json = ErrorResponseSchema.parse(await res.json());
      expect(json.error.code).toBe("NOT_FOUND");
    });

    it("DELETE /api/subastas/[id] cancela exitosamente una subasta sin pujas", async () => {
      const req = new Request("http://localhost:3000/api/subastas/macbook-pro-m3-max", {
        method: "DELETE",
        headers: { "x-user-uid": "vendedor-tech-01" },
      });
      const context = { params: Promise.resolve({ id: "macbook-pro-m3-max" }) };
      const res = await DELETE(req, context);
      expect(res.status).toBe(200);

      const json = DeleteAuctionResponseSchema.parse(await res.json());
      expect(json.estado).toBe("cancelada");
      expect(json.subasta_id).toBe("macbook-pro-m3-max");
    });

    it("DELETE /api/subastas/[id] retorna 403 si el usuario no es el creador", async () => {
      const req = new Request("http://localhost:3000/api/subastas/macbook-pro-m3-max", {
        method: "DELETE",
        headers: { "x-user-uid": "usuario-intruso" },
      });
      const context = { params: Promise.resolve({ id: "macbook-pro-m3-max" }) };
      const res = await DELETE(req, context);
      expect(res.status).toBe(403);
    });

    it("PATCH /api/subastas/[id] actualiza título y descripción", async () => {
      const req = new Request("http://localhost:3000/api/subastas/omega-speedmaster-1969", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-uid": "vendedor-coleccionista-02",
        },
        body: JSON.stringify({
          titulo: "Omega Speedmaster Professional 1969 Editado",
        }),
      });
      const context = { params: Promise.resolve({ id: "omega-speedmaster-1969" }) };
      const res = await PATCH(req, context);
      expect(res.status).toBe(200);

      const json = AuctionDetailResponseSchema.parse(await res.json());
      expect(json.subasta.titulo).toBe("Omega Speedmaster Professional 1969 Editado");
    });
  });
});
