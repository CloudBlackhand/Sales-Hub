import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";

/** URL pública da API (cookies, redirects). Railway: use o domínio do serviço ou confie em RAILWAY_PUBLIC_DOMAIN. */
function resolveAuthBaseURL(): string {
  const raw =
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.RAILWAY_PUBLIC_DOMAIN
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : "");
  const trimmed = raw.replace(/\/$/, "");
  return trimmed || "http://localhost:3000";
}

function resolveTrustedOrigins(): string[] {
  const extra =
    process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];

  const railway =
    process.env.RAILWAY_PUBLIC_DOMAIN &&
    `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;

  const vercel =
    process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`;

  const candidates = [
    ...extra,
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    railway,
    vercel,
    "https://*.up.railway.app",
    "*.up.railway.app",
    "http://localhost:3000",
  ].filter((x): x is string => Boolean(x));

  return [...new Set(candidates)];
}

export const auth = betterAuth({
  baseURL: resolveAuthBaseURL(),
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  experimental: {
    joins: true,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    /** Demo admin/admin — aumente em produção se não usar conta demo. */
    minPasswordLength: 5,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // update session every day
    /** Sessão persistente na base — evita depender só de cookie/JWE em ambientes como Railway. */
    storeSessionInDatabase: true,
    cookieCache: {
      enabled: false,
    },
  },
  user: {
    additionalFields: {
      // Future: add company context here
    },
  },
  trustedOrigins: resolveTrustedOrigins(),
});

export type Session = typeof auth.$Infer.Session;
