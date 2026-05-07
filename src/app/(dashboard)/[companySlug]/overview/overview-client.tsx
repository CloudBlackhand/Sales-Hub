"use client";

import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Award,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
    saleDate: string;
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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Visão Geral</h1>
        <p className="text-gray-400 text-sm mt-1">Resumo do desempenho do mês atual</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="bg-gray-900 border-gray-800">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{kpi.label}</p>
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <Card className="xl:col-span-2 bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base font-medium">Receita — mês atual</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
                    labelStyle={{ color: "#e5e7eb" }}
                    formatter={(value: unknown) => [formatCurrency(Number(value)), "Receita"]}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#3b82f6" fill="url(#colorAmount)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-gray-500">
                Sem dados de receita este mês
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top sellers */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base font-medium">Top Vendedores</CardTitle>
              <Award className="w-4 h-4 text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            {topSellers.length > 0 ? (
              <div className="space-y-3">
                {topSellers.map((ts, i) => (
                  <div key={ts.sellerId} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-300">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 truncate">{ts.seller?.name ?? "—"}</p>
                      <p className="text-xs text-gray-500">{ts.seller?.code}</p>
                    </div>
                    <p className="text-sm font-medium text-green-400">{formatCurrency(ts.amount)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">Sem comissões registradas</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent sales */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-base font-medium">Vendas recentes</CardTitle>
            <Link href={`/${companySlug}/sales`} className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium">
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentSales.length > 0 ? (
            <div className="divide-y divide-gray-800">
              {recentSales.map((sale) => (
                <div key={sale.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-900/40 flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-200">
                        Venda #{sale.number}
                        {sale.customerName && <span className="text-gray-400"> · {sale.customerName}</span>}
                      </p>
                      <p className="text-xs text-gray-500">{sale.sellerName} · {new Date(sale.saleDate).toLocaleDateString("pt-BR")}</p>
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
            <p className="text-gray-500 text-sm text-center py-8">Nenhuma venda registrada</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
