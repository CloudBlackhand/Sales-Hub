import type { Metadata } from "next";
import { getProducts } from "@/server/actions/products";
import { ProductsClient } from "./products-client";
import { requireDashboardContext } from "@/server/dashboard/context";

export const metadata: Metadata = { title: "Produtos" };

interface Props {
  params: Promise<{ companySlug: string }>;
  searchParams: Promise<{ page?: string; search?: string; type?: string }>;
}

export default async function ProductsPage({ params, searchParams }: Props) {
  const { companySlug } = await params;
  const sp = await searchParams;
  const { company } = await requireDashboardContext(companySlug);

  const result = await getProducts(company.id, {
    page: sp.page ? parseInt(sp.page) : 1,
    search: sp.search,
    type: sp.type as never,
  });

  return <ProductsClient companyId={company.id} companySlug={companySlug} initialProducts={result} />;
}
