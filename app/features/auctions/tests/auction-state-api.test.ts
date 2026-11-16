import { GET as getEstado } from "@/api/subastas/[id]/estado/route";
import { POST as runCron } from "@/api/cron/cerrar-subastas/route";
import { POST as placeBid } from "@/api/subastas/[id]/pujas/route";
import { AuctionStateResponseSchema } from "@/features/auctions/schema";
import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

describe("Auction State API & Cron (/api/subastas/:id/estado)", () => {
  it("GET /api/subastas/:id/estado retorna el estado actual con tiempo del servidor y headers no-store", async () => {
    const req = new NextRequest("http://localhost:3000/api/subastas/leica-m3-1954/estado");
    const res = await getEstado(req, {
      params: Promise.resolve({ id: "leica-m3-1954" }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toContain("no-store");
    expect(res.headers.get("x-request-id")).toBeDefined();

    const data = AuctionStateResponseSchema.parse(await res.json());
    expect(data.subasta_id).toBe("leica-m3-1954");
    expect(data.puja_actual_centavos).toBeGreaterThan(0);
    expect(data.tiempo_servidor).toBeDefined();
  });

  it("GET /api/subastas/:id/estado retorna 404 para subasta inexistente", async () => {
    const req = new NextRequest("http://localhost:3000/api/subastas/inexistente-999/estado");
    const res = await getEstado(req, {
      params: Promise.resolve({ id: "inexistente-999" }),
    });

    expect(res.status).toBe(404);
  });

  it("POST /api/cron/cerrar-subastas ejecuta la verificación de subastas expiradas", async () => {
    const res = await runCron();

    expect(res.status).toBe(200);
    const body = (await res.json()) as { cerradas: number; mensaje: string };
    expect(typeof body.cerradas).toBe("number");
    expect(body.mensaje).toContain("verificadas y cerradas");
  });

  it("POST /api/subastas/:id/pujas responde con 429 cuando se excede la tasa de solicitudes", async () => {
    const userUid = "rate-limit-tester-01";
    let lastStatus = 200;

    for (let i = 0; i < 12; i++) {
      const req = new NextRequest("http://localhost:3000/api/subastas/omega-speedmaster-1969/pujas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-uid": userUid,
        },
        body: JSON.stringify({ monto_centavos: 30000000 + i * 1000000 }),
      });

      const res = await placeBid(req, {
        params: Promise.resolve({ id: "omega-speedmaster-1969" }),
      });
      lastStatus = res.status;
    }

    expect(lastStatus).toBe(429);
  });
});
