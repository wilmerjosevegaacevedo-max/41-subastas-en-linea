import type { AuctionDetail } from "../schema";
import type { AuctionRepository } from "./repository";

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
}
