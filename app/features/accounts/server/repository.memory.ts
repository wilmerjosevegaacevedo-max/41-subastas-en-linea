import type { AccountUser } from "../schema";
import type { AccountRepository } from "./repository";

export function createSampleAccounts(): AccountUser[] {
  return [
    {
      uid: "comprador-demo-01",
      email: "comprador@demo.subastas.com",
      nombre: "Carlos Comprador",
      rol: "COMPRADOR",
    },
    {
      uid: "vendedor-demo-01",
      email: "vendedor@demo.subastas.com",
      nombre: "Valeria Vendedora",
      rol: "VENDEDOR",
    },
  ];
}

export class MemoryAccountRepository implements AccountRepository {
  private readonly usersByUid: Map<string, AccountUser> = new Map();

  constructor(initialUsers: AccountUser[] = []) {
    for (const user of initialUsers) {
      this.usersByUid.set(user.uid, user);
    }
  }

  async findByUid(uid: string): Promise<AccountUser | null> {
    const user = this.usersByUid.get(uid);
    if (user === undefined) {
      return null;
    }
    return user;
  }

  async findByEmail(email: string): Promise<AccountUser | null> {
    const normalized = email.toLowerCase().trim();
    for (const user of this.usersByUid.values()) {
      if (user.email.toLowerCase() === normalized) {
        return user;
      }
    }
    return null;
  }

  async save(user: AccountUser): Promise<AccountUser> {
    this.usersByUid.set(user.uid, user);
    return user;
  }
}
