import { describe, expect, it } from "vitest";
import type { AuctionDetail } from "../schema";
import { type AuctionListFilters } from "../server/repository";
import { FirestoreAuctionRepository, type FirestoreAdapter } from "../server/repository.firestore";
import { createSampleAuction } from "../server/repository.memory";

describe("F6 · Repositorio Firestore de Subastas", () => {
  const now = new Date("2026-11-14T10:00:00.000Z");

  class FakeFirestoreAdapter implements FirestoreAdapter {
    private readonly store: Map<string, AuctionDetail> = new Map();

    constructor(initialData: AuctionDetail[] = []) {
      for (const item of initialData) {
        this.store.set(item.id, item);
      }
    }

    async getDoc(_collection: string, id: string): Promise<AuctionDetail | null> {
      const found = this.store.get(id);
      if (found === undefined) {
        return null;
      }
      return found;
    }

    async queryAuctions(_collection: string, filters?: AuctionListFilters): Promise<AuctionDetail[]> {
      let result = Array.from(this.store.values());
      if (filters?.estado !== undefined) {
        result = result.filter((item) => {
          return item.estado === filters.estado;
        });
      }
      if (filters?.q !== undefined && filters.q.trim() !== "") {
        const qLower = filters.q.toLowerCase().trim();
        result = result.filter((item) => {
          const matchTitle = item.titulo.toLowerCase().includes(qLower);
          const matchDesc = item.descripcion.toLowerCase().includes(qLower);
          return matchTitle || matchDesc;
        });
      }
      if (filters?.limite !== undefined && filters.limite > 0) {
        result = result.slice(0, filters.limite);
      }
      return result;
    }

    async setDoc(_collection: string, id: string, data: AuctionDetail): Promise<void> {
      this.store.set(id, data);
    }

    async updateDoc(_collection: string, id: string, partial: Record<string, string>): Promise<AuctionDetail> {
      const existing = this.store.get(id);
      if (existing === undefined) {
        throw new Error("Doc not found");
      }
      let newTitulo = existing.titulo;
      if (partial.titulo !== undefined) {
        newTitulo = partial.titulo;
      }
      let newDescripcion = existing.descripcion;
      if (partial.descripcion !== undefined) {
        newDescripcion = partial.descripcion;
      }
      const updated: AuctionDetail = {
        ...existing,
        titulo: newTitulo,
        descripcion: newDescripcion,
      };
      this.store.set(id, updated);
      return updated;
    }

    async cancelDoc(_collection: string, id: string): Promise<AuctionDetail> {
      const existing = this.store.get(id);
      if (existing === undefined) {
        throw new Error("Doc not found");
      }
      const cancelled: AuctionDetail = {
        ...existing,
        estado: "cancelada",
      };
      this.store.set(id, cancelled);
      return cancelled;
    }
  }

  it("encuentra subasta por ID en Firestore", async () => {
    const sample = createSampleAuction(now);
    const adapter = new FakeFirestoreAdapter([sample]);
    const repo = new FirestoreAuctionRepository(adapter);

    const result = await repo.findById(sample.id);
    expect(result).not.toBeNull();
    expect(result?.id).toBe(sample.id);
    expect(result?.titulo).toBe(sample.titulo);
  });

  it("retorna null si el documento no existe en Firestore", async () => {
    const adapter = new FakeFirestoreAdapter([]);
    const repo = new FirestoreAuctionRepository(adapter);

    const result = await repo.findById("no-existe");
    expect(result).toBeNull();
  });

  it("crea un nuevo documento en Firestore", async () => {
    const adapter = new FakeFirestoreAdapter([]);
    const repo = new FirestoreAuctionRepository(adapter);
    const sample = createSampleAuction(now);

    const created = await repo.create(sample);
    expect(created.id).toBe(sample.id);

    const fetched = await repo.findById(sample.id);
    expect(fetched?.id).toBe(sample.id);
  });

  it("actualiza campos permitidos en Firestore", async () => {
    const sample = createSampleAuction(now);
    const adapter = new FakeFirestoreAdapter([sample]);
    const repo = new FirestoreAuctionRepository(adapter);

    const updated = await repo.update(sample.id, {
      titulo: "Título Actualizado en Firestore",
    });
    expect(updated.titulo).toBe("Título Actualizado en Firestore");
  });

  it("cancela lógicamente el documento en Firestore", async () => {
    const sample = createSampleAuction(now);
    const adapter = new FakeFirestoreAdapter([sample]);
    const repo = new FirestoreAuctionRepository(adapter);

    const cancelled = await repo.cancel(sample.id);
    expect(cancelled.estado).toBe("cancelada");
  });

  it("lista y filtra subastas a través del adaptador", async () => {
    const sample = createSampleAuction(now);
    const adapter = new FakeFirestoreAdapter([sample]);
    const repo = new FirestoreAuctionRepository(adapter);

    const list = await repo.list({ estado: "activa", q: "Leica" });
    expect(list.length).toBe(1);
    expect(list[0]?.id).toBe("leica-m3-1954");
  });
});
