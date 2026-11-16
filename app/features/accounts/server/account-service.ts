import type { SessionIdentity } from "@/shared/schema";
import { DomainError } from "@/shared/server/errors";
import { getFirebaseAuth } from "@/shared/server/firebase-admin";
import type { SessionVerifier } from "@/shared/server/session";
import type { AccountUser, CreateSessionInput } from "../schema";
import type { AccountRepository } from "./repository";

export interface AccountServiceDependencies {
  repository: AccountRepository;
}

export class AccountService implements SessionVerifier {
  private readonly repository: AccountRepository;

  constructor(dependencies: AccountServiceDependencies) {
    this.repository = dependencies.repository;
  }

  async getProfile(uid: string): Promise<AccountUser> {
    const user = await this.repository.findByUid(uid);
    if (user === null) {
      throw new DomainError("NOT_FOUND", "Usuario no encontrado");
    }
    return user;
  }

  async createSession(input: CreateSessionInput): Promise<{ user: AccountUser; sessionToken: string }> {
    if (input.demo_uid !== undefined) {
      return this.handleDemoLogin(input.demo_uid);
    }

    if (input.id_token !== undefined && input.id_token.trim() !== "") {
      return this.handleFirebaseIdToken(input.id_token);
    }

    throw new DomainError("VALIDATION_ERROR", "Se requiere demo_uid o id_token para iniciar sesión");
  }

  private async handleDemoLogin(
    demoUid: "comprador-demo-01" | "vendedor-demo-01",
  ): Promise<{ user: AccountUser; sessionToken: string }> {
    let user = await this.repository.findByUid(demoUid);
    if (user === null) {
      let nombre = "Carlos Comprador";
      let email = "comprador@demo.subastas.com";
      let rol: "COMPRADOR" | "VENDEDOR" = "COMPRADOR";
      if (demoUid === "vendedor-demo-01") {
        nombre = "Valeria Vendedora";
        email = "vendedor@demo.subastas.com";
        rol = "VENDEDOR";
      }

      user = await this.repository.save({
        uid: demoUid,
        email,
        nombre,
        rol,
      });
    }

    const sessionToken = `demo-token:${demoUid}`;
    return { user, sessionToken };
  }

  private async handleFirebaseIdToken(idToken: string): Promise<{ user: AccountUser; sessionToken: string }> {
    const auth = getFirebaseAuth();
    const decoded = await auth.verifyIdToken(idToken);

    let rol: "COMPRADOR" | "VENDEDOR" | "ADMINISTRADOR" = "COMPRADOR";
    if (decoded.rol === "VENDEDOR") {
      rol = "VENDEDOR";
    } else if (decoded.rol === "ADMINISTRADOR") {
      rol = "ADMINISTRADOR";
    }

    let email = `${decoded.uid}@subastas.com`;
    if (typeof decoded.email === "string" && decoded.email.trim() !== "") {
      email = decoded.email.trim();
    }
    let nombre = "Usuario";
    if (typeof decoded.name === "string" && decoded.name.trim() !== "") {
      nombre = decoded.name.trim();
    }

    let user = await this.repository.findByUid(decoded.uid);
    if (user === null) {
      user = await this.repository.save({
        uid: decoded.uid,
        email,
        nombre,
        rol,
      });
    }

    const sessionToken = await auth.createSessionCookie(idToken, {
      expiresIn: 5 * 24 * 60 * 60 * 1000,
    });

    return { user, sessionToken };
  }

  async verify(token: string): Promise<SessionIdentity> {
    if (token.startsWith("demo-token:")) {
      const demoUid = token.replace("demo-token:", "");
      const user = await this.repository.findByUid(demoUid);
      if (user === null) {
        throw new DomainError("UNAUTHENTICATED", "Sesión demo inválida");
      }
      return {
        uid: user.uid,
        email: user.email,
        role: user.rol,
      };
    }

    try {
      const auth = getFirebaseAuth();
      const decoded = await auth.verifySessionCookie(token, true);

      let role: "COMPRADOR" | "VENDEDOR" | "ADMINISTRADOR" = "COMPRADOR";
      if (decoded.rol === "VENDEDOR") {
        role = "VENDEDOR";
      } else if (decoded.rol === "ADMINISTRADOR") {
        role = "ADMINISTRADOR";
      } else {
        const user = await this.repository.findByUid(decoded.uid);
        if (user !== null) {
          role = user.rol;
        }
      }

      let email: string | undefined = undefined;
      if (typeof decoded.email === "string") {
        email = decoded.email;
      }
      return {
        uid: decoded.uid,
        email,
        role,
      };
    } catch {
      throw new DomainError("UNAUTHENTICATED", "Token de sesión inválido o expirado");
    }
  }
}

export function createAccountService(dependencies: AccountServiceDependencies): AccountService {
  return new AccountService(dependencies);
}
