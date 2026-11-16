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
  const requestId = crypto.randomUUID();
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
    const cursor = searchParams.get("cursor");
    if (cursor !== null) {
      rawQuery.cursor = cursor;
    }

    const query = AuctionListQuerySchema.parse(rawQuery);
    const subastas = await container.auctionService.listAuctions({
      estado: query.estado,
      q: query.q,
      limite: query.limite,
    });

    let siguienteCursor: string | null = null;
    if (subastas.length === query.limite && subastas.length > 0) {
      siguienteCursor = subastas[subastas.length - 1].id;
    }

    const payload = {
      subastas,
      total: subastas.length,
      siguiente_cursor: siguienteCursor,
    };

    const res = Response.json(AuctionListResponseSchema.parse(payload));
    res.headers.set("Cache-Control", "public, s-maxage=10, stale-while-revalidate=59");
    res.headers.set("x-request-id", requestId);
    return res;
  } catch (error) {
    const errRes = errorResponse(error);
    errRes.headers.set("x-request-id", requestId);
    return errRes;
  }
}

export async function POST(req: Request): Promise<Response> {
  const requestId = crypto.randomUUID();
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

    const now = new Date();
    const subasta = await container.auctionService.createAuction(input, vendedorUid, now);
    const res = Response.json(CreateAuctionResponseSchema.parse({ subasta }), { status: 201 });
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
