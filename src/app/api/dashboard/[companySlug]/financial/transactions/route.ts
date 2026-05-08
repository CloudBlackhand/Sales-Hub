import { NextRequest, NextResponse } from "next/server";
import { getTransactions } from "@/server/actions/financial";
import { resolveDashboardApiContext } from "@/server/dashboard/api-context";

interface RouteContext {
  params: Promise<{ companySlug: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { companySlug } = await context.params;
  const resolved = await resolveDashboardApiContext(companySlug);
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const { searchParams } = request.nextUrl;
  const pageRaw = Number(searchParams.get("page") ?? "1");
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const result = await getTransactions(resolved.company.id, { page });
  return NextResponse.json(result);
}
