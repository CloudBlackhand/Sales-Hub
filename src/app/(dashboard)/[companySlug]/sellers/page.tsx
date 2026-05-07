import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSellers } from "@/server/actions/sellers";
import { SellersClient } from "./sellers-client";

export const metadata: Metadata = { title: "Vendedores" };

interface Props {
  params: Promise<{ companySlug: string }>;
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function SellersPage({ params, searchParams }: Props) {
  const { companySlug } = await params;
  const sp = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const company = await db.company.findUnique({ where: { slug: companySlug } });
  if (!company) redirect("/onboarding");
  const result = await getSellers(company.id, { page: sp.page ? parseInt(sp.page) : 1, search: sp.search });
  return <SellersClient companyId={company.id} initialSellers={result} />;
}
