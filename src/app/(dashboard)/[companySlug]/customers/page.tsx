import type { Metadata } from "next";
import { getCustomers } from "@/server/actions/customers";
import { CustomersClient } from "./customers-client";
import { requireDashboardContext } from "@/server/dashboard/context";

export const metadata: Metadata = { title: "Clientes" };

interface Props {
  params: Promise<{ companySlug: string }>;
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function CustomersPage({ params, searchParams }: Props) {
  const { companySlug } = await params;
  const sp = await searchParams;
  const { company } = await requireDashboardContext(companySlug);
  const result = await getCustomers(company.id, { page: sp.page ? parseInt(sp.page) : 1, search: sp.search });
  return <CustomersClient companyId={company.id} companySlug={companySlug} initialCustomers={result} />;
}
