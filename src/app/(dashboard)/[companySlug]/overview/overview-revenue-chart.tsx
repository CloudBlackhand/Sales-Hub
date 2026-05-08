"use client";

import { formatCurrency } from "@/lib/utils";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { date: string; amount: number };

export function OverviewRevenueChart({ chartData }: { chartData: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 12 }} />
        <YAxis
          tick={{ fill: "#71717a", fontSize: 12 }}
          tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#09090b",
            border: "1px solid #27272a",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "#fafafa" }}
          formatter={(value: unknown) => [formatCurrency(Number(value)), "Receita"]}
        />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="#3b82f6"
          fill="url(#colorAmount)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
