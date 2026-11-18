import { AuthSessionResponseSchema, RegisterUserInputSchema } from "@/features/accounts/schema";
import { container } from "@/features/container";
import { errorResponse } from "@/shared/server/http";
import { sessionCookie } from "@/shared/server/session";

export async function POST(req: Request): Promise<Response> {
  try {
    const input = RegisterUserInputSchema.parse(await req.json());
    const isProduction = process.env.NODE_ENV === "production";
    const { user, sessionToken } = await container.accountService.register(input);

    const cookieHeader = sessionCookie(sessionToken, isProduction);
    const payload = {
      usuario: user,
    };

    return Response.json(AuthSessionResponseSchema.parse(payload), {
      status: 201,
      headers: {
        "Set-Cookie": cookieHeader,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
