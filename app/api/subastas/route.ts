import {
  AuctionListQuerySchema,
  AuctionListResponseSchema,
  CreateAuctionInputSchema,
  CreateAuctionResponseSchema,
} from "@/features/auctions/schema";
import { container } from "@/features/container";
import { errorResponse } from "@/shared/server/http";
import { readSession } from "@/shared/server/session";

export async function GET(req: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const rawQuery: Record<string, string> = {};
    const estado = searchParams.get("estado");
    if (estado !== null) {
      rawQuery.estado = estado;
    }
    const q = searchParams.get("q");
    if (q !== null) {
      rawQuery.q = q;
    }
    const limite = searchParams.get("limite");
    if (limite !== null) {
      rawQuery.limite = limite;
    }

    const query = AuctionListQuerySchema.parse(rawQuery);
    const subastas = await container.auctionService.listAuctions({
      estado: query.estado,
      q: query.q,
      limite: query.limite,
    });

    const payload = {
      subastas,
      total: subastas.length,
    };

    return Response.json(AuctionListResponseSchema.parse(payload));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: Request): Promise<Response> {
  try {
    const input = CreateAuctionInputSchema.parse(await req.json());
    const isProduction = process.env.NODE_ENV === "production";
    const session = await readSession(req, container.accountService, isProduction);
    let vendedorUid = "vendedor-demo-01";
    if (session !== null) {
      vendedorUid = session.uid;
    } else {
      const headerUid = req.headers.get("x-user-uid");
      if (headerUid !== null && headerUid.trim() !== "") {
        vendedorUid = headerUid.trim();
      }
    }

    const subasta = await container.auctionService.createAuction(input, vendedorUid, new Date());
    const payload = {
      subasta,
    };

    return Response.json(CreateAuctionResponseSchema.parse(payload), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
