import type { Metadata } from "next";
import { db } from "@/lib/db";
import { formatChartDayMonth, formatDate } from "@/lib/utils";
import { getFinancialSummary } from "@/server/actions/financial";
import { OverviewClient } from "./overview-client";
import { requireDashboardContext } from "@/server/dashboard/context";
import { resolveDashboardPeriod } from "@/lib/dashboard-period";

export const metadata: Metadata = { title: "Visão Geral" };

interface Props {
  params: Promise<{ companySlug: string }>;
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}

export default async function OverviewPage({ params, searchParams }: Props) {
  const { companySlug } = await params;
  const sp = await searchParams;
  const { company } = await requireDashboardContext(companySlug);

  const { from: rangeFrom, to: rangeTo } = resolveDashboardPeriod(sp);
  const fromIso = rangeFrom.toISOString();
  const toIso = rangeTo.toISOString();

  const [summary, salesCount, customersCount, topSellers] = await Promise.all([
    getFinancialSummary(company.id, fromIso, toIso),
    db.sale.count({
      where: {
        companyId: company.id,
        status: { not: "CANCELLED" },
        saleDate: { gte: rangeFrom, lte: rangeTo },
      },
    }),
    db.customer.count({
      where: {
        companyId: company.id,
        createdAt: { gte: rangeFrom, lte: rangeTo },
      },
    }),
    db.commission.groupBy({
      by: ["sellerId"],
      where: {
        companyId: company.id,
        createdAt: { gte: rangeFrom, lte: rangeTo },
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 5,
    }),
  ]);

  const topSellerIds = topSellers.map((s) => s.sellerId);
  const sellerNames = await db.seller.findMany({
    where: { id: { in: topSellerIds } },
    select: { id: true, name: true, code: true },
  });

  const topSellersData = topSellers.map((ts) => ({
    ...ts,
    seller: sellerNames.find((s) => s.id === ts.sellerId),
    amount: Number(ts._sum.amount ?? 0),
  }));

  const recentSales = await db.sale.findMany({
    where: {
      companyId: company.id,
      saleDate: { gte: rangeFrom, lte: rangeTo },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      seller: { select: { name: true } },
      customer: { select: { name: true } },
    },
  });

  const chartData = await db.financialTransaction.groupBy({
    by: ["date"],
    where: {
      companyId: company.id,
      type: "INCOME",
      date: { gte: rangeFrom, lte: rangeTo },
    },
    _sum: { amount: true },
    orderBy: { date: "asc" },
  });

  return (
    <OverviewClient
      summary={summary}
      salesCount={salesCount}
      customersCount={customersCount}
      topSellers={topSellersData}
      recentSales={recentSales.map((s) => ({
        id: s.id,
        number: s.number,
        type: s.type,
        status: s.status,
        totalAmount: Number(s.totalAmount),
        saleDateLabel: formatDate(s.saleDate),
        sellerName: s.seller.name,
        customerName: s.customer?.name ?? null,
      }))}
      chartData={chartData.map((d) => ({
        date: formatChartDayMonth(d.date),
        amount: Number(d._sum.amount ?? 0),
      }))}
      companySlug={companySlug}
    />
  );
}
