import type { Metadata } from "next";
import { getSellers } from "@/server/actions/sellers";
import { SellersClient } from "./sellers-client";
import { requireDashboardContext } from "@/server/dashboard/context";

export const metadata: Metadata = { title: "Vendedores" };

interface Props {
  params: Promise<{ companySlug: string }>;
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function SellersPage({ params, searchParams }: Props) {
  const { companySlug } = await params;
  const sp = await searchParams;
  const { company } = await requireDashboardContext(companySlug);
  const result = await getSellers(company.id, { page: sp.page ? parseInt(sp.page) : 1, search: sp.search });
  return <SellersClient companyId={company.id} companySlug={companySlug} initialSellers={result} />;
}
