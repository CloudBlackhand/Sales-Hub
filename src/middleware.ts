import { NextRequest, NextResponse } from "next/server";

const publicPaths = ["/login", "/register", "/api/auth", "/api/health"];

/** Parse simples de Cookie header — compatível com Edge (sem Prisma / Node APIs). */
function parseCookieHeader(cookieHeader: string | null): Map<string, string> {
  const map = new Map<string, string>();
  if (!cookieHeader) return map;
  for (const segment of cookieHeader.split(";")) {
    const trimmed = segment.trim();
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const name = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1);
    if (name) map.set(name, value);
  }
  return map;
}

/**
 * Better Auth (padrão): `better-auth.session_token` ou `__Secure-better-auth.session_token` em HTTPS.
 * Só presença do cookie — validação completa continua em Server Components / API (Node).
 */
function hasSessionCookie(request: NextRequest): boolean {
  const cookies = parseCookieHeader(request.headers.get("cookie"));
  const keys = ["better-auth.session_token", "__Secure-better-auth.session_token"];
  for (const k of keys) {
    const v = cookies.get(k);
    if (v && v.length > 0) return true;
  }
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (!hasSessionCookie(request)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
