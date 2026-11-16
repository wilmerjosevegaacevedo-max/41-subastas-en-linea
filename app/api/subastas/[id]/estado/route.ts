import { container } from "@/features/container";
import { AuctionStateResponseSchema } from "@/features/auctions/schema";
import { DomainError } from "@/shared/server/errors";
import { NextRequest, NextResponse } from "next/server";

function formatError<T>(error: T) {
  if (error instanceof DomainError) {
    let status = 400;
    if (error.code === "NOT_FOUND") {
      status = 404;
    }
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
        },
      },
      { status },
    );
  }

  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "Ocurrió un error inesperado al consultar el estado",
      },
    },
    { status: 500 },
  );
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  try {
    const { id } = await params;
    const now = new Date();
    const auction = await container.auctionService.getAuctionById(id, now);

    const payload = AuctionStateResponseSchema.parse({
      subasta_id: auction.id,
      puja_actual_centavos: auction.puja_actual_centavos,
      incremento_centavos: auction.incremento_centavos,
      cierra_en: auction.cierra_en,
      estado: auction.estado,
      ganador_uid: auction.ganador_uid,
      tiempo_servidor: now.toISOString(),
    });

    const res = NextResponse.json(payload, { status: 200 });
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    res.headers.set("x-request-id", requestId);
    return res;
  } catch (error) {
    const errRes = formatError(error);
    errRes.headers.set("x-request-id", requestId);
    return errRes;
  }
}
