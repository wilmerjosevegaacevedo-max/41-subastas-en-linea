import type { AuctionDetail } from "../schema";
import type { AuctionListFilters, AuctionRepository } from "./repository";

export function createSampleAuction(now: Date): AuctionDetail {
  const threeDaysAhead = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  return {
    id: "leica-m3-1954",
    titulo: "Cámara Vintage Leica M3 1954",
    descripcion:
      "Cámara telemétrica clásica de 35 mm en impecable estado de conservación mecánica y estética. Número de serie original de 1954, incluye lente Summicron 50mm f/2 y funda de cuero original.",
    fotos: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=80",
    ],
    precio_inicial_centavos: 15000000,
    incremento_centavos: 1000000,
    puja_actual_centavos: 15000000,
    vendedor_uid: "vendedor-coleccionista-01",
    ganador_uid: null,
    cierra_en: threeDaysAhead.toISOString(),
    estado: "activa",
  };
}

function createOmegaAuction(now: Date): AuctionDetail {
  const oneAndHalfDayAhead = new Date(now.getTime() + 36 * 60 * 60 * 1000);
  return {
    id: "omega-speedmaster-1969",
    titulo: "Reloj Omega Speedmaster Professional 1969",
    descripcion:
      "El legendario Moonwatch cronógrafo de cuerda manual calibre 861. Esfera negra original con pátina tritium homogénea y brazalete de acero inoxidable de época.",
    fotos: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80"],
    precio_inicial_centavos: 28000000,
    incremento_centavos: 1000000,
    puja_actual_centavos: 28000000,
    vendedor_uid: "vendedor-coleccionista-02",
    ganador_uid: null,
    cierra_en: oneAndHalfDayAhead.toISOString(),
    estado: "activa",
  };
}

function createMacBookAuction(now: Date): AuctionDetail {
  const fourDaysAhead = new Date(now.getTime() + 102 * 60 * 60 * 1000);
  return {
    id: "macbook-pro-m3-max",
    titulo: 'MacBook Pro 16" M3 Max 2023',
    descripcion:
      "Potencia gráfica y de cómputo extrema con chip M3 Max de 16 núcleos CPU y 40 núcleos GPU. 64 GB de memoria unificada y 1 TB de SSD ultra veloz, color negro espacial.",
    fotos: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80"],
    precio_inicial_centavos: 12500000,
    incremento_centavos: 500000,
    puja_actual_centavos: 12500000,
    vendedor_uid: "vendedor-tech-01",
    ganador_uid: null,
    cierra_en: fourDaysAhead.toISOString(),
    estado: "activa",
  };
}

export function createSampleAuctions(now: Date): AuctionDetail[] {
  return [createSampleAuction(now), createOmegaAuction(now), createMacBookAuction(now)];
}

export class MemoryAuctionRepository implements AuctionRepository {
  private readonly items: Map<string, AuctionDetail> = new Map();

  constructor(initialItems: AuctionDetail[] = []) {
    for (const item of initialItems) {
      this.items.set(item.id, item);
    }
  }

  async findById(id: string): Promise<AuctionDetail | null> {
    const item = this.items.get(id);
    if (item === undefined) {
      return null;
    }
    return item;
  }

  async listActive(): Promise<AuctionDetail[]> {
    const list: AuctionDetail[] = [];
    for (const item of this.items.values()) {
      if (item.estado === "activa") {
        list.push(item);
      }
    }
    return list;
  }

  async list(filters?: AuctionListFilters): Promise<AuctionDetail[]> {
    let result: AuctionDetail[] = Array.from(this.items.values());

    if (filters?.estado !== undefined) {
      result = result.filter((item) => {
        return item.estado === filters.estado;
      });
    }

    if (filters?.q !== undefined && filters.q.trim() !== "") {
      const query = filters.q.toLowerCase().trim();
      result = result.filter((item) => {
        const matchesTitle = item.titulo.toLowerCase().includes(query);
        const matchesDesc = item.descripcion.toLowerCase().includes(query);
        return matchesTitle || matchesDesc;
      });
    }

    if (filters?.limite !== undefined && filters.limite > 0) {
      result = result.slice(0, filters.limite);
    }

    return result;
  }

  async create(auction: AuctionDetail): Promise<AuctionDetail> {
    this.items.set(auction.id, auction);
    return auction;
  }

  async update(id: string, partial: { titulo?: string; descripcion?: string }): Promise<AuctionDetail> {
    const existing = this.items.get(id);
    if (existing === undefined) {
      throw new Error("Subasta no encontrada");
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
    this.items.set(id, updated);
    return updated;
  }

  async cancel(id: string): Promise<AuctionDetail> {
    const existing = this.items.get(id);
    if (existing === undefined) {
      throw new Error("Subasta no encontrada");
    }
    const cancelled: AuctionDetail = {
      ...existing,
      estado: "cancelada",
    };
    this.items.set(id, cancelled);
    return cancelled;
  }
}
