import { z } from "zod";

export const RoleSchema = z.enum(["COMPRADOR", "VENDEDOR", "ADMINISTRADOR"]);

export const ErrorCodeSchema = z.enum([
  "VALIDATION_ERROR",
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "EXPIRED",
  "INTERNAL_ERROR",
]);

export const ErrorDetailSchema = z.object({
  field: z.string().optional(),
  message: z.string(),
});

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: ErrorCodeSchema,
    message: z.string(),
    details: z.array(ErrorDetailSchema).optional(),
  }),
});

export const SessionIdentitySchema = z.object({
  uid: z.string().min(1),
  email: z.string().email().optional(),
  role: RoleSchema.optional(),
});

export const EnvironmentStatusSchema = z.enum(["PRESENTE", "AUSENTE", "FORMATO_INVALIDO"]);

export const EnvironmentReportSchema = z.record(z.string(), EnvironmentStatusSchema);

export type Role = z.infer<typeof RoleSchema>;
export type ErrorCode = z.infer<typeof ErrorCodeSchema>;
export type ErrorDetail = z.infer<typeof ErrorDetailSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type SessionIdentity = z.infer<typeof SessionIdentitySchema>;
export type EnvironmentStatus = z.infer<typeof EnvironmentStatusSchema>;
export type EnvironmentReport = z.infer<typeof EnvironmentReportSchema>;
