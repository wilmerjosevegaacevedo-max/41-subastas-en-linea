import { GET as GET_ME } from "@/api/auth/me/route";
import { DELETE as DELETE_SESSION, POST as POST_SESSION } from "@/api/auth/session/route";
import { ErrorResponseSchema } from "@/shared/schema";
import { describe, expect, it } from "vitest";
import { AuthSessionResponseSchema, DeleteSessionResponseSchema } from "../schema";
import { createAccountService } from "../server/account-service";
import { createSampleAccounts, MemoryAccountRepository } from "../server/repository.memory";

describe("F8 · Autenticación y Manejo de Sesión HttpOnly", () => {
  it("AccountService crea y verifica sesiones demo correctamente", async () => {
    const repo = new MemoryAccountRepository(createSampleAccounts());
    const service = createAccountService({ repository: repo });

    const { user, sessionToken } = await service.createSession({
      demo_uid: "comprador-demo-01",
    });

    expect(user.uid).toBe("comprador-demo-01");
    expect(user.rol).toBe("COMPRADOR");
    expect(sessionToken).toContain("demo-token:comprador-demo-01");

    const identity = await service.verify(sessionToken);
    expect(identity.uid).toBe("comprador-demo-01");
    expect(identity.role).toBe("COMPRADOR");
  });

  it("POST /api/auth/session genera la cookie HttpOnly y retorna el usuario", async () => {
    const req = new Request("http://localhost:3000/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ demo_uid: "vendedor-demo-01" }),
    });

    const res = await POST_SESSION(req);
    expect(res.status).toBe(200);

    const setCookie = res.headers.get("Set-Cookie");
    expect(setCookie).not.toBeNull();
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=Lax");

    const json = AuthSessionResponseSchema.parse(await res.json());
    expect(json.usuario.uid).toBe("vendedor-demo-01");
    expect(json.usuario.rol).toBe("VENDEDOR");
  });

  it("GET /api/auth/me retorna 401 si no hay cookie de sesión", async () => {
    const req = new Request("http://localhost:3000/api/auth/me");
    const res = await GET_ME(req);
    expect(res.status).toBe(401);

    const json = ErrorResponseSchema.parse(await res.json());
    expect(json.error.code).toBe("UNAUTHENTICATED");
  });

  it("GET /api/auth/me retorna la identidad con una cookie válida", async () => {
    const req = new Request("http://localhost:3000/api/auth/me", {
      headers: {
        cookie: "subastas_session=demo-token%3Acomprador-demo-01",
      },
    });

    const res = await GET_ME(req);
    expect(res.status).toBe(200);

    const json = AuthSessionResponseSchema.parse(await res.json());
    expect(json.usuario.uid).toBe("comprador-demo-01");
    expect(json.usuario.email).toBe("comprador@demo.subastas.com");
  });

  it("DELETE /api/auth/session limpia la cookie de sesión con Max-Age=0", async () => {
    const res = await DELETE_SESSION();
    expect(res.status).toBe(200);

    const setCookie = res.headers.get("Set-Cookie");
    expect(setCookie).not.toBeNull();
    expect(setCookie).toContain("Max-Age=0");

    const json = DeleteSessionResponseSchema.parse(await res.json());
    expect(json.mensaje).toContain("Sesión cerrada");
  });
});
