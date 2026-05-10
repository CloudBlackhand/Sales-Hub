import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import {
  DemoReadOnlyError,
  isDemoReadOnlyEnv,
  isPrismaWriteBypassActive,
} from "@/lib/demo-read-only";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const WRITE_OPERATIONS = new Set([
  "create",
  "createMany",
  "createManyAndReturn",
  "update",
  "updateMany",
  "updateManyAndReturn",
  "upsert",
  "delete",
  "deleteMany",
]);

/** Modelos Better Auth: permitem login/registo com sessão; o resto do CRM fica bloqueado. */
const AUTH_WRITE_MODELS = new Set(["User", "Session", "Account", "Verification"]);

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString?.trim()) {
    throw new Error(
      "DATABASE_URL não está definido. Sem isso o Prisma não conecta — login e migrações falham."
    );
  }
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const base = new PrismaClient({ adapter });
  return base.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!WRITE_OPERATIONS.has(operation)) {
            return query(args);
          }
          if (!isDemoReadOnlyEnv()) {
            return query(args);
          }
          if (isPrismaWriteBypassActive()) {
            return query(args);
          }
          if (model && AUTH_WRITE_MODELS.has(model)) {
            return query(args);
          }
          throw new DemoReadOnlyError();
        },
      },
    },
  }) as unknown as PrismaClient;
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
