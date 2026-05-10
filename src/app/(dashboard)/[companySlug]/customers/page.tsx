import type { Metadata } from "next";
import { getCustomers } from "@/server/actions/customers";
import { CustomersClient } from "./customers-client";
import { requireDashboardContext } from "@/server/dashboard/context";
import { resolveDashboardPeriod } from "@/lib/dashboard-period";

export const metadata: Metadata = { title: "Clientes" };

interface Props {
  params: Promise<{ companySlug: string }>;
  searchParams: Promise<{ page?: string; search?: string; period?: string; from?: string; to?: string }>;
}

export default async function CustomersPage({ params, searchParams }: Props) {
  const { companySlug } = await params;
  const sp = await searchParams;
  const { company } = await requireDashboardContext(companySlug);
  const { from, to } = resolveDashboardPeriod(sp);
  const periodKey = `${from.toISOString()}_${to.toISOString()}`;
  const result = await getCustomers(company.id, {
    page: sp.page ? parseInt(sp.page) : 1,
    search: sp.search,
    from: from.toISOString(),
    to: to.toISOString(),
  });
  return (
    <CustomersClient
      companyId={company.id}
      companySlug={companySlug}
      initialCustomers={result}
      periodKey={periodKey}
    />
  );
}
