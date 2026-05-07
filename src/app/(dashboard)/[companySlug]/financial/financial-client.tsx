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
import { Seller, TransactionType, FinancialTransaction } from "@/lib/prisma-types";
import { getTransactions, getCommissions, createTransaction, approveCommission, payCommission } from "@/server/actions/financial";
import { Plus, MoreHorizontal, CheckCircle, DollarSign, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TransactionFormDialog } from "@/components/forms/transaction-form-dialog";

type CommissionRow = {
  id: string;
  baseAmount: unknown;
  rate: unknown;
  amount: unknown;
  type: string;
  status: string;
  createdAt: Date;
  paidAt: Date | null;
  seller: { id: string; name: string; code: string };
  sale: { id: string; number: number; saleDate: Date };
};

const commStatusColors: Record<string, string> = {
  PENDING: "bg-yellow-900 text-yellow-300",
  APPROVED: "bg-blue-900 text-blue-300",
  PAID: "bg-green-900 text-green-300",
  CANCELLED: "bg-gray-700 text-gray-400",
};

const commStatusLabels: Record<string, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovada",
  PAID: "Paga",
  CANCELLED: "Cancelada",
};

const txTypeColors: Record<string, string> = {
  INCOME: "bg-green-900 text-green-300",
  EXPENSE: "bg-red-900 text-red-300",
  COMMISSION_PAYMENT: "bg-purple-900 text-purple-300",
};

const txTypeLabels: Record<string, string> = {
  INCOME: "Receita",
  EXPENSE: "Despesa",
  COMMISSION_PAYMENT: "Pag. Comissão",
};

interface Props {
  companyId: string;
  initialTransactions: { data: FinancialTransaction[]; total: number; page: number; perPage: number };
  initialCommissions: { data: CommissionRow[]; total: number; page: number; perPage: number };
  summary: { totalIncome: number; totalExpense: number; balance: number; commissionsPaid: number; commissionsPending: number };
  sellers: Seller[];
}

export function FinancialClient({ companyId, initialTransactions, initialCommissions, summary, sellers }: Props) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [commissions, setCommissions] = useState(initialCommissions);
  const [txPage, setTxPage] = useState(1);
  const [cmPage, setCmPage] = useState(1);
  const [txLoading, setTxLoading] = useState(false);
  const [cmLoading, setCmLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const fetchTx = useCallback(async (p: number) => {
    setTxLoading(true);
    const r = await getTransactions(companyId, { page: p });
    setTransactions(r);
    setTxPage(p);
    setTxLoading(false);
  }, [companyId]);

  const fetchCm = useCallback(async (p: number) => {
    setCmLoading(true);
    const r = await getCommissions(companyId, { page: p });
    setCommissions(r as never);
    setCmPage(p);
    setCmLoading(false);
  }, [companyId]);

  const summaryCards = [
    { label: "Receita total", value: formatCurrency(summary.totalIncome), icon: TrendingUp, color: "text-green-400", bg: "bg-green-900/20" },
    { label: "Despesas", value: formatCurrency(summary.totalExpense), icon: TrendingDown, color: "text-red-400", bg: "bg-red-900/20" },
    { label: "Saldo", value: formatCurrency(summary.balance), icon: DollarSign, color: summary.balance >= 0 ? "text-blue-400" : "text-red-400", bg: "bg-blue-900/20" },
    { label: "Comissões pendentes", value: formatCurrency(summary.commissionsPending), icon: AlertCircle, color: "text-yellow-400", bg: "bg-yellow-900/20" },
  ];

  const txColumns: ColumnDef<FinancialTransaction>[] = [
    { accessorKey: "date", header: "Data", cell: ({ row }) => <span className="text-gray-400 text-sm">{formatDate(row.original.date)}</span> },
    { accessorKey: "type", header: "Tipo", cell: ({ row }) => <Badge className={`${txTypeColors[row.original.type] ?? ""} border-0 text-xs`}>{txTypeLabels[row.original.type] ?? row.original.type}</Badge> },
    { accessorKey: "category", header: "Categoria", cell: ({ row }) => <span className="text-gray-400 text-sm">{row.original.category ?? "—"}</span> },
    { accessorKey: "description", header: "Descrição", cell: ({ row }) => <span className="text-gray-200 text-sm">{row.original.description ?? "—"}</span> },
    { accessorKey: "amount", header: "Valor", cell: ({ row }) => <span className={`font-medium ${row.original.type === "INCOME" ? "text-green-400" : "text-red-400"}`}>{formatCurrency(Number(row.original.amount))}</span> },
  ];

  const cmColumns: ColumnDef<CommissionRow>[] = [
    { accessorKey: "sale", header: "Venda", cell: ({ row }) => <span className="font-mono text-gray-300">#{row.original.sale.number}</span> },
    { accessorKey: "seller", header: "Vendedor", cell: ({ row }) => <div><p className="text-gray-200 text-sm">{row.original.seller.name}</p><p className="text-gray-500 text-xs">{row.original.seller.code}</p></div> },
    { accessorKey: "baseAmount", header: "Base", cell: ({ row }) => <span className="text-gray-400 text-sm">{formatCurrency(Number(row.original.baseAmount))}</span> },
    { accessorKey: "amount", header: "Comissão", cell: ({ row }) => <span className="font-medium text-white">{formatCurrency(Number(row.original.amount))}</span> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge className={`${commStatusColors[row.original.status] ?? ""} border-0 text-xs`}>{commStatusLabels[row.original.status] ?? row.original.status}</Badge> },
    { accessorKey: "createdAt", header: "Data", cell: ({ row }) => <span className="text-gray-500 text-sm">{formatDate(row.original.createdAt)}</span> },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
            {row.original.status === "PENDING" && (
              <DropdownMenuItem className="text-blue-400 focus:bg-gray-700 cursor-pointer"
                onClick={() => startTransition(async () => { const r = await approveCommission(companyId, row.original.id); if (r.success) { toast.success("Comissão aprovada"); fetchCm(cmPage); } else toast.error(r.error); })}>
                <CheckCircle className="w-4 h-4 mr-2" /> Aprovar
              </DropdownMenuItem>
            )}
            {row.original.status === "APPROVED" && (
              <DropdownMenuItem className="text-green-400 focus:bg-gray-700 cursor-pointer"
                onClick={() => startTransition(async () => { const r = await payCommission(companyId, row.original.id); if (r.success) { toast.success("Comissão paga!"); fetchCm(cmPage); } else toast.error(r.error); })}>
                <DollarSign className="w-4 h-4 mr-2" /> Registrar pagamento
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Financeiro</h1>
          <p className="text-gray-400 text-sm mt-1">Lançamentos, comissões e extrato</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Novo lançamento
        </Button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label} className="bg-gray-900 border-gray-800">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{c.label}</p>
                    <p className="text-xl font-bold text-white mt-1">{c.value}</p>
                  </div>
                  <div className={`${c.bg} rounded-lg p-2.5`}>
                    <Icon className={`w-5 h-5 ${c.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="transactions">
        <TabsList className="bg-gray-800 border border-gray-700">
          <TabsTrigger value="transactions" className="data-[state=active]:bg-gray-700 text-gray-400 data-[state=active]:text-white">Lançamentos</TabsTrigger>
          <TabsTrigger value="commissions" className="data-[state=active]:bg-gray-700 text-gray-400 data-[state=active]:text-white">Comissões</TabsTrigger>
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
