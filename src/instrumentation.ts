/**
 * Corre uma vez por instância Node ao arrancar o servidor.
 * Garante utilizador/empresa demo na MESMA base que o `db` usa (mesmo DATABASE_URL dos pedidos),
 * sem depender só do `prisma db seed` no script de start da Railway.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.DISABLE_AUTO_DEMO_SEED === "1") return;
  if (!process.env.DATABASE_URL?.trim()) {
    console.warn("[auto-demo-seed] DATABASE_URL ausente — ignorado.");
    return;
  }

  try {
    const { db } = await import("@/lib/db");
    const { DEMO_LOGIN_EMAIL } = await import("@/lib/demo-login");
    const { runDemoSeed } = await import("@/lib/demo-seed-logic");

    const exists = await db.user.findUnique({
      where: { email: DEMO_LOGIN_EMAIL },
      select: { id: true },
    });
    if (exists) return;

    console.log("[auto-demo-seed] Sem utilizador demo nesta base — a executar runDemoSeed()");
    await runDemoSeed(db);
    console.log("[auto-demo-seed] Concluído.");
  } catch (e: unknown) {
    const code =
      typeof e === "object" && e !== null && "code" in e
        ? String((e as { code: unknown }).code)
        : "";
    if (code === "P2002") {
      console.log("[auto-demo-seed] Registo duplicado (concorrência) — ignorado.");
      return;
    }
    console.error("[auto-demo-seed] Falhou:", e);
  }
}
