import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest): NextResponse {
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/vender") || pathname.startsWith("/mis-pujas")) {
    const sessionCookie = request.cookies.get("subastas_session");
    if (sessionCookie === undefined || sessionCookie.value.trim() === "") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export default proxy;
