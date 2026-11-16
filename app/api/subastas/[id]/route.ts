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
  const requestId = crypto.randomUUID();
  try {
    const { id } = await context.params;
    const now = new Date();
    const subasta = await container.auctionService.getAuctionById(id, now);
    const payload = {
      subasta,
    };
    const res = Response.json(AuctionDetailResponseSchema.parse(payload));
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    res.headers.set("x-request-id", requestId);
    return res;
  } catch (error) {
    const errRes = errorResponse(error);
    errRes.headers.set("x-request-id", requestId);
    return errRes;
  }
}

export async function PATCH(req: Request, context: RouteContext): Promise<Response> {
  const requestId = crypto.randomUUID();
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
    const res = Response.json(AuctionDetailResponseSchema.parse(payload));
    res.headers.set("Cache-Control", "no-store");
    res.headers.set("x-request-id", requestId);
    return res;
  } catch (error) {
    const errRes = errorResponse(error);
    errRes.headers.set("Cache-Control", "no-store");
    errRes.headers.set("x-request-id", requestId);
    return errRes;
  }
}

export async function DELETE(req: Request, context: RouteContext): Promise<Response> {
  const requestId = crypto.randomUUID();
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
    const res = Response.json(DeleteAuctionResponseSchema.parse(payload));
    res.headers.set("Cache-Control", "no-store");
    res.headers.set("x-request-id", requestId);
    return res;
  } catch (error) {
    const errRes = errorResponse(error);
    errRes.headers.set("Cache-Control", "no-store");
    errRes.headers.set("x-request-id", requestId);
    return errRes;
  }
}
