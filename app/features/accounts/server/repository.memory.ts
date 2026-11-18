import { createHash } from "node:crypto";
import type { AccountRecord, AccountRepository } from "./repository";

export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export function createSampleAccounts(): AccountRecord[] {
  return [
    {
      uid: "comprador-demo-01",
      email: "comprador@demo.subastas.com",
      nombre: "Carlos Comprador",
      rol: "COMPRADOR",
      password_hash: hashPassword("demo123"),
    },
    {
      uid: "vendedor-demo-01",
      email: "vendedor@demo.subastas.com",
      nombre: "Valeria Vendedora",
      rol: "VENDEDOR",
      password_hash: hashPassword("demo123"),
    },
  ];
}

export class MemoryAccountRepository implements AccountRepository {
  private readonly usersByUid: Map<string, AccountRecord> = new Map();

  constructor(initialUsers: AccountRecord[] = []) {
    for (const user of initialUsers) {
      this.usersByUid.set(user.uid, user);
    }
  }

  async findByUid(uid: string): Promise<AccountRecord | null> {
    const user = this.usersByUid.get(uid);
    if (user === undefined) {
      return null;
    }
    return user;
  }

  async findByEmail(email: string): Promise<AccountRecord | null> {
    const normalized = email.toLowerCase().trim();
    for (const user of this.usersByUid.values()) {
      if (user.email.toLowerCase() === normalized) {
        return user;
      }
    }
    return null;
  }

  async save(user: AccountRecord): Promise<AccountRecord> {
    this.usersByUid.set(user.uid, user);
    return user;
  }
}
