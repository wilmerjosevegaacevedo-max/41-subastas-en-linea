import type { AccountUser } from "../schema";

export interface AccountRecord extends AccountUser {
  password_hash?: string;
}

export interface AccountRepository {
  findByUid(uid: string): Promise<AccountRecord | null>;
  findByEmail(email: string): Promise<AccountRecord | null>;
  save(user: AccountRecord): Promise<AccountRecord>;
}
