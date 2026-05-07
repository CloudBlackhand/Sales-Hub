import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getProducts } from "@/server/actions/products";
import { ProductsClient } from "./products-client";

export const metadata: Metadata = { title: "Produtos" };

interface Props {
  params: Promise<{ companySlug: string }>;
  searchParams: Promise<{ page?: string; search?: string; type?: string }>;
}

export default async function ProductsPage({ params, searchParams }: Props) {
  const { companySlug } = await params;
  const sp = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const company = await db.company.findUnique({ where: { slug: companySlug } });
  if (!company) redirect("/onboarding");

  const result = await getProducts(company.id, {
    page: sp.page ? parseInt(sp.page) : 1,
    search: sp.search,
    type: sp.type as never,
  });

  return <ProductsClient companyId={company.id} initialProducts={result} />;
}
