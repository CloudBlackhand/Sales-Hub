import type { Metadata } from "next";
import { getSales } from "@/server/actions/sales";
import { getSellers } from "@/server/actions/sellers";
import { SalesClient } from "./sales-client";
import { requireDashboardContext } from "@/server/dashboard/context";

export const metadata: Metadata = { title: "Vendas" };

interface Props {
  params: Promise<{ companySlug: string }>;
  searchParams: Promise<{ page?: string; search?: string; status?: string; sellerId?: string; type?: string }>;
}

export default async function SalesPage({ params, searchParams }: Props) {
  const { companySlug } = await params;
  const sp = await searchParams;
  const { company } = await requireDashboardContext(companySlug);

  const [salesResult, sellersResult] = await Promise.all([
    getSales(company.id, {
      page: sp.page ? parseInt(sp.page) : 1,
      search: sp.search,
      status: sp.status as never,
      sellerId: sp.sellerId,
      type: sp.type as never,
    }),
    getSellers(company.id, { perPage: 100 }),
  ]);

  return (
    <SalesClient
      companyId={company.id}
      companySlug={companySlug}
      initialSales={salesResult}
      sellers={sellersResult.data}
    />
  );
}
