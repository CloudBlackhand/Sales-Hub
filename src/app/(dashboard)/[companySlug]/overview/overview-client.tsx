"use client";

import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Users,
  ShoppingCart,
  Award,
  AlertCircle,
  ArrowRight,
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

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-700 text-gray-300",
  CONFIRMED: "bg-blue-900 text-blue-300",
  IN_PROGRESS: "bg-yellow-900 text-yellow-300",
  DELIVERED: "bg-green-900 text-green-300",
  CANCELLED: "bg-red-900 text-red-300",
  RETURNED: "bg-orange-900 text-orange-300",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Rascunho",
  CONFIRMED: "Confirmada",
  IN_PROGRESS: "Em andamento",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelada",
  RETURNED: "Devolvida",
};

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
      label: "Receita do mês",
      value: formatCurrency(summary.totalIncome),
      icon: TrendingUp,
      color: "text-green-400",
      bg: "bg-green-900/20",
    },
    {
      label: "Total de vendas",
      value: salesCount.toString(),
      icon: ShoppingCart,
      color: "text-blue-400",
      bg: "bg-blue-900/20",
    },
    {
      label: "Clientes",
      value: customersCount.toString(),
      icon: Users,
      color: "text-purple-400",
      bg: "bg-purple-900/20",
    },
    {
      label: "Comissões pendentes",
      value: formatCurrency(summary.commissionsPending),
      icon: AlertCircle,
      color: "text-yellow-400",
      bg: "bg-yellow-900/20",
    },
  ];

  return (
    <div className="min-h-full space-y-8 bg-black px-6 py-8 md:px-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Visão Geral</h1>
        <p className="mt-1.5 text-sm text-zinc-500">Resumo do desempenho do mês atual</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="border border-zinc-800/80 bg-zinc-950 shadow-none">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-zinc-500">{kpi.label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{kpi.value}</p>
                  </div>
                  <div className={`${kpi.bg} rounded-lg p-2.5`}>
                    <Icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Revenue chart */}
        <Card className="border border-zinc-800/80 bg-zinc-950 shadow-none xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base font-medium">Receita — mês atual</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <OverviewRevenueChart chartData={chartData} />
            ) : (
              <div className="flex h-[240px] items-center justify-center text-zinc-600">
                Sem dados de receita este mês
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top sellers */}
        <Card className="border border-zinc-800/80 bg-zinc-950 shadow-none">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium text-white">Top Vendedores</CardTitle>
              <Award className="h-4 w-4 text-yellow-500/90" />
            </div>
          </CardHeader>
          <CardContent>
            {topSellers.length > 0 ? (
              <div className="space-y-3">
                {topSellers.map((ts, i) => (
                  <div key={ts.sellerId} className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-300">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-zinc-200">{ts.seller?.name ?? "—"}</p>
                      <p className="text-xs text-zinc-500">{ts.seller?.code}</p>
                    </div>
                    <p className="text-sm font-medium text-emerald-400">{formatCurrency(ts.amount)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-zinc-600">Sem comissões registradas</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent sales */}
      <Card className="border border-zinc-800/80 bg-zinc-950 shadow-none">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium text-white">Vendas recentes</CardTitle>
            <Link
              href={`/${companySlug}/sales`}
              className="flex items-center gap-1 text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
            >
              Ver todas <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentSales.length > 0 ? (
            <div className="divide-y divide-zinc-800/80">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-950/50">
                      <ShoppingCart className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-200">
                        Venda #{sale.number}
                        {sale.customerName && <span className="text-zinc-500"> · {sale.customerName}</span>}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {sale.sellerName} · {sale.saleDateLabel}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`${statusColors[sale.status] ?? statusColors.DRAFT} border-0 text-xs`}>
                      {statusLabels[sale.status] ?? sale.status}
                    </Badge>
                    <p className="text-sm font-medium text-white">{formatCurrency(sale.totalAmount)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-zinc-600">Nenhuma venda registrada</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
