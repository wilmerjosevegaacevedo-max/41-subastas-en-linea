import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Producción usa el prefijo __Host- (ver app/shared/server/session.ts); desarrollo no.
const SESSION_COOKIE_NAMES = ["__Host-subastas_session", "subastas_session"];

function hasSessionCookie(request: NextRequest): boolean {
  for (const name of SESSION_COOKIE_NAMES) {
    const cookie = request.cookies.get(name);
    if (cookie !== undefined && cookie.value.trim() !== "") {
      return true;
    }
  }
  return false;
}

export function proxy(request: NextRequest): NextResponse {
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/vender") || pathname.startsWith("/mis-pujas")) {
    if (!hasSessionCookie(request)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export default proxy;
