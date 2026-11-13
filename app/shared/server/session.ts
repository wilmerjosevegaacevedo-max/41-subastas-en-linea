import type { SessionIdentity } from "@/shared/schema";
import { DomainError } from "./errors";

export const SESSION_COOKIE_NAME = "__Host-subastas_session";
export const DEV_SESSION_COOKIE_NAME = "subastas_session";
export const SESSION_MAX_AGE_SECONDS = 5 * 24 * 60 * 60; // 5 días

export interface SessionVerifier {
  verify(token: string): Promise<SessionIdentity>;
}

export function cookieName(isProduction: boolean): string {
  if (isProduction) {
    return SESSION_COOKIE_NAME;
  }
  return DEV_SESSION_COOKIE_NAME;
}

export async function readSession(
  request: Request,
  verifier: SessionVerifier,
  isProduction: boolean = false,
): Promise<SessionIdentity | null> {
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader === null) {
    return null;
  }
  const name = cookieName(isProduction);
  const token = readCookie(cookieHeader, name);
  if (token === null) {
    return null;
  }
  try {
    return await verifier.verify(token);
  } catch (error) {
    if (error instanceof DomainError) {
      throw error;
    }
    return null;
  }
}

export function requireSession(identity: SessionIdentity | null): SessionIdentity {
  if (identity === null) {
    throw new DomainError("UNAUTHENTICATED");
  }
  return identity;
}

export function sessionCookie(token: string, isProduction: boolean): string {
  let secure = "";
  if (isProduction) {
    secure = "; Secure";
  }
  const name = cookieName(isProduction);
  return `${name}=${encodeURIComponent(token)}; Max-Age=${SESSION_MAX_AGE_SECONDS}; Path=/; HttpOnly; SameSite=Lax${secure}`;
}

function readCookie(header: string, name: string): string | null {
  const cookies = header.split(";");
  for (const cookie of cookies) {
    const [key, ...parts] = cookie.trim().split("=");
    if (key === name) {
      const val = parts.join("=");
      if (val !== "") {
        return val;
      }
      return null;
    }
  }
  return null;
}
