import {
  AuctionDetailResponseSchema,
  DeleteAuctionResponseSchema,
  UpdateAuctionInputSchema,
} from "@/features/auctions/schema";
import { container } from "@/features/container";
import { errorResponse } from "@/shared/server/http";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, context: RouteContext): Promise<Response> {
  try {
    const { id } = await context.params;
    const subasta = await container.auctionService.getAuctionById(id);
    const payload = {
      subasta,
    };
    return Response.json(AuctionDetailResponseSchema.parse(payload));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(req: Request, context: RouteContext): Promise<Response> {
  try {
    const { id } = await context.params;
    const input = UpdateAuctionInputSchema.parse(await req.json());
    let userUid = "vendedor-demo-01";
    const headerUid = req.headers.get("x-user-uid");
    if (headerUid !== null && headerUid.trim() !== "") {
      userUid = headerUid.trim();
    }
    const subasta = await container.auctionService.updateAuction(id, input, userUid);
    const payload = {
      subasta,
    };
    return Response.json(AuctionDetailResponseSchema.parse(payload));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(req: Request, context: RouteContext): Promise<Response> {
  try {
    const { id } = await context.params;
    let userUid = "vendedor-demo-01";
    const headerUid = req.headers.get("x-user-uid");
    if (headerUid !== null && headerUid.trim() !== "") {
      userUid = headerUid.trim();
    }
    const subasta = await container.auctionService.cancelAuction(id, userUid);
    const payload = {
      mensaje: "Subasta cancelada exitosamente",
      subasta_id: subasta.id,
      estado: subasta.estado,
    };
    return Response.json(DeleteAuctionResponseSchema.parse(payload));
  } catch (error) {
    return errorResponse(error);
  }
}
