import { createAuthClient } from "better-auth/react";

/** No browser, sempre o mesmo origin da página — evita login quebrado se NEXT_PUBLIC_APP_URL / build estiver errado (ex.: placeholder Railway). */
function resolveAuthBaseURL(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: resolveAuthBaseURL(),
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  getSession,
} = authClient;
