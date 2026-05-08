import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MemberRole } from "@/lib/prisma-types";

interface ResolveApiContextOptions {
  allowedRoles?: MemberRole[];
}

export async function resolveDashboardApiContext(
  companySlug: string,
  options: ResolveApiContextOptions = {}
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { ok: false as const, status: 401, error: "Não autenticado" };
  }

  const company = await db.company.findUnique({ where: { slug: companySlug } });
  if (!company) {
    return { ok: false as const, status: 404, error: "Empresa não encontrada" };
  }

  const membership = await db.companyMember.findUnique({
    where: { userId_companyId: { userId: session.user.id, companyId: company.id } },
  });
  if (!membership) {
    return { ok: false as const, status: 403, error: "Sem acesso a esta empresa" };
  }

  if (options.allowedRoles?.length && !options.allowedRoles.includes(membership.role)) {
    return { ok: false as const, status: 403, error: "Sem permissão para esta ação" };
  }

  return {
    ok: true as const,
    session,
    company,
    membership,
  };
}
