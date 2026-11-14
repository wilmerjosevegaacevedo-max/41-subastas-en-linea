import { POST } from "@/api/subastas/[id]/pujas/route";
import { ErrorResponseSchema } from "@/shared/schema";
import { describe, expect, it } from "vitest";
import { PlaceBidResponseSchema } from "../schema";

describe("F7 · API REST de Pujas y Concurrencia", () => {
  it("POST /api/subastas/[id]/pujas registra exitosamente una puja legítima", async () => {
    // La Leica M3 inicia en 15.000.000 centavos
    const req = new Request("http://localhost:3000/api/subastas/leica-m3-1954/pujas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-uid": "comprador-demo-01",
      },
      body: JSON.stringify({
        monto_centavos: 16000000,
      }),
    });
    const context = { params: Promise.resolve({ id: "leica-m3-1954" }) };
    const res = await POST(req, context);
    expect(res.status).toBe(201);

    const json = PlaceBidResponseSchema.parse(await res.json());
    expect(json.puja.subasta_id).toBe("leica-m3-1954");
    expect(json.puja.monto_centavos).toBe(16000000);
    expect(json.subasta_actualizada.puja_actual_centavos).toBe(16000000);
  });

  it("rechaza con 403 FORBIDDEN si el vendedor intenta pujar en su propia subasta", async () => {
    // Vendedor de leica-m3-1954 es "vendedor-coleccionista-01"
    const req = new Request("http://localhost:3000/api/subastas/leica-m3-1954/pujas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-uid": "vendedor-coleccionista-01",
      },
      body: JSON.stringify({
        monto_centavos: 20000000,
      }),
    });
    const context = { params: Promise.resolve({ id: "leica-m3-1954" }) };
    const res = await POST(req, context);
    expect(res.status).toBe(403);

    const json = ErrorResponseSchema.parse(await res.json());
    expect(json.error.code).toBe("FORBIDDEN");
  });

  it("rechaza con 404 NOT_FOUND si la subasta no existe", async () => {
    const req = new Request("http://localhost:3000/api/subastas/subasta-inexistente/pujas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-uid": "comprador-demo-01",
      },
      body: JSON.stringify({
        monto_centavos: 10000000,
      }),
    });
    const context = { params: Promise.resolve({ id: "subasta-inexistente" }) };
    const res = await POST(req, context);
    expect(res.status).toBe(404);

    const json = ErrorResponseSchema.parse(await res.json());
    expect(json.error.code).toBe("NOT_FOUND");
  });

  it("en dos pujas concurrentes por el mismo monto, una gana y la otra se rechaza con 409 CONFLICT", async () => {
    // Dos peticiones compiten por pujar exactamente 17.000.000 centavos
    const req1 = new Request("http://localhost:3000/api/subastas/leica-m3-1954/pujas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-uid": "postor-veloz-01",
      },
      body: JSON.stringify({
        monto_centavos: 17000000,
      }),
    });

    const req2 = new Request("http://localhost:3000/api/subastas/leica-m3-1954/pujas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-uid": "postor-veloz-02",
      },
      body: JSON.stringify({
        monto_centavos: 17000000,
      }),
    });

    const context = { params: Promise.resolve({ id: "leica-m3-1954" }) };
    const [res1, res2] = await Promise.all([POST(req1, context), POST(req2, context)]);

    const statuses = [res1.status, res2.status];
    expect(statuses).toContain(201);
    expect(statuses).toContain(409);
  });
});
