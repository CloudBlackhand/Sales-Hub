import { NextResponse } from "next/server";
import { deleteCustomer } from "@/server/actions/customers";
import { resolveDashboardApiContext } from "@/server/dashboard/api-context";

interface RouteContext {
  params: Promise<{ companySlug: string; customerId: string }>;
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { companySlug, customerId } = await context.params;
  const resolved = await resolveDashboardApiContext(companySlug);
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const result = await deleteCustomer(resolved.company.id, customerId);
  if (!result.success) {
    return NextResponse.json({ error: result.error ?? "Erro ao excluir cliente" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
