import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCustomers } from "@/server/actions/customers";
import { CustomersClient } from "./customers-client";

export const metadata: Metadata = { title: "Clientes" };

interface Props {
  params: Promise<{ companySlug: string }>;
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function CustomersPage({ params, searchParams }: Props) {
  const { companySlug } = await params;
  const sp = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const company = await db.company.findUnique({ where: { slug: companySlug } });
  if (!company) redirect("/onboarding");
  const result = await getCustomers(company.id, { page: sp.page ? parseInt(sp.page) : 1, search: sp.search });
  return <CustomersClient companyId={company.id} initialCustomers={result} />;
}
