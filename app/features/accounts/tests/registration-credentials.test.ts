import { POST as POST_REGISTER } from "@/api/auth/register/route";
import { POST as POST_SESSION } from "@/api/auth/session/route";
import { describe, expect, it } from "vitest";
import { AccountService } from "../server/account-service";
import { MemoryAccountRepository } from "../server/repository.memory";

describe("F12 · Registro de nuevos usuarios y login con credenciales", () => {
  it("permite registrar un nuevo usuario con éxito y genera un token de sesión", async () => {
    const repository = new MemoryAccountRepository();
    const service = new AccountService({ repository });

    const result = await service.register({
      nombre: "María Postora",
      email: "maria@ejemplo.com",
      password: "password123",
      rol: "COMPRADOR",
    });

    expect(result.user.nombre).toBe("María Postora");
    expect(result.user.email).toBe("maria@ejemplo.com");
    expect(result.user.rol).toBe("COMPRADOR");
    expect(result.sessionToken.startsWith("user-token:")).toBe(true);

    const identity = await service.verify(result.sessionToken);
    expect(identity.uid).toBe(result.user.uid);
    expect(identity.email).toBe("maria@ejemplo.com");
    expect(identity.role).toBe("COMPRADOR");
  });

  it("rechaza el registro si el correo ya está registrado", async () => {
    const repository = new MemoryAccountRepository();
    const service = new AccountService({ repository });

    await service.register({
      nombre: "Pedro Vendedor",
      email: "pedro@ejemplo.com",
      password: "password123",
      rol: "VENDEDOR",
    });

    await expect(
      service.register({
        nombre: "Pedro Clon",
        email: "pedro@ejemplo.com",
        password: "otraPassword",
        rol: "COMPRADOR",
      }),
    ).rejects.toThrow("El correo electrónico ya se encuentra registrado");
  });

  it("permite iniciar sesión con credenciales correctas", async () => {
    const repository = new MemoryAccountRepository();
    const service = new AccountService({ repository });

    const registered = await service.register({
      nombre: "Laura Gómez",
      email: "laura@ejemplo.com",
      password: "secretoSeguro",
      rol: "VENDEDOR",
    });

    const loginResult = await service.createSession({
      email: "laura@ejemplo.com",
      password: "secretoSeguro",
    });

    expect(loginResult.user.uid).toBe(registered.user.uid);
    expect(loginResult.user.email).toBe("laura@ejemplo.com");
    expect(loginResult.user.rol).toBe("VENDEDOR");
  });

  it("rechaza el inicio de sesión con contraseña equivocada", async () => {
    const repository = new MemoryAccountRepository();
    const service = new AccountService({ repository });

    await service.register({
      nombre: "Andrés Rojas",
      email: "andres@ejemplo.com",
      password: "claveCorrecta123",
      rol: "COMPRADOR",
    });

    await expect(
      service.createSession({
        email: "andres@ejemplo.com",
        password: "claveErronea",
      }),
    ).rejects.toThrow("Credenciales inválidas");
  });

  it("POST /api/auth/register registra un usuario nuevo y devuelve Set-Cookie", async () => {
    const req = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: "Usuario API",
        email: "usuario-api@ejemplo.com",
        password: "password123",
        rol: "COMPRADOR",
      }),
    });

    const res = await POST_REGISTER(req);
    expect(res.status).toBe(201);
    expect(res.headers.get("Set-Cookie")).toContain("subastas_session=");
  });

  it("POST /api/auth/session inicia sesión con email y password", async () => {
    const registerReq = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: "Usuario Sesión",
        email: "sesion-test@ejemplo.com",
        password: "password456",
        rol: "VENDEDOR",
      }),
    });
    await POST_REGISTER(registerReq);

    const loginReq = new Request("http://localhost:3000/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "sesion-test@ejemplo.com",
        password: "password456",
      }),
    });

    const res = await POST_SESSION(loginReq);
    expect(res.status).toBe(200);
    expect(res.headers.get("Set-Cookie")).toContain("subastas_session=");
  });
});
