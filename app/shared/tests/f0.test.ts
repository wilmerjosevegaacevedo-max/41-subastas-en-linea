import { describe, expect, it } from "vitest";
import { environmentReport } from "../server/env";
import { DomainError } from "../server/errors";
import { errorResponse } from "../server/http";
import { assertRequestOrigin } from "../server/origin";
import { readSession, requireSession, sessionCookie } from "../server/session";

describe("F0 · errores HTTP", () => {
  it("traduce errores de dominio al cuerpo y estado definidos", async () => {
    const response = errorResponse(new DomainError("NOT_FOUND"));
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: { code: "NOT_FOUND", message: "El recurso no existe" },
    });
  });

  it("traduce errores de conflicto y expiración", async () => {
    const conflictRes = errorResponse(new DomainError("CONFLICT"));
    expect(conflictRes.status).toBe(409);

    const expiredRes = errorResponse(new DomainError("EXPIRED"));
    expect(expiredRes.status).toBe(410);
  });

  it("oculta detalles de errores no reconocidos", async () => {
    const response = errorResponse(new Error("secreto interno"));
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: { code: "INTERNAL_ERROR", message: "Ocurrió un error interno" },
    });
  });
});

describe("F0 · origen (CSRF)", () => {
  it("permite el origen configurado y localhost en desarrollo", () => {
    expect(() =>
      assertRequestOrigin(
        new Request("http://localhost/api", { method: "POST", headers: { origin: "https://subastas.test" } }),
        "https://subastas.test",
        false,
      ),
    ).not.toThrow();
    expect(() =>
      assertRequestOrigin(
        new Request("http://localhost/api", { method: "POST", headers: { origin: "http://127.0.0.1:3000" } }),
        "https://subastas.test",
        true,
      ),
    ).not.toThrow();
  });

  it("rechaza origen ausente o externo en mutaciones", () => {
    expect(() =>
      assertRequestOrigin(new Request("http://localhost/api", { method: "POST" }), "https://subastas.test", true),
    ).toThrowError(DomainError);
    expect(() =>
      assertRequestOrigin(
        new Request("http://localhost/api", { method: "DELETE", headers: { origin: "https://atacante.test" } }),
        "https://subastas.test",
        true,
      ),
    ).toThrowError(DomainError);
  });
});

describe("F0 · sesión", () => {
  it("devuelve null sin cookie y exige identidad para operaciones protegidas", async () => {
    const verifier = { verify: async () => ({ uid: "u1" }) };
    await expect(readSession(new Request("http://localhost"), verifier, false)).resolves.toBeNull();
    expect(() => requireSession(null)).toThrowError(DomainError);
  });

  it("verifica la cookie y devuelve la identidad", async () => {
    const verifier = { verify: async (token: string) => ({ uid: token }) };
    await expect(
      readSession(
        new Request("http://localhost", { headers: { cookie: "subastas_session=token-123" } }),
        verifier,
        false,
      ),
    ).resolves.toEqual({ uid: "token-123" });
  });

  it("construye la cookie con atributos de seguridad", () => {
    const cookie = sessionCookie("token-abc", true);
    expect(cookie).toContain("__Host-subastas_session=token-abc");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Secure");
    expect(cookie).toContain("SameSite=Lax");
  });
});

describe("F0 · entorno", () => {
  it("informa estados sin exponer los valores reales", () => {
    const original = process.env.APP_ORIGIN;
    process.env.APP_ORIGIN = "http://localhost:3000";
    const report = environmentReport();
    expect(report.APP_ORIGIN).toBe("PRESENTE");
    expect(typeof report.APP_ORIGIN).toBe("string");
    process.env.APP_ORIGIN = original;
  });
});
