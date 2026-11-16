import { z } from "zod";

export const AuctionStatusSchema = z.enum(["activa", "cerrada", "cancelada"]);

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

export const AuctionListQuerySchema = z.object({
  estado: AuctionStatusSchema.optional(),
  q: z.string().trim().max(100).optional(),
  limite: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

export const AuctionListResponseSchema = z.object({
  subastas: z.array(AuctionDetailSchema),
  total: z.number().int().nonnegative(),
  siguiente_cursor: z.string().nullable().optional(),
});

export const AuctionStateResponseSchema = z.object({
  subasta_id: z.string().min(1),
  puja_actual_centavos: z.number().int().positive(),
  incremento_centavos: z.number().int().positive(),
  cierra_en: z.string().datetime(),
  estado: AuctionStatusSchema,
  ganador_uid: z.string().nullable(),
  tiempo_servidor: z.string().datetime(),
});

export const UpdateAuctionInputSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(5, "El título debe tener al menos 5 caracteres")
    .max(100, "El título no puede exceder 100 caracteres")
    .optional(),
  descripcion: z
    .string()
    .trim()
    .min(20, "La descripción debe tener al menos 20 caracteres")
    .max(2000, "La descripción no puede exceder 2000 caracteres")
    .optional(),
});

export const AuctionDetailResponseSchema = z.object({
  subasta: AuctionDetailSchema,
});

export const DeleteAuctionResponseSchema = z.object({
  mensaje: z.string(),
  subasta_id: z.string(),
  estado: AuctionStatusSchema,
});

export const UploadPhotoResponseSchema = z.object({
  foto_url: z.string().url(),
  tamano_bytes: z.number().int().positive(),
  tipo_mime: z.string().min(1),
});

export type AuctionStatus = z.infer<typeof AuctionStatusSchema>;
export type AuctionDetail = z.infer<typeof AuctionDetailSchema>;
export type ServerTimeResponse = z.infer<typeof ServerTimeResponseSchema>;
export type AuctionSortCriteria = z.infer<typeof AuctionSortCriteriaSchema>;
export type CreateAuctionInput = z.infer<typeof CreateAuctionInputSchema>;
export type CreateAuctionResponse = z.infer<typeof CreateAuctionResponseSchema>;
export type AuctionListQuery = z.infer<typeof AuctionListQuerySchema>;
export type AuctionListResponse = z.infer<typeof AuctionListResponseSchema>;
export type UpdateAuctionInput = z.infer<typeof UpdateAuctionInputSchema>;
export type AuctionDetailResponse = z.infer<typeof AuctionDetailResponseSchema>;
export type DeleteAuctionResponse = z.infer<typeof DeleteAuctionResponseSchema>;
export type UploadPhotoResponse = z.infer<typeof UploadPhotoResponseSchema>;
export type AuctionStateResponse = z.infer<typeof AuctionStateResponseSchema>;
