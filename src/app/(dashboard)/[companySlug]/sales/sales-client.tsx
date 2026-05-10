"use client";

import { Suspense, useState, useTransition, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Seller, SaleStatus } from "@/lib/prisma-types";
import { SalesListItem, SalesListResponse } from "@/lib/dashboard/contracts";
import { Plus, MoreHorizontal, Eye, CheckCircle, XCircle, Truck, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { SaleFormDialog } from "@/components/forms/sale-form-dialog";

const statusColors: Record<string, string> = {
  DRAFT: "bg-zinc-800 text-zinc-300",
  CONFIRMED: "bg-zinc-700 text-zinc-200",
  IN_PROGRESS: "bg-zinc-700 text-zinc-200",
  DELIVERED: "bg-zinc-100 text-zinc-900",
  CANCELLED: "bg-zinc-800 text-zinc-400",
  RETURNED: "bg-zinc-800 text-zinc-300",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Rascunho",
  CONFIRMED: "Confirmada",
  IN_PROGRESS: "Em andamento",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelada",
  RETURNED: "Devolvida",
};

const typeLabels: Record<string, string> = {
  SALE: "Venda",
  RENTAL: "Aluguel",
  SERVICE: "Serviço",
};

interface SalesClientProps {
  companyId: string;
  companySlug: string;
  initialSales: SalesListResponse;
  sellers: Seller[];
  /** Muda quando o intervalo de datas na URL muda — força estado alinhado ao servidor */
  periodKey: string;
}

function SalesClientInner({ companyId, companySlug, initialSales, sellers }: SalesClientProps) {
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [sales, setSales] = useState(initialSales);
  const [page, setPage] = useState(initialSales.page);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const salesBasePath = `/api/dashboard/${companySlug}/sales`;

  const fetchSales = useCallback(
    async (p: number, s: string, status: string) => {
      setLoading(true);
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(p));
      if (s) params.set("search", s);
      else params.delete("search");
      if (status !== "ALL") params.set("status", status);
      else params.delete("status");
      const response = await fetch(`${salesBasePath}?${params.toString()}`, { method: "GET" });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error ?? "Erro ao carregar vendas");
        setLoading(false);
        return;
      }
      setSales(result as SalesListResponse);
      setPage(p);
      setLoading(false);
    },
    [salesBasePath, searchParams]
  );

  function handleSearch(value: string) {
    setSearch(value);
    fetchSales(1, value, statusFilter);
  }

  function handleStatusFilter(value: string) {
    setStatusFilter(value);
    fetchSales(1, search, value);
  }

  async function handleStatusChange(saleId: string, status: SaleStatus) {
    startTransition(async () => {
      const response = await fetch(`${salesBasePath}/${saleId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (response.ok) {
        toast.success("Status atualizado");
        fetchSales(page, search, statusFilter);
      } else {
        toast.error(result.error ?? "Erro ao atualizar status");
      }
    });
  }

  const columns: ColumnDef<SalesListItem>[] = [
    {
      accessorKey: "number",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" className="h-auto p-0 text-zinc-500 hover:text-zinc-100" onClick={() => column.toggleSorting()}>
          # <ArrowUpDown className="ml-1 w-3 h-3" />
        </Button>
      ),
      cell: ({ row }) => <span className="font-mono text-gray-300">#{row.original.number}</span>,
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => <span className="text-gray-400 text-sm">{typeLabels[row.original.type] ?? row.original.type}</span>,
    },
    {
      accessorKey: "seller",
      header: "Vendedor",
      cell: ({ row }) => (
        <div>
          <p className="text-gray-200 text-sm">{row.original.seller.name}</p>
          <p className="text-gray-500 text-xs">{row.original.seller.code}</p>
        </div>
      ),
    },
    {
      accessorKey: "customer",
      header: "Cliente",
      cell: ({ row }) => <span className="text-gray-300 text-sm">{row.original.customer?.name ?? <span className="text-gray-600">—</span>}</span>,
    },
    {
      accessorKey: "totalAmount",
      header: "Valor",
      cell: ({ row }) => <span className="font-medium text-white">{formatCurrency(row.original.totalAmount)}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge className={`${statusColors[row.original.status] ?? statusColors.DRAFT} border-0 text-xs`}>
          {statusLabels[row.original.status] ?? row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "saleDate",
      header: "Data",
      cell: ({ row }) => <span className="text-gray-400 text-sm">{formatDate(row.original.saleDate)}</span>,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-100">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-gray-400 text-xs">Ações</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem className="text-gray-200 focus:bg-gray-700 cursor-pointer">
                <Eye className="w-4 h-4 mr-2" /> Ver detalhes
              </DropdownMenuItem>
              {row.original.status === "DRAFT" && (
                <DropdownMenuItem
                  className="text-blue-400 focus:bg-gray-700 cursor-pointer"
                  onClick={() => handleStatusChange(row.original.id, SaleStatus.CONFIRMED)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Confirmar
                </DropdownMenuItem>
              )}
              {row.original.status === "CONFIRMED" && (
                <DropdownMenuItem
                  className="text-green-400 focus:bg-gray-700 cursor-pointer"
                  onClick={() => handleStatusChange(row.original.id, SaleStatus.DELIVERED)}
                >
                  <Truck className="w-4 h-4 mr-2" /> Marcar entregue
                </DropdownMenuItem>
              )}
              {["DRAFT", "CONFIRMED"].includes(row.original.status) && (
                <DropdownMenuItem
                  className="text-red-400 focus:bg-gray-700 cursor-pointer"
                  onClick={() => handleStatusChange(row.original.id, SaleStatus.CANCELLED)}
                >
                  <XCircle className="w-4 h-4 mr-2" /> Cancelar
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Vendas</h1>
          <p className="mt-1 text-xs text-zinc-500">{sales.total} registros</p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="h-8 gap-2 bg-zinc-100 px-3 text-xs font-medium text-zinc-900 hover:bg-zinc-200"
        >
          <Plus className="h-3.5 w-3.5" /> Nova venda
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={sales.data}
        total={sales.total}
        page={page}
        perPage={sales.perPage}
        onPageChange={(p) => fetchSales(p, search, statusFilter)}
        onSearch={handleSearch}
        searchPlaceholder="Buscar por #número, cliente, vendedor..."
        loading={loading}
        toolbar={
          <Select value={statusFilter} onValueChange={(v) => handleStatusFilter(v ?? "ALL")}>
            <SelectTrigger className="h-8 w-40 border-zinc-800 bg-zinc-900 text-xs text-zinc-300">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="border-zinc-800 bg-zinc-900">
              <SelectItem value="ALL" className="text-zinc-200 focus:bg-zinc-800">Todos</SelectItem>
              {Object.entries(statusLabels).map(([k, v]) => (
                <SelectItem key={k} value={k} className="text-zinc-200 focus:bg-zinc-800">{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <SaleFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        companyId={companyId}
        sellers={sellers}
        onSuccess={() => {
          setDialogOpen(false);
          fetchSales(1, search, statusFilter);
          toast.success("Venda criada com sucesso!");
        }}
      />
    </div>
  );
}

export function SalesClient(props: SalesClientProps) {
  return (
    <Suspense fallback={<div className="p-4 text-xs text-zinc-500">Carregando vendas…</div>}>
      <SalesClientInner key={props.periodKey} {...props} />
    </Suspense>
  );
}
