import { AsyncLocalStorage } from "node:async_hooks";

export const DEMO_READ_ONLY_MESSAGE =
  "Este ambiente está em modo demonstração: não é possível gravar alterações nos dados.";

export function isDemoReadOnlyEnv(): boolean {
  const v = process.env.DEMO_READ_ONLY?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export class DemoReadOnlyError extends Error {
  readonly code = "DEMO_READ_ONLY" as const;
  constructor(message: string = DEMO_READ_ONLY_MESSAGE) {
    super(message);
    this.name = "DemoReadOnlyError";
  }
}

export function isDemoReadOnlyError(e: unknown): e is DemoReadOnlyError {
  return e instanceof DemoReadOnlyError;
}

const prismaWriteBypass = new AsyncLocalStorage<boolean>();

/** Usado pelo seed (auto arranque, bootstrap) — gravação de negócio na mesma `db` instanciada. */
export function runWithPrismaWriteBypass<T>(fn: () => Promise<T>): Promise<T> {
  return prismaWriteBypass.run(true, fn);
}

export function isPrismaWriteBypassActive(): boolean {
  return prismaWriteBypass.getStore() === true;
}

export function formatServerActionError(error: unknown, fallback: string): string {
  if (isDemoReadOnlyError(error)) return error.message;
  return fallback;
}
