import { z } from "zod";

export const AuctionStatusSchema = z.enum(["activa", "cerrada"]);

export const AuctionDetailSchema = z.object({
  id: z.string().min(1),
  titulo: z.string().min(1).max(200),
  descripcion: z.string().min(1).max(2000),
  fotos: z.array(z.string().url()).min(1),
  precio_inicial_centavos: z.number().int().positive(),
  incremento_centavos: z.number().int().positive(),
  puja_actual_centavos: z.number().int().positive(),
  vendedor_uid: z.string().min(1),
  ganador_uid: z.string().nullable(),
  cierra_en: z.string().datetime(),
  estado: AuctionStatusSchema,
});

export const ServerTimeResponseSchema = z.object({
  server_time: z.string().datetime(),
});

export const AuctionSortCriteriaSchema = z.enum(["cierre_proximo", "menor_precio", "mayor_precio"]);

export type AuctionStatus = z.infer<typeof AuctionStatusSchema>;
export type AuctionDetail = z.infer<typeof AuctionDetailSchema>;
export type ServerTimeResponse = z.infer<typeof ServerTimeResponseSchema>;
export type AuctionSortCriteria = z.infer<typeof AuctionSortCriteriaSchema>;
