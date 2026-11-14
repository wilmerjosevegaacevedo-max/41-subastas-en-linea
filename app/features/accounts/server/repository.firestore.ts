import { getFirestoreDb } from "@/shared/server/firebase-admin";
import { type AccountUser, AccountUserSchema } from "../schema";
import type { AccountRepository } from "./repository";

export interface FirestoreAccountAdapter {
  getUser(uid: string): Promise<AccountUser | null>;
  getUserByEmail(email: string): Promise<AccountUser | null>;
  saveUser(user: AccountUser): Promise<void>;
}

export class DefaultFirestoreAccountAdapter implements FirestoreAccountAdapter {
  async getUser(uid: string): Promise<AccountUser | null> {
    const db = getFirestoreDb();
    const doc = await db.collection("users").doc(uid).get();
    if (!doc.exists) {
      return null;
    }
    return AccountUserSchema.parse(doc.data());
  }

  async getUserByEmail(email: string): Promise<AccountUser | null> {
    const db = getFirestoreDb();
    const snapshot = await db.collection("users").where("email", "==", email.toLowerCase().trim()).limit(1).get();
    const firstDoc = snapshot.docs[0];
    if (firstDoc === undefined) {
      return null;
    }
    return AccountUserSchema.parse(firstDoc.data());
  }

  async saveUser(user: AccountUser): Promise<void> {
    const db = getFirestoreDb();
    const validated = AccountUserSchema.parse(user);
    await db.collection("users").doc(validated.uid).set(validated);
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

  async findByUid(uid: string): Promise<AccountUser | null> {
    return this.adapter.getUser(uid);
  }

  async findByEmail(email: string): Promise<AccountUser | null> {
    return this.adapter.getUserByEmail(email);
  }

  async save(user: AccountUser): Promise<AccountUser> {
    await this.adapter.saveUser(user);
    return user;
  }
}
