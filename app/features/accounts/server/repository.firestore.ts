import { getFirestoreDb } from "@/shared/server/firebase-admin";
import { AccountUserSchema } from "../schema";
import type { AccountRecord, AccountRepository } from "./repository";

export interface FirestoreAccountAdapter {
  getUser(uid: string): Promise<AccountRecord | null>;
  getUserByEmail(email: string): Promise<AccountRecord | null>;
  saveUser(user: AccountRecord): Promise<void>;
}

export class DefaultFirestoreAccountAdapter implements FirestoreAccountAdapter {
  async getUser(uid: string): Promise<AccountRecord | null> {
    const db = getFirestoreDb();
    const doc = await db.collection("users").doc(uid).get();
    if (!doc.exists) {
      return null;
    }
    const data = doc.data();
    if (data === undefined) {
      return null;
    }
    const user = AccountUserSchema.parse(data);
    let passwordHash: string | undefined = undefined;
    if (typeof data.password_hash === "string") {
      passwordHash = data.password_hash;
    }
    return {
      ...user,
      password_hash: passwordHash,
    };
  }

  async getUserByEmail(email: string): Promise<AccountRecord | null> {
    const db = getFirestoreDb();
    const snapshot = await db.collection("users").where("email", "==", email.toLowerCase().trim()).limit(1).get();
    const firstDoc = snapshot.docs[0];
    if (firstDoc === undefined) {
      return null;
    }
    const data = firstDoc.data();
    const user = AccountUserSchema.parse(data);
    let passwordHash: string | undefined = undefined;
    if (typeof data.password_hash === "string") {
      passwordHash = data.password_hash;
    }
    return {
      ...user,
      password_hash: passwordHash,
    };
  }

  async saveUser(user: AccountRecord): Promise<void> {
    const db = getFirestoreDb();
    const validated = AccountUserSchema.parse(user);
    const docData: Record<string, string> = {
      uid: validated.uid,
      email: validated.email,
      nombre: validated.nombre,
      rol: validated.rol,
    };
    if (user.password_hash !== undefined) {
      docData.password_hash = user.password_hash;
    }
    await db.collection("users").doc(validated.uid).set(docData);
  }
}

export class FirestoreAccountRepository implements AccountRepository {
  private readonly adapter: FirestoreAccountAdapter;

  constructor(adapter?: FirestoreAccountAdapter) {
    if (adapter !== undefined) {
      this.adapter = adapter;
    } else {
      this.adapter = new DefaultFirestoreAccountAdapter();
    }
  }

  async findByUid(uid: string): Promise<AccountRecord | null> {
    return this.adapter.getUser(uid);
  }

  async findByEmail(email: string): Promise<AccountRecord | null> {
    return this.adapter.getUserByEmail(email);
  }

  async save(user: AccountRecord): Promise<AccountRecord> {
    await this.adapter.saveUser(user);
    return user;
  }
}
