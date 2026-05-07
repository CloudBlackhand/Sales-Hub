import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSales } from "@/server/actions/sales";
import { getSellers } from "@/server/actions/sellers";
import { SalesClient } from "./sales-client";

export const metadata: Metadata = { title: "Vendas" };

interface Props {
  params: Promise<{ companySlug: string }>;
  searchParams: Promise<{ page?: string; search?: string; status?: string; sellerId?: string; type?: string }>;
}

export default async function SalesPage({ params, searchParams }: Props) {
  const { companySlug } = await params;
  const sp = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const company = await db.company.findUnique({ where: { slug: companySlug } });
  if (!company) redirect("/onboarding");

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
