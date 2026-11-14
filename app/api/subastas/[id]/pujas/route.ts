import { PlaceBidInputSchema, PlaceBidResponseSchema } from "@/features/bids/schema";
import { container } from "@/features/container";
import { errorResponse } from "@/shared/server/http";
import { readSession } from "@/shared/server/session";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, context: RouteContext): Promise<Response> {
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

    const result = await container.bidService.placeBid(id, userUid, input, new Date());
    return Response.json(PlaceBidResponseSchema.parse(result), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
