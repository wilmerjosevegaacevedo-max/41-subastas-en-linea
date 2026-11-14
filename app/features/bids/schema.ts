import { z } from "zod";

export const CreateBidInputSchema = z.object({
  subasta_id: z.string().min(1),
  monto_centavos: z.number().int().positive(),
});

export const BidValidationContextSchema = z.object({
  puja_actual_centavos: z.number().int().positive(),
  incremento_minimo_centavos: z.number().int().positive(),
  subasta_cerrada: z.boolean(),
});

export const BidResultSchema = z.object({
  subasta_id: z.string().min(1),
  monto_centavos: z.number().int().positive(),
  creada_en: z.string().datetime(),
  mensaje: z.string().min(1),
});

export const BidParticipationStatusSchema = z.enum(["ganando", "superada", "ganada", "perdida"]);

export const BidTabFilterSchema = z.enum(["todas", "activas", "ganadas"]);

export const UserBidSummarySchema = z.object({
  subasta_id: z.string().min(1),
  subasta_titulo: z.string().min(1),
  subasta_foto: z.string().url(),
  mi_puja_centavos: z.number().int().positive(),
  puja_actual_centavos: z.number().int().positive(),
  cierra_en: z.string().datetime(),
  estado_subasta: z.enum(["activa", "cerrada"]),
  estado_participacion: BidParticipationStatusSchema,
  fecha_puja: z.string().datetime(),
});

export const UserBidsResponseSchema = z.object({
  pujas: z.array(UserBidSummarySchema),
});

export type CreateBidInput = z.infer<typeof CreateBidInputSchema>;
export type BidValidationContext = z.infer<typeof BidValidationContextSchema>;
export type BidResult = z.infer<typeof BidResultSchema>;
export type BidParticipationStatus = z.infer<typeof BidParticipationStatusSchema>;
export type BidTabFilter = z.infer<typeof BidTabFilterSchema>;
export type UserBidSummary = z.infer<typeof UserBidSummarySchema>;
export type UserBidsResponse = z.infer<typeof UserBidsResponseSchema>;
