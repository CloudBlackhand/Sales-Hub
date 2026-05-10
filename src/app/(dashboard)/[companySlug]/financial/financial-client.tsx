"use client";

import { useState, useCallback, useTransition } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommissionsListResponse,
  CommissionListItem,
  TransactionsListResponse,
  TransactionListItem,
} from "@/lib/dashboard/contracts";
import { Plus, MoreHorizontal, CheckCircle, DollarSign, TrendingUp, TrendingDown, AlertCircle, CalendarDays, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TransactionFormDialog } from "@/components/forms/transaction-form-dialog";
import { dashboardToolbar } from "@/lib/dashboard-ui-strings";

const commStatusColors: Record<string, string> = {
  PENDING: "bg-zinc-700 text-zinc-200",
  APPROVED: "bg-zinc-100 text-zinc-900",
  PAID: "bg-zinc-100 text-zinc-900",
  CANCELLED: "bg-zinc-800 text-zinc-400",
};

const commStatusLabels: Record<string, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovada",
  PAID: "Paga",
  CANCELLED: "Cancelada",
};

const txTypeColors: Record<string, string> = {
  INCOME: "bg-zinc-100 text-zinc-900",
  EXPENSE: "bg-zinc-800 text-zinc-300",
  COMMISSION_PAYMENT: "bg-zinc-700 text-zinc-200",
};

const txTypeLabels: Record<string, string> = {
  INCOME: "Receita",
  EXPENSE: "Despesa",
  COMMISSION_PAYMENT: "Pag. Comissão",
};

interface Props {
  companyId: string;
  companySlug: string;
  initialTransactions: TransactionsListResponse;
  initialCommissions: CommissionsListResponse;
  summary: { totalIncome: number; totalExpense: number; balance: number; commissionsPaid: number; commissionsPending: number };
}

