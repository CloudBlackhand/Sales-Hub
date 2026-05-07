/** Credenciais de demonstração — usuário pode digitar só `admin` ou o e-mail completo. */
export const DEMO_LOGIN_EMAIL = "admin@saleshub.demo";

/** Normaliza o campo de login: `admin` → e-mail técnico do demo. */
export function resolveLoginEmail(raw: string): string {
  const t = raw.trim().toLowerCase();
  if (t === "admin") return DEMO_LOGIN_EMAIL;
  return raw.trim().toLowerCase();
}
