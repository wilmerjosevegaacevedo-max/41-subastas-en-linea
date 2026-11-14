import { CreateAuctionInputSchema, CreateAuctionResponseSchema } from "@/features/auctions/schema";
import { container } from "@/features/container";
import { errorResponse } from "@/shared/server/http";

export async function POST(req: Request): Promise<Response> {
  try {
    const input = CreateAuctionInputSchema.parse(await req.json());
    const vendedorUid = "vendedor-demo-01";
    const subasta = await container.auctionService.createAuction(input, vendedorUid, new Date());
    const payload = {
      subasta,
    };

    return Response.json(CreateAuctionResponseSchema.parse(payload), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
