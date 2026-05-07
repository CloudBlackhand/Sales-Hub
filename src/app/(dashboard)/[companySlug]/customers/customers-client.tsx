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
import { Customer } from "@/generated/prisma";
import { getCustomers, deleteCustomer } from "@/server/actions/customers";
import { Plus, MoreHorizontal, Pencil, Trash2, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { CustomerFormDialog } from "@/components/forms/customer-form-dialog";
import { formatDate } from "@/lib/utils";

interface CustomersClientProps {
  companyId: string;
  initialCustomers: { data: Customer[]; total: number; page: number; perPage: number };
}

export function CustomersClient({ companyId, initialCustomers }: CustomersClientProps) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [page, setPage] = useState(initialCustomers.page);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);

  const fetch = useCallback(async (p: number, s: string) => {
    setLoading(true);
    const r = await getCustomers(companyId, { page: p, search: s || undefined });
    setCustomers(r);
    setPage(p);
    setLoading(false);
  }, [companyId]);

  async function handleDelete(id: string) {
    const r = await deleteCustomer(companyId, id);
    if (r.success) { toast.success("Cliente excluído"); fetch(page, search); }
    else toast.error(r.error);
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <p className="text-gray-400 text-sm mt-1">{customers.total} cliente{customers.total !== 1 ? "s" : ""} cadastrado{customers.total !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => { setEditCustomer(null); setDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Novo cliente
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={customers.data}
        total={customers.total}
        page={page}
        perPage={customers.perPage}
        onPageChange={(p) => fetch(p, search)}
        onSearch={(s) => { setSearch(s); fetch(1, s); }}
        searchPlaceholder="Buscar por nome, e-mail, CPF/CNPJ..."
        loading={loading}
      />

      <CustomerFormDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditCustomer(null); }}
        companyId={companyId}
        customer={editCustomer}
        onSuccess={() => { setDialogOpen(false); setEditCustomer(null); fetch(page, search); }}
      />
    </div>
  );
}