export function FinancialClient({ companyId, companySlug, initialTransactions, initialCommissions, summary }: Props) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [commissions, setCommissions] = useState(initialCommissions);
  const [txPage, setTxPage] = useState(1);
  const [cmPage, setCmPage] = useState(1);
  const [txLoading, setTxLoading] = useState(false);
  const [cmLoading, setCmLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [, startTransition] = useTransition();
  const financialBasePath = `/api/dashboard/${companySlug}/financial`;

  const fetchTx = useCallback(async (p: number) => {
    setTxLoading(true);
    const response = await fetch(`${financialBasePath}/transactions?page=${p}`, { method: "GET" });
    const r = await response.json();
    if (!response.ok) {
      toast.error(r.error ?? "Erro ao carregar lançamentos");
      setTxLoading(false);
      return;
    }
    setTransactions(r);
    setTxPage(p);
    setTxLoading(false);
  }, [financialBasePath]);

  const fetchCm = useCallback(async (p: number) => {
    setCmLoading(true);
    const response = await fetch(`${financialBasePath}/commissions?page=${p}`, { method: "GET" });
    const r = await response.json();
    if (!response.ok) {
      toast.error(r.error ?? "Erro ao carregar comissões");
      setCmLoading(false);
      return;
    }
    setCommissions(r as CommissionsListResponse);
    setCmPage(p);
    setCmLoading(false);
  }, [financialBasePath]);

  const summaryCards = [
    { label: "Receita total", value: formatCurrency(summary.totalIncome), icon: TrendingUp, color: "text-green-400", bg: "bg-green-900/20" },
    { label: "Despesas", value: formatCurrency(summary.totalExpense), icon: TrendingDown, color: "text-red-400", bg: "bg-red-900/20" },
    { label: "Saldo", value: formatCurrency(summary.balance), icon: DollarSign, color: summary.balance >= 0 ? "text-blue-400" : "text-red-400", bg: "bg-blue-900/20" },
    { label: "Comissões pendentes", value: formatCurrency(summary.commissionsPending), icon: AlertCircle, color: "text-yellow-400", bg: "bg-yellow-900/20" },
  ];

  const txColumns: ColumnDef<TransactionListItem>[] = [
    { accessorKey: "date", header: "Data", cell: ({ row }) => <span className="text-gray-400 text-sm">{formatDate(row.original.date)}</span> },
    { accessorKey: "type", header: "Tipo", cell: ({ row }) => <Badge className={`${txTypeColors[row.original.type] ?? ""} border-0 text-xs`}>{txTypeLabels[row.original.type] ?? row.original.type}</Badge> },
    { accessorKey: "category", header: "Categoria", cell: ({ row }) => <span className="text-gray-400 text-sm">{row.original.category ?? "—"}</span> },
    { accessorKey: "description", header: "Descrição", cell: ({ row }) => <span className="text-gray-200 text-sm">{row.original.description ?? "—"}</span> },
    { accessorKey: "amount", header: "Valor", cell: ({ row }) => <span className={`font-medium ${row.original.type === "INCOME" ? "text-green-400" : "text-red-400"}`}>{formatCurrency(row.original.amount)}</span> },
  ];

  const cmColumns: ColumnDef<CommissionListItem>[] = [
    { accessorKey: "sale", header: "Venda", cell: ({ row }) => <span className="font-mono text-gray-300">#{row.original.sale.number}</span> },
    { accessorKey: "seller", header: "Vendedor", cell: ({ row }) => <div><p className="text-gray-200 text-sm">{row.original.seller.name}</p><p className="text-gray-500 text-xs">{row.original.seller.code}</p></div> },
    { accessorKey: "baseAmount", header: "Base", cell: ({ row }) => <span className="text-gray-400 text-sm">{formatCurrency(row.original.baseAmount)}</span> },
    { accessorKey: "amount", header: "Comissão", cell: ({ row }) => <span className="font-medium text-white">{formatCurrency(row.original.amount)}</span> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge className={`${commStatusColors[row.original.status] ?? ""} border-0 text-xs`}>{commStatusLabels[row.original.status] ?? row.original.status}</Badge> },
    { accessorKey: "createdAt", header: "Data", cell: ({ row }) => <span className="text-gray-500 text-sm">{formatDate(row.original.createdAt)}</span> },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-100">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
            {row.original.status === "PENDING" && (
              <DropdownMenuItem className="text-blue-400 focus:bg-gray-700 cursor-pointer"
                onClick={() => startTransition(async () => {
                  const response = await fetch(
                    `${financialBasePath}/commissions/${row.original.id}/approve`,
                    { method: "POST" }
                  );
                  const r = await response.json();
                  if (response.ok) { toast.success("Comissão aprovada"); fetchCm(cmPage); }
                  else toast.error(r.error ?? "Erro ao aprovar comissão");
                })}>
                <CheckCircle className="w-4 h-4 mr-2" /> Aprovar
              </DropdownMenuItem>
            )}
            {row.original.status === "APPROVED" && (
              <DropdownMenuItem className="text-green-400 focus:bg-gray-700 cursor-pointer"
                onClick={() => startTransition(async () => {
                  const response = await fetch(
                    `${financialBasePath}/commissions/${row.original.id}/pay`,
                    { method: "POST" }
                  );
                  const r = await response.json();
                  if (response.ok) { toast.success("Comissão paga!"); fetchCm(cmPage); }
                  else toast.error(r.error ?? "Erro ao pagar comissão");
                })}>
                <DollarSign className="w-4 h-4 mr-2" /> Registrar pagamento
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" className="h-8 border-zinc-800 bg-zinc-900 px-2.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
          <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
          {dashboardToolbar.lastMonth}
        </Button>
        <Button size="sm" variant="outline" className="h-8 border-zinc-800 bg-zinc-900 px-2.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
          {dashboardToolbar.day}
        </Button>
        <Button size="sm" variant="outline" className="h-8 border-zinc-800 bg-zinc-900 px-2.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
          <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
          {dashboardToolbar.filters}
        </Button>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Financeiro</h1>
          <p className="mt-1 text-xs text-zinc-500">Lançamentos e comissões</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="h-8 gap-2 bg-zinc-100 px-3 text-xs font-medium text-zinc-900 hover:bg-zinc-200">
          <Plus className="h-3.5 w-3.5" /> Novo lançamento
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {summaryCards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label} className="gap-2 border-zinc-800 bg-zinc-950 py-3">
              <CardContent className="px-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-zinc-500">{c.label}</p>
                    <p className="mt-1 text-lg font-semibold text-zinc-100">{c.value}</p>
                  </div>
                  <div className={`${c.bg} rounded-md p-2`}>
                    <Icon className={`h-4 w-4 ${c.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="transactions">
        <TabsList className="h-8 border border-zinc-800 bg-zinc-900">
          <TabsTrigger value="transactions" className="text-xs text-zinc-500 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">Lançamentos</TabsTrigger>
          <TabsTrigger value="commissions" className="text-xs text-zinc-500 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">Comissões</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-4">
          <DataTable columns={txColumns} data={transactions.data} total={transactions.total} page={txPage} perPage={transactions.perPage} onPageChange={fetchTx} loading={txLoading} />
        </TabsContent>

        <TabsContent value="commissions" className="mt-4">
          <DataTable columns={cmColumns} data={commissions.data} total={commissions.total} page={cmPage} perPage={commissions.perPage} onPageChange={fetchCm} loading={cmLoading} />
        </TabsContent>
      </Tabs>

      <TransactionFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        companyId={companyId}
        onSuccess={() => { setDialogOpen(false); fetchTx(1); toast.success("Lançamento criado!"); }}
      />
    </div>
  );
}
