import { describe, expect, it } from "vitest";
import type { AccountUser } from "../schema";
import { FirestoreAccountRepository, type FirestoreAccountAdapter } from "../server/repository.firestore";

describe("F8 · Repositorio Firestore de Cuentas", () => {
  class FakeAccountAdapter implements FirestoreAccountAdapter {
    private readonly store: Map<string, AccountUser> = new Map();

    async getUser(uid: string): Promise<AccountUser | null> {
      const found = this.store.get(uid);
      if (found === undefined) {
        return null;
      }
      return found;
    }

    async getUserByEmail(email: string): Promise<AccountUser | null> {
      const normalized = email.toLowerCase().trim();
      for (const user of this.store.values()) {
        if (user.email.toLowerCase() === normalized) {
          return user;
        }
      }
      return null;
    }

    async saveUser(user: AccountUser): Promise<void> {
      this.store.set(user.uid, user);
    }
  }

  it("guarda y recupera un usuario por uid en Firestore", async () => {
    const adapter = new FakeAccountAdapter();
    const repo = new FirestoreAccountRepository(adapter);

    const testUser: AccountUser = {
      uid: "user-test-01",
      email: "test@ejemplo.com",
      nombre: "Usuario Prueba",
      rol: "COMPRADOR",
    };

    await repo.save(testUser);
    const retrieved = await repo.findByUid("user-test-01");
    expect(retrieved).not.toBeNull();
    expect(retrieved?.email).toBe("test@ejemplo.com");
  });

  it("encuentra un usuario por correo electrónico", async () => {
    const adapter = new FakeAccountAdapter();
    const repo = new FirestoreAccountRepository(adapter);

    await repo.save({
      uid: "user-test-02",
      email: "ana@ejemplo.com",
      nombre: "Ana Gómez",
      rol: "VENDEDOR",
    });

    const retrieved = await repo.findByEmail("ana@ejemplo.com");
    expect(retrieved).not.toBeNull();
    expect(retrieved?.uid).toBe("user-test-02");
  });

  it("retorna null si el usuario no existe", async () => {
    const adapter = new FakeAccountAdapter();
    const repo = new FirestoreAccountRepository(adapter);

    const retrieved = await repo.findByUid("inexistente");
    expect(retrieved).toBeNull();
  });
});
