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

export const CreateAuctionInputSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(5, "El título debe tener al menos 5 caracteres")
    .max(100, "El título no puede exceder 100 caracteres"),
  descripcion: z
    .string()
    .trim()
    .min(20, "La descripción debe tener al menos 20 caracteres")
    .max(2000, "La descripción no puede exceder 2000 caracteres"),
  foto_url: z.string().url("Debe ser una URL válida").startsWith("https://", "La imagen debe ser una URL segura https"),
  precio_inicial_pesos: z.number().int().min(10000, "El precio inicial mínimo es de $10.000 COP"),
  duracion_dias: z
    .number()
    .int()
    .refine((days) => {
      return days === 1 || days === 3 || days === 5 || days === 7;
    }, "La duración debe ser de 1, 3, 5 o 7 días"),
});

export const CreateAuctionResponseSchema = z.object({
  subasta: AuctionDetailSchema,
});

export type AuctionStatus = z.infer<typeof AuctionStatusSchema>;
export type AuctionDetail = z.infer<typeof AuctionDetailSchema>;
export type ServerTimeResponse = z.infer<typeof ServerTimeResponseSchema>;
export type AuctionSortCriteria = z.infer<typeof AuctionSortCriteriaSchema>;
export type CreateAuctionInput = z.infer<typeof CreateAuctionInputSchema>;
export type CreateAuctionResponse = z.infer<typeof CreateAuctionResponseSchema>;
