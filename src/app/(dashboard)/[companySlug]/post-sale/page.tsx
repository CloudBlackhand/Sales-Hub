import type { Metadata } from "next";
import { getPostSaleActivities } from "@/server/actions/post-sale";
import { getSellers } from "@/server/actions/sellers";
import { PostSaleClient } from "./post-sale-client";
import { requireDashboardContext } from "@/server/dashboard/context";

export const metadata: Metadata = { title: "Pós-Venda" };

interface Props {
  params: Promise<{ companySlug: string }>;
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function PostSalePage({ params, searchParams }: Props) {
  const { companySlug } = await params;
  const sp = await searchParams;
  const { company } = await requireDashboardContext(companySlug);

  const [result, sellersResult] = await Promise.all([
    getPostSaleActivities(company.id, {
      page: sp.page ? parseInt(sp.page) : 1,
      status: sp.status as never,
    }),
    getSellers(company.id, { perPage: 100 }),
  ]);

  return <PostSaleClient companyId={company.id} companySlug={companySlug} initialActivities={result} sellers={sellersResult.data} />;
}
