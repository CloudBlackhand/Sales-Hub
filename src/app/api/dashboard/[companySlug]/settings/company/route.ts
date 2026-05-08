import { NextRequest, NextResponse } from "next/server";
import { updateCompanyInfo } from "@/server/actions/settings";
import { MemberRole } from "@/lib/prisma-types";
import { resolveDashboardApiContext } from "@/server/dashboard/api-context";

interface RouteContext {
  params: Promise<{ companySlug: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { companySlug } = await context.params;
  const resolved = await resolveDashboardApiContext(companySlug, {
    allowedRoles: [MemberRole.OWNER, MemberRole.ADMIN],
  });
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const body = await request.json();
  const result = await updateCompanyInfo(resolved.company.id, body);
  if (!result.success) {
    return NextResponse.json({ error: result.error ?? "Erro ao atualizar empresa" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
