import { NextResponse } from "next/server";
import { approveCommission } from "@/server/actions/financial";
import { MemberRole } from "@/lib/prisma-types";
import { resolveDashboardApiContext } from "@/server/dashboard/api-context";

interface RouteContext {
  params: Promise<{ companySlug: string; commissionId: string }>;
}

export async function POST(_request: Request, context: RouteContext) {
  const { companySlug, commissionId } = await context.params;
  const resolved = await resolveDashboardApiContext(companySlug, {
    allowedRoles: [MemberRole.OWNER, MemberRole.ADMIN],
  });
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const result = await approveCommission(resolved.company.id, commissionId);
  if (!result.success) {
    return NextResponse.json({ error: result.error ?? "Erro ao aprovar comissão" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
