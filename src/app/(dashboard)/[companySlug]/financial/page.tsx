import type { Metadata } from "next";
import { getTransactions, getFinancialSummary, getCommissions } from "@/server/actions/financial";
import { FinancialClient } from "./financial-client";
import { requireDashboardContext } from "@/server/dashboard/context";
import { resolveDashboardPeriod } from "@/lib/dashboard-period";

export const metadata: Metadata = { title: "Financeiro" };

interface Props {
  params: Promise<{ companySlug: string }>;
  searchParams: Promise<{ tab?: string; page?: string; period?: string; from?: string; to?: string }>;
}

export default async function FinancialPage({ params, searchParams }: Props) {
  const { companySlug } = await params;
  const sp = await searchParams;
  const { company } = await requireDashboardContext(companySlug);

  const page = sp.page ? parseInt(sp.page) : 1;
  const { from, to } = resolveDashboardPeriod(sp);
  const fromIso = from.toISOString();
  const toIso = to.toISOString();
  const periodKey = `${fromIso}_${toIso}`;

  const [transactions, commissions, summary] = await Promise.all([
    getTransactions(company.id, { page, from: fromIso, to: toIso }),
    getCommissions(company.id, { page, from: fromIso, to: toIso }),
    getFinancialSummary(company.id, fromIso, toIso),
  ]);

  return (
    <FinancialClient
      companyId={company.id}
      companySlug={companySlug}
      initialTransactions={transactions}
      initialCommissions={commissions}
      summary={summary}
      periodKey={periodKey}
    />
  );
}
