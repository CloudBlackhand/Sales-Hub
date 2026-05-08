"use client";

import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Filter,
  Globe,
  MousePointerClick,
  Clock3,
  Wallet,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { OverviewRevenueChart } from "./overview-revenue-chart";

interface OverviewClientProps {
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    commissionsPaid: number;
    commissionsPending: number;
  };
  salesCount: number;
  customersCount: number;
  topSellers: Array<{
    sellerId: string;
    amount: number;
    seller?: { id: string; name: string; code: string };
  }>;
  recentSales: Array<{
    id: string;
    number: number;
    type: string;
    status: string;
    totalAmount: number;
    saleDateLabel: string;
    sellerName: string;
    customerName: string | null;
  }>;
  chartData: Array<{ date: string; amount: number }>;
  companySlug: string;
}

export function OverviewClient({
  summary,
  salesCount,
  customersCount,
  topSellers,
  recentSales,
  chartData,
  companySlug,
}: OverviewClientProps) {
  const sparkBars = [7, 9, 8, 10, 12, 11, 13, 14, 12, 15, 13, 16];
  const refsRows = (topSellers.length > 0
    ? topSellers.slice(0, 6).map((seller, index) => ({
        name: seller.seller?.name ?? `Ref ${index + 1}`,
        views: Math.max(1, Math.round(seller.amount / 120)),
        sessions: Math.max(1, Math.round(seller.amount / 150)),
      }))
    : recentSales.slice(0, 6).map((sale) => ({
        name: sale.customerName ?? "Direct / Not set",
        views: Math.max(1, Math.round(sale.totalAmount / 120)),
        sessions: Math.max(1, Math.round(sale.totalAmount / 150)),
      })));
  const pagesRows = recentSales.slice(0, 6).map((sale) => ({
    path: `/sales/${sale.number}`,
    views: Math.max(1, Math.round(sale.totalAmount / 100)),
    sessions: Math.max(1, Math.round(sale.totalAmount / 130)),
  }));
  const kpis = [
    {
      label: "Unique Visitors",
      value: customersCount.toLocaleString("pt-BR"),
      icon: Globe,
      delta: "+0.7%",
    },
    {
      label: "Sessions",
      value: salesCount.toString(),
      icon: MousePointerClick,
      delta: "+0.9%",
    },
    {
      label: "Pageviews",
      value: Math.max(salesCount * 4, customersCount * 3).toLocaleString("pt-BR"),
      icon: TrendingUp,
      delta: "+0.6%",
    },
    {
      label: "Session Duration",
      value: "18s",
      icon: Clock3,
      delta: "+0.1%",
    },
    {
      label: "Revenue",
      value: formatCurrency(summary.totalIncome),
      icon: Wallet,
      delta: summary.totalIncome > 0 ? "+0.5%" : "0.0%",
    },
  ];

  return (
    <div className="min-h-full space-y-4 bg-zinc-950 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-8 border-zinc-800 bg-zinc-900 px-2.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
          Last Month
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 border-zinc-800 bg-zinc-900 px-2.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
        >
          Day
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 border-zinc-800 bg-zinc-900 px-2.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <Filter className="mr-1.5 h-3.5 w-3.5" />
          Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="gap-2 border border-zinc-800 bg-zinc-950 py-3 shadow-none">
              <CardContent className="space-y-2 px-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-wide text-zinc-500">{kpi.label}</p>
                  <span className="text-[11px] text-emerald-400">{kpi.delta}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-semibold text-zinc-100">{kpi.value}</p>
                  </div>
                  <Icon className="h-4 w-4 text-zinc-500" />
                </div>
                <div className="flex items-end gap-0.5">
                  {sparkBars.map((v, index) => (
                    <span
                      key={`${kpi.label}-${index}`}
                      className="w-1 rounded-sm bg-emerald-500/70"
                      style={{ height: `${Math.max(4, v)}px` }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border border-zinc-800 bg-zinc-950 py-2 shadow-none">
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-medium text-zinc-200">Unique Visitors</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <OverviewRevenueChart chartData={chartData} />
          ) : (
            <div className="flex h-[260px] items-center justify-center text-zinc-600">
              Sem dados de receita este mês
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <Card className="border border-zinc-800 bg-zinc-950 py-2 shadow-none">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-zinc-200">Refs</CardTitle>
          </CardHeader>
          <CardContent>
            {refsRows.length > 0 ? (
              <div className="space-y-1">
                <div className="grid grid-cols-[1fr_70px_70px] gap-2 border-b border-zinc-800 px-2 py-1 text-[11px] uppercase tracking-wide text-zinc-500">
                  <span>Referrer name</span>
                  <span className="text-right">Views</span>
                  <span className="text-right">Sess.</span>
                </div>
                {refsRows.map((row, i) => (
                  <div key={`${row.name}-${i}`} className="grid grid-cols-[1fr_70px_70px] items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-zinc-900">
                    <span className="truncate text-zinc-300">{row.name}</span>
                    <span className="text-right text-zinc-400">{row.views.toLocaleString("pt-BR")}</span>
                    <span className="text-right text-zinc-400">{row.sessions.toLocaleString("pt-BR")}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-zinc-600">Sem dados</p>
            )}
          </CardContent>
        </Card>
        <Card className="border border-zinc-800 bg-zinc-950 py-2 shadow-none">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-zinc-200">Pages</CardTitle>
          </CardHeader>
          <CardContent>
            {pagesRows.length > 0 ? (
              <div className="space-y-1">
                <div className="grid grid-cols-[1fr_70px_70px] gap-2 border-b border-zinc-800 px-2 py-1 text-[11px] uppercase tracking-wide text-zinc-500">
                  <span>Path</span>
                  <span className="text-right">Views</span>
                  <span className="text-right">Sess.</span>
                </div>
                {pagesRows.map((row, i) => (
                  <div key={`${row.path}-${i}`} className="grid grid-cols-[1fr_70px_70px] items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-zinc-900">
                    <span className="truncate text-zinc-300">{row.path}</span>
                    <span className="text-right text-zinc-400">{row.views.toLocaleString("pt-BR")}</span>
                    <span className="text-right text-zinc-400">{row.sessions.toLocaleString("pt-BR")}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-zinc-600">Sem dados</p>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-end">
        <Link
          href={`/${companySlug}/sales`}
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-400 transition-colors hover:text-blue-300"
        >
          Ver todas as vendas <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
