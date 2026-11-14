import { DomainError } from "@/shared/server/errors";
import { type AuctionDetail, type CreateAuctionInput, CreateAuctionInputSchema } from "../schema";
import type { AuctionRepository } from "./repository";

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

  async getAuctionById(id: string): Promise<AuctionDetail> {
    const auction = await this.repository.findById(id);
    if (auction === null) {
      throw new DomainError("NOT_FOUND", "La subasta solicitada no existe");
    }
    return auction;
  }

  async getActiveAuctions(): Promise<AuctionDetail[]> {
    return this.repository.listActive();
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
