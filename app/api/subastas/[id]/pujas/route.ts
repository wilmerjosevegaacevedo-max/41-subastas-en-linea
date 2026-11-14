import { PlaceBidInputSchema, PlaceBidResponseSchema } from "@/features/bids/schema";
import { container } from "@/features/container";
import { errorResponse } from "@/shared/server/http";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, context: RouteContext): Promise<Response> {
  try {
    const { id } = await context.params;
    const input = PlaceBidInputSchema.parse(await req.json());

    let userUid = "comprador-demo-01";
    const headerUid = req.headers.get("x-user-uid");
    if (headerUid !== null && headerUid.trim() !== "") {
      userUid = headerUid.trim();
    }

    const result = await container.bidService.placeBid(id, userUid, input, new Date());
    return Response.json(PlaceBidResponseSchema.parse(result), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
