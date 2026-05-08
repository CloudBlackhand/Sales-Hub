"use client";

import { useState, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Customer } from "@/lib/prisma-types";
import { CustomersListResponse } from "@/lib/dashboard/contracts";
import { Plus, MoreHorizontal, Pencil, Trash2, Mail, Phone, CalendarDays, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { CustomerFormDialog } from "@/components/forms/customer-form-dialog";
import { formatDate } from "@/lib/utils";
import { dashboardToolbar } from "@/lib/dashboard-ui-strings";

interface CustomersClientProps {
  companyId: string;
  companySlug: string;
  initialCustomers: CustomersListResponse;
}

export function CustomersClient({ companyId, companySlug, initialCustomers }: CustomersClientProps) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [page, setPage] = useState(initialCustomers.page);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const customersBasePath = `/api/dashboard/${companySlug}/customers`;

  const fetchCustomers = useCallback(async (p: number, s: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(p));
    if (s) params.set("search", s);
    const response = await fetch(`${customersBasePath}?${params.toString()}`, { method: "GET" });
    const r = await response.json();
    if (!response.ok) {
      toast.error(r.error ?? "Erro ao carregar clientes");
      setLoading(false);
      return;
    }
    setCustomers(r);
    setPage(p);
    setLoading(false);
  }, [customersBasePath]);

  async function handleDelete(id: string) {
    const response = await fetch(`${customersBasePath}/${id}`, { method: "DELETE" });
    const r = await response.json();
    if (response.ok) { toast.success("Cliente excluído"); fetchCustomers(page, search); }
    else toast.error(r.error ?? "Erro ao excluir cliente");
  }

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => <p className="text-gray-200 font-medium">{row.original.name}</p>,
    },
    {
      accessorKey: "email",
      header: "E-mail",
      cell: ({ row }) => row.original.email
        ? <div className="flex items-center gap-1.5 text-gray-400 text-sm"><Mail className="w-3 h-3" />{row.original.email}</div>
        : <span className="text-gray-600">—</span>,
    },
    {
      accessorKey: "phone",
      header: "Telefone",
      cell: ({ row }) => row.original.phone
        ? <div className="flex items-center gap-1.5 text-gray-400 text-sm"><Phone className="w-3 h-3" />{row.original.phone}</div>
        : <span className="text-gray-600">—</span>,
    },
    {
      accessorKey: "document",
      header: "CPF/CNPJ",
      cell: ({ row }) => <span className="text-gray-400 text-sm font-mono">{row.original.document ?? "—"}</span>,
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }) => (
        <div className="flex gap-1 flex-wrap">
          {(row.original.tags ?? []).slice(0, 3).map((tag) => (
            <Badge key={tag} className="bg-gray-700 text-gray-300 border-0 text-xs">{tag}</Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Cadastro",
      cell: ({ row }) => <span className="text-gray-500 text-sm">{formatDate(row.original.createdAt)}</span>,
    },
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
            <DropdownMenuItem className="text-gray-200 focus:bg-gray-700 cursor-pointer"
              onClick={() => { setEditCustomer(row.original); setDialogOpen(true); }}>
              <Pencil className="w-4 h-4 mr-2" /> Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem className="text-red-400 focus:bg-gray-700 cursor-pointer"
              onClick={() => handleDelete(row.original.id)}>
              <Trash2 className="w-4 h-4 mr-2" /> Excluir
            </DropdownMenuItem>
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
          <h1 className="text-lg font-semibold text-zinc-100">Clientes</h1>
          <p className="mt-1 text-xs text-zinc-500">{customers.total} registros</p>
        </div>
        <Button onClick={() => { setEditCustomer(null); setDialogOpen(true); }} className="h-8 gap-2 bg-zinc-100 px-3 text-xs font-medium text-zinc-900 hover:bg-zinc-200">
          <Plus className="h-3.5 w-3.5" /> Novo cliente
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={customers.data}
        total={customers.total}
        page={page}
        perPage={customers.perPage}
        onPageChange={(p) => fetchCustomers(p, search)}
        onSearch={(s) => { setSearch(s); fetchCustomers(1, s); }}
        searchPlaceholder="Buscar por nome, e-mail, CPF/CNPJ..."
        loading={loading}
      />

      <CustomerFormDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditCustomer(null); }}
        companyId={companyId}
        customer={editCustomer}
        onSuccess={() => { setDialogOpen(false); setEditCustomer(null); fetchCustomers(page, search); }}
      />
    </div>
  );
}
