import { RoleSchema } from "@/shared/schema";
import { z } from "zod";

export const AccountUserSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email(),
  nombre: z.string().min(1),
  rol: RoleSchema,
});

export const LoginCredentialsInputSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const LoginDemoInputSchema = z.object({
  demo_uid: z.enum(["comprador-demo-01", "vendedor-demo-01"]),
});

export const CreateSessionInputSchema = z.object({
  id_token: z.string().min(1).optional(),
  demo_uid: z.enum(["comprador-demo-01", "vendedor-demo-01"]).optional(),
});

export const AuthSessionResponseSchema = z.object({
  usuario: AccountUserSchema,
});

export const DeleteSessionResponseSchema = z.object({
  mensaje: z.string(),
});

export type AccountUser = z.infer<typeof AccountUserSchema>;
export type LoginCredentialsInput = z.infer<typeof LoginCredentialsInputSchema>;
export type LoginDemoInput = z.infer<typeof LoginDemoInputSchema>;
export type CreateSessionInput = z.infer<typeof CreateSessionInputSchema>;
export type AuthSessionResponse = z.infer<typeof AuthSessionResponseSchema>;
export type DeleteSessionResponse = z.infer<typeof DeleteSessionResponseSchema>;
