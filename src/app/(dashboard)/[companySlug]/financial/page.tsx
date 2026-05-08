import type { Metadata } from "next";
import { getTransactions, getFinancialSummary, getCommissions } from "@/server/actions/financial";
import { FinancialClient } from "./financial-client";
import { requireDashboardContext } from "@/server/dashboard/context";

export const metadata: Metadata = { title: "Financeiro" };

interface Props {
  params: Promise<{ companySlug: string }>;
  searchParams: Promise<{ tab?: string; page?: string }>;
}

export default async function FinancialPage({ params, searchParams }: Props) {
  const { companySlug } = await params;
  const sp = await searchParams;
  const { company } = await requireDashboardContext(companySlug);

  const page = sp.page ? parseInt(sp.page) : 1;

  const [transactions, commissions, summary] = await Promise.all([
    getTransactions(company.id, { page }),
    getCommissions(company.id, { page }),
    getFinancialSummary(company.id),
  ]);

  return (
    <FinancialClient
      companyId={company.id}
      companySlug={companySlug}
      initialTransactions={transactions}
      initialCommissions={commissions}
      summary={summary}
    />
  );
}
