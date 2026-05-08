import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEMO_LOGIN_EMAIL } from "@/lib/demo-login";

/**
 * Diagnóstico opcional: verifica se o mesmo `DATABASE_URL` da app vê o usuário demo e a conta credential.
 * Protegido por segredo — não ativa sem `DB_AUTH_CHECK_SECRET`.
 *
 * GET /api/health/db-auth
 * Header: `Authorization: Bearer <DB_AUTH_CHECK_SECRET>` ou `x-db-auth-check: <secret>`
 */
export async function GET(request: NextRequest) {
  const secret = process.env.DB_AUTH_CHECK_SECRET;
  if (!secret?.trim()) {
    return NextResponse.json(
      { enabled: false, hint: "Defina DB_AUTH_CHECK_SECRET no Railway para usar este diagnóstico." },
      { status: 503 }
    );
  }

  const bearer = request.headers.get("authorization");
  const header = request.headers.get("x-db-auth-check");
  const token = bearer?.startsWith("Bearer ") ? bearer.slice(7).trim() : header?.trim();
  if (token !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const user = await db.user.findUnique({
      where: { email: DEMO_LOGIN_EMAIL },
      include: {
        accounts: { where: { providerId: "credential" } },
      },
    });

    const cred = user?.accounts[0];
    return NextResponse.json({
      demoEmail: DEMO_LOGIN_EMAIL,
      demoUserExists: Boolean(user),
      credentialRows: user?.accounts?.length ?? 0,
      hasPasswordHash: Boolean(cred?.password),
      databaseUrlSet: Boolean(process.env.DATABASE_URL),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "db_query_failed", message }, { status: 500 });
  }
}
