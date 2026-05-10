"use client";

import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Landmark, ShoppingBag, TrendingDown, Users, Wallet } from "lucide-react";
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
  const kpis = [
    {
      label: "Vendas no período",
      value: salesCount.toLocaleString("pt-BR"),
      icon: ShoppingBag,
    },
    {
      label: "Novos clientes",
      value: customersCount.toLocaleString("pt-BR"),
      icon: Users,
    },
    {
      label: "Receita",
      value: formatCurrency(summary.totalIncome),
      icon: Wallet,
    },
    {
      label: "Despesas",
      value: formatCurrency(summary.totalExpense),
      icon: TrendingDown,
    },
    {
      label: "Saldo",
      value: formatCurrency(summary.balance),
      icon: Landmark,
    },
  ];

  return (
    <div className="min-h-full space-y-4 bg-zinc-950 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="gap-2 border border-zinc-800 bg-zinc-950 py-3 shadow-none">
              <CardContent className="space-y-2 px-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] uppercase tracking-wide text-zinc-500">{kpi.label}</p>
                  <Icon className="h-4 w-4 shrink-0 text-zinc-500" />
                </div>
                <p className="text-2xl font-semibold tabular-nums text-zinc-100">{kpi.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border border-zinc-800 bg-zinc-950 py-2 shadow-none">
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-medium text-zinc-200">Receita</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <OverviewRevenueChart chartData={chartData} />
          ) : (
            <div className="flex h-[260px] items-center justify-center text-zinc-600">
              Sem dados de receita neste período
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <Card className="border border-zinc-800 bg-zinc-950 py-2 shadow-none">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-zinc-200">Top vendedores (comissão no período)</CardTitle>
          </CardHeader>
          <CardContent>
            {topSellers.length > 0 ? (
              <div className="space-y-1">
                <div className="grid grid-cols-[1fr_auto] gap-2 border-b border-zinc-800 px-2 py-1 text-[11px] uppercase tracking-wide text-zinc-500">
                  <span>Vendedor</span>
                  <span className="text-right">Comissão</span>
                </div>
                {topSellers.slice(0, 8).map((row) => (
                  <div
                    key={row.sellerId}
                    className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-md px-2 py-1.5 text-xs"
                  >
                    <span className="truncate text-zinc-300">
                      {row.seller?.name ?? "—"}{" "}
                      {row.seller?.code ? (
                        <span className="text-zinc-600">({row.seller.code})</span>
                      ) : null}
                    </span>
                    <span className="text-right font-medium tabular-nums text-zinc-200">
                      {formatCurrency(row.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-zinc-600">Sem comissões neste período</p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-zinc-800 bg-zinc-950 py-2 shadow-none">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-zinc-200">Últimas vendas</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSales.length > 0 ? (
              <div className="space-y-1">
                <div className="grid grid-cols-[auto_1fr_auto_auto] gap-2 border-b border-zinc-800 px-2 py-1 text-[11px] uppercase tracking-wide text-zinc-500">
                  <span>#</span>
                  <span>Cliente</span>
                  <span className="text-right">Valor</span>
                  <span className="text-right">Data</span>
                </div>
                {recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 rounded-md px-2 py-1.5 text-xs"
                  >
                    <span className="font-mono text-zinc-400">#{sale.number}</span>
                    <span className="truncate text-zinc-300">{sale.customerName ?? "—"}</span>
                    <span className="text-right tabular-nums text-zinc-200">{formatCurrency(sale.totalAmount)}</span>
                    <span className="text-right text-zinc-500">{sale.saleDateLabel}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-zinc-600">Sem vendas neste período</p>
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
