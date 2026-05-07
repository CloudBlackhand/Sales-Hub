import { DEMO_LOGIN_EMAIL } from "@/lib/demo-login";

/**
 * E-mails com acesso ao painel global `/supervise` (todos os tenants).
 * Defina `PLATFORM_ADMIN_EMAILS` (separados por vírgula) em produção.
 * Se não definido, apenas o usuário demo do seed é supervisor por padrão.
 */
export function isPlatformAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const fromEnv = process.env.PLATFORM_ADMIN_EMAILS?.split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const allowed =
    fromEnv && fromEnv.length > 0 ? fromEnv : [DEMO_LOGIN_EMAIL.toLowerCase()];
  return allowed.includes(normalized);
}
