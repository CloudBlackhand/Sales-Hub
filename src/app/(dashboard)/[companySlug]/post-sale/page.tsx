import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPostSaleActivities } from "@/server/actions/post-sale";
import { getSellers } from "@/server/actions/sellers";
import { PostSaleClient } from "./post-sale-client";

export const metadata: Metadata = { title: "Pós-Venda" };

interface Props {
  params: Promise<{ companySlug: string }>;
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function PostSalePage({ params, searchParams }: Props) {
  const { companySlug } = await params;
  const sp = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const company = await db.company.findUnique({ where: { slug: companySlug } });
  if (!company) redirect("/onboarding");

  const [result, sellersResult] = await Promise.all([
    getPostSaleActivities(company.id, {
      page: sp.page ? parseInt(sp.page) : 1,
      status: sp.status as never,
    }),
    getSellers(company.id, { perPage: 100 }),
  ]);

  return <PostSaleClient companyId={company.id} initialActivities={result} sellers={sellersResult.data} />;
}
