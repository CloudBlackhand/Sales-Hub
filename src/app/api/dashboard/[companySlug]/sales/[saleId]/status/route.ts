import { NextRequest, NextResponse } from "next/server";
import { updateSaleStatus } from "@/server/actions/sales";
import { SaleStatus } from "@/lib/prisma-types";
import { resolveDashboardApiContext } from "@/server/dashboard/api-context";

interface RouteContext {
  params: Promise<{ companySlug: string; saleId: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { companySlug, saleId } = await context.params;
  const resolved = await resolveDashboardApiContext(companySlug);
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const body = (await request.json()) as { status?: string };
  if (!body.status || !Object.values(SaleStatus).includes(body.status as SaleStatus)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  const result = await updateSaleStatus(resolved.company.id, saleId, body.status as SaleStatus);
  if (!result.success) {
    return NextResponse.json({ error: result.error ?? "Erro ao atualizar status" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
