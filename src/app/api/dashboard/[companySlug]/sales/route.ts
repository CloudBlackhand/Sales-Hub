import { NextRequest, NextResponse } from "next/server";
import { getSales } from "@/server/actions/sales";
import { resolveDashboardApiContext } from "@/server/dashboard/api-context";
import { resolveDashboardPeriod } from "@/lib/dashboard-period";

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
  const search = searchParams.get("search") || undefined;
  const status = searchParams.get("status") || undefined;

  const range = resolveDashboardPeriod({
    period: searchParams.get("period") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });

  const result = await getSales(resolved.company.id, {
    page,
    search,
    status: status as never,
    from: range.from.toISOString(),
    to: range.to.toISOString(),
  });

  return NextResponse.json(result);
}
