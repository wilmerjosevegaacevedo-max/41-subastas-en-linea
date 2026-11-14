import type { AccountUser } from "../schema";

export interface AccountRepository {
  findByUid(uid: string): Promise<AccountUser | null>;
  findByEmail(email: string): Promise<AccountUser | null>;
  save(user: AccountUser): Promise<AccountUser>;
}
