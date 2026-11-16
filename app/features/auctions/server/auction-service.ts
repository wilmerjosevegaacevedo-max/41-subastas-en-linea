import { DomainError } from "@/shared/server/errors";
import {
  type AuctionDetail,
  type CreateAuctionInput,
  CreateAuctionInputSchema,
  type UpdateAuctionInput,
  UpdateAuctionInputSchema,
} from "../schema";
import type { AuctionListFilters, AuctionRepository } from "./repository";

export interface AuctionServiceDependencies {
  repository: AuctionRepository;
}

export function calculateMinimumIncrementCentavos(precioInicialPesos: number): number {
  const precioCentavos = precioInicialPesos * 100;
  const rawFivePercent = precioCentavos * 0.05;
  const roundedCentavos = Math.round(rawFivePercent / 50000) * 50000;
  if (roundedCentavos < 100000) {
    return 100000;
  }
  return roundedCentavos;
}

export function generateAuctionSlug(titulo: string, now: Date): string {
  const base = titulo
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const timeSuffix = now.getTime().toString(36);
  return `${base}-${timeSuffix}`;
}

export class AuctionService {
  private readonly repository: AuctionRepository;

  constructor(dependencies: AuctionServiceDependencies) {
    this.repository = dependencies.repository;
  }

  async getAuctionById(id: string, now?: Date): Promise<AuctionDetail> {
    const auction = await this.repository.findById(id);
    if (auction === null) {
      throw new DomainError("NOT_FOUND", "La subasta solicitada no existe");
    }
    let currentTime = new Date();
    if (now !== undefined) {
      currentTime = now;
    }
    if (auction.estado === "activa" && currentTime.getTime() >= new Date(auction.cierra_en).getTime()) {
      const closed: AuctionDetail = {
        ...auction,
        estado: "cerrada",
      };
      await this.repository.create(closed);
      return closed;
    }
    return auction;
  }

  async closeExpiredAuctions(now: Date): Promise<number> {
    const all = await this.repository.listActive();
    let count = 0;
    for (const a of all) {
      if (now.getTime() >= new Date(a.cierra_en).getTime()) {
        const closed: AuctionDetail = {
          ...a,
          estado: "cerrada",
        };
        await this.repository.create(closed);
        count += 1;
      }
    }
    return count;
  }

  async getActiveAuctions(): Promise<AuctionDetail[]> {
    return this.repository.listActive();
  }

  async listAuctions(filters?: AuctionListFilters): Promise<AuctionDetail[]> {
    return this.repository.list(filters);
  }

  async updateAuction(id: string, input: UpdateAuctionInput, userUid: string): Promise<AuctionDetail> {
    const auction = await this.getAuctionById(id);
    if (auction.vendedor_uid !== userUid) {
      throw new DomainError("FORBIDDEN", "No tienes permiso para modificar esta subasta");
    }
    if (auction.estado !== "activa") {
      throw new DomainError("CONFLICT", "Solo se pueden editar subastas activas");
    }
    if (auction.puja_actual_centavos !== auction.precio_inicial_centavos) {
      throw new DomainError("CONFLICT", "No se puede editar una subasta que ya tiene pujas registradas");
    }

    const validated = UpdateAuctionInputSchema.parse(input);
    return this.repository.update(id, validated);
  }

  async cancelAuction(id: string, userUid: string): Promise<AuctionDetail> {
    const auction = await this.getAuctionById(id);
    if (auction.vendedor_uid !== userUid) {
      throw new DomainError("FORBIDDEN", "No tienes permiso para cancelar esta subasta");
    }
    if (auction.estado !== "activa") {
      throw new DomainError("CONFLICT", "La subasta ya no está activa");
    }
    if (auction.puja_actual_centavos !== auction.precio_inicial_centavos) {
      throw new DomainError("CONFLICT", "No se puede cancelar una subasta que ya tiene pujas");
    }

    return this.repository.cancel(id);
  }

  async createAuction(input: CreateAuctionInput, vendedorUid: string, now: Date): Promise<AuctionDetail> {
    const validated = CreateAuctionInputSchema.parse(input);
    const precioCentavos = validated.precio_inicial_pesos * 100;
    const incrementoCentavos = calculateMinimumIncrementCentavos(validated.precio_inicial_pesos);
    const id = generateAuctionSlug(validated.titulo, now);
    const durationMs = validated.duracion_dias * 24 * 60 * 60 * 1000;
    const cierraEn = new Date(now.getTime() + durationMs).toISOString();

    const auction: AuctionDetail = {
      id,
      titulo: validated.titulo,
      descripcion: validated.descripcion,
      fotos: [validated.foto_url],
      precio_inicial_centavos: precioCentavos,
      incremento_centavos: incrementoCentavos,
      puja_actual_centavos: precioCentavos,
      vendedor_uid: vendedorUid,
      ganador_uid: null,
      cierra_en: cierraEn,
      estado: "activa",
    };

    return this.repository.create(auction);
  }
}

export function createAuctionService(dependencies: AuctionServiceDependencies): AuctionService {
  return new AuctionService(dependencies);
}
