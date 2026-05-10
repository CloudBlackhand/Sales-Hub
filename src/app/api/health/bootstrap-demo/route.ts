import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { runWithPrismaWriteBypass } from "@/lib/demo-read-only";
import {
  runDemoSeed,
  DEMO_COMPANY_SLUG,
} from "@/lib/demo-seed-logic";
import { DEMO_LOGIN_EMAIL } from "@/lib/demo-login";

/**
 * Repara produção quando o `prisma db seed` no arranque não corre ou falhou:
 * corre o mesmo código do seed contra o **mesmo** PrismaClient da app (`DATABASE_URL` atual).
 *
 * POST /api/health/bootstrap-demo
 * Header: Authorization: Bearer <DEMO_BOOTSTRAP_SECRET>
 *
 * Sem DEMO_BOOTSTRAP_SECRET nas env vars → 503 (endpoint desligado).
 */
export async function POST(request: NextRequest) {
  const secret = process.env.DEMO_BOOTSTRAP_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      {
        error: "bootstrap_disabled",
        hint: "Defina DEMO_BOOTSTRAP_SECRET na Railway, redeploy, faça um POST com Bearer, depois remova o segredo.",
      },
      { status: 503 }
    );
  }

  const bearer = request.headers.get("authorization");
  const header = request.headers.get("x-demo-bootstrap-secret");
  const token = bearer?.startsWith("Bearer ") ? bearer.slice(7).trim() : header?.trim();
  if (token !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    await runWithPrismaWriteBypass(() => runDemoSeed(db));
    return NextResponse.json({
      ok: true,
      loginEmail: DEMO_LOGIN_EMAIL,
      loginHint: "Na UI pode usar admin ou o e-mail acima; senha de demo está na caixa amarela do login.",
      companySlug: DEMO_COMPANY_SLUG,
      message:
        "Conta demo garantida neste Postgres. Remova DEMO_BOOTSTRAP_SECRET depois de testar.",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "bootstrap_failed", message }, { status: 500 });
  }
}
