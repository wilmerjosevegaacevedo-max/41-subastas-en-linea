import {
  AuthSessionResponseSchema,
  CreateSessionInputSchema,
  DeleteSessionResponseSchema,
} from "@/features/accounts/schema";
import { container } from "@/features/container";
import { errorResponse } from "@/shared/server/http";
import { cookieName, sessionCookie } from "@/shared/server/session";

export async function POST(req: Request): Promise<Response> {
  try {
    const input = CreateSessionInputSchema.parse(await req.json());
    const isProduction = process.env.NODE_ENV === "production";
    const { user, sessionToken } = await container.accountService.createSession(input);

    const cookieHeader = sessionCookie(sessionToken, isProduction);
    const payload = {
      usuario: user,
    };

    return Response.json(AuthSessionResponseSchema.parse(payload), {
      status: 200,
      headers: {
        "Set-Cookie": cookieHeader,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(): Promise<Response> {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    const name = cookieName(isProduction);
    let secure = "";
    if (isProduction) {
      secure = "; Secure";
    }
    const clearCookieHeader = `${name}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax${secure}`;
    const payload = {
      mensaje: "Sesión cerrada exitosamente",
    };

    return Response.json(DeleteSessionResponseSchema.parse(payload), {
      status: 200,
      headers: {
        "Set-Cookie": clearCookieHeader,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
