import { PlaceBidInputSchema, PlaceBidResponseSchema } from "@/features/bids/schema";
import { container } from "@/features/container";
import { errorResponse } from "@/shared/server/http";
import { checkRateLimit } from "@/shared/server/rate-limiter";
import { readSession } from "@/shared/server/session";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, context: RouteContext): Promise<Response> {
  const requestId = crypto.randomUUID();
  try {
    const { id } = await context.params;
    const input = PlaceBidInputSchema.parse(await req.json());
    const isProduction = process.env.NODE_ENV === "production";
    const session = await readSession(req, container.accountService, isProduction);

    let userUid = "comprador-demo-01";
    if (session !== null) {
      userUid = session.uid;
    } else {
      const headerUid = req.headers.get("x-user-uid");
      if (headerUid !== null && headerUid.trim() !== "") {
        userUid = headerUid.trim();
      }
    }

    const now = new Date();
    const isAllowed = checkRateLimit(userUid, now);
    if (!isAllowed) {
      const rateLimitRes = Response.json(
        {
          error: {
            code: "TOO_MANY_REQUESTS",
            message: "Demasiadas solicitudes de puja. Por favor espera unos segundos.",
          },
        },
        { status: 429 },
      );
      rateLimitRes.headers.set("Cache-Control", "no-store");
      rateLimitRes.headers.set("x-request-id", requestId);
      return rateLimitRes;
    }

    const result = await container.bidService.placeBid(id, userUid, input, now);
    const successRes = Response.json(PlaceBidResponseSchema.parse(result), { status: 201 });
    successRes.headers.set("Cache-Control", "no-store");
    successRes.headers.set("x-request-id", requestId);
    return successRes;
  } catch (error) {
    const errRes = errorResponse(error);
    errRes.headers.set("Cache-Control", "no-store");
    errRes.headers.set("x-request-id", requestId);
    return errRes;
  }
}
