import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTransactions, getFinancialSummary, getCommissions } from "@/server/actions/financial";
import { getSellers } from "@/server/actions/sellers";
import { FinancialClient } from "./financial-client";

export const metadata: Metadata = { title: "Financeiro" };

interface Props {
  params: Promise<{ companySlug: string }>;
  searchParams: Promise<{ tab?: string; page?: string }>;
}

export default async function FinancialPage({ params, searchParams }: Props) {
  const { companySlug } = await params;
  const sp = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const company = await db.company.findUnique({ where: { slug: companySlug } });
  if (!company) redirect("/onboarding");

  const page = sp.page ? parseInt(sp.page) : 1;

  const [transactions, commissions, summary, sellers] = await Promise.all([
    getTransactions(company.id, { page }),
    getCommissions(company.id, { page }),
    getFinancialSummary(company.id),
    getSellers(company.id, { perPage: 100 }),
  ]);

  return (
    <FinancialClient
      companyId={company.id}
      initialTransactions={transactions}
      initialCommissions={commissions}
      summary={summary}
      sellers={sellers.data}
    />
  );
}
