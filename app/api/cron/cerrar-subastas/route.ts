import { container } from "@/features/container";
import { NextResponse } from "next/server";

export async function POST(): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  const now = new Date();
  const closedCount = await container.auctionService.closeExpiredAuctions(now);

  const res = NextResponse.json(
    {
      mensaje: "Subastas vencidas verificadas y cerradas exitosamente",
      cerradas: closedCount,
      ejecutado_en: now.toISOString(),
    },
    { status: 200 },
  );
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("x-request-id", requestId);
  return res;
}
