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

export type CreateBidInput = z.infer<typeof CreateBidInputSchema>;
export type BidValidationContext = z.infer<typeof BidValidationContextSchema>;
export type BidResult = z.infer<typeof BidResultSchema>;
