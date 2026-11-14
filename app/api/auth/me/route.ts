import { AuthSessionResponseSchema } from "@/features/accounts/schema";
import { container } from "@/features/container";
import { DomainError } from "@/shared/server/errors";
import { errorResponse } from "@/shared/server/http";
import { readSession } from "@/shared/server/session";

export async function GET(req: Request): Promise<Response> {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    const session = await readSession(req, container.accountService, isProduction);
    if (session === null) {
      throw new DomainError("UNAUTHENTICATED", "No hay una sesión activa");
    }

    const user = await container.accountService.getProfile(session.uid);
    const payload = {
      usuario: user,
    };

    return Response.json(AuthSessionResponseSchema.parse(payload));
  } catch (error) {
    return errorResponse(error);
  }
}
