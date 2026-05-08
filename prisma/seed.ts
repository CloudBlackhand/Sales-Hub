import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { runDemoSeed, DEMO_SEED_PASSWORD, DEMO_COMPANY_SLUG } from "../src/lib/demo-seed-logic";
import { DEMO_LOGIN_EMAIL } from "../src/lib/demo-login";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não definido");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log("[seed] Migrações não criam utilizadores — este script insere o demo.");

  await runDemoSeed(prisma);

  console.log("Seed concluído:");
  console.log(`  Utilizador: ${DEMO_LOGIN_EMAIL} / ${DEMO_SEED_PASSWORD}`);
  console.log(`  Ou no login: admin / ${DEMO_SEED_PASSWORD}`);
  console.log(`  Empresa: /${DEMO_COMPANY_SLUG}/overview`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
