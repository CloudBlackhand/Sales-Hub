"use client";

import { useState, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Seller, CommissionType } from "@/lib/prisma-types";
import { getSellers, toggleSellerStatus } from "@/server/actions/sellers";
import { Plus, MoreHorizontal, Pencil, PowerOff } from "lucide-react";
import { toast } from "sonner";
import { SellerFormDialog } from "@/components/forms/seller-form-dialog";
import { formatCurrency } from "@/lib/utils";

const commissionLabels: Record<string, string> = {
  NONE: "Sem comissão",
  FIXED: "Fixo",
  PERCENTAGE: "Percentual",
  MIXED: "Misto",
};

const commissionColors: Record<string, string> = {
  NONE: "bg-zinc-800 text-zinc-400",
  FIXED: "bg-zinc-100 text-zinc-900",
  PERCENTAGE: "bg-zinc-700 text-zinc-200",
  MIXED: "bg-zinc-700 text-zinc-200",
};

interface SellersClientProps {
  companyId: string;
  companySlug: string;
  initialSellers: { data: Seller[]; total: number; page: number; perPage: number };
}

export function SellersClient({ companyId, initialSellers }: SellersClientProps) {
  const [sellers, setSellers] = useState(initialSellers);
  const [page, setPage] = useState(initialSellers.page);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editSeller, setEditSeller] = useState<Seller | null>(null);

  const fetch = useCallback(async (p: number, s: string) => {
    setLoading(true);
    const r = await getSellers(companyId, { page: p, search: s || undefined });
    setSellers(r);
    setPage(p);
    setLoading(false);
  }, [companyId]);

  async function handleToggle(id: string) {
    const r = await toggleSellerStatus(companyId, id);
    if (r.success) { toast.success("Status atualizado"); fetch(page, search); }
    else toast.error(r.error);
  }

  const columns: ColumnDef<Seller>[] = [
    {
      accessorKey: "code",
      header: "Código",
      cell: ({ row }) => <span className="font-mono text-gray-400 text-sm">{row.original.code}</span>,
    },
    {
      accessorKey: "name",
      header: "Vendedor",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-gray-200">{row.original.name}</p>
          {row.original.email && <p className="text-xs text-gray-500">{row.original.email}</p>}
        </div>
      ),
    },
    {
      accessorKey: "commissionType",
      header: "Tipo de comissão",
      cell: ({ row }) => (
        <Badge className={`${commissionColors[row.original.commissionType] ?? commissionColors.NONE} border-0 text-xs`}>
          {commissionLabels[row.original.commissionType] ?? row.original.commissionType}
        </Badge>
      ),
    },
    {
      accessorKey: "commissionValue",
      header: "Valor/Taxa",
      cell: ({ row }) => {
        const v = Number(row.original.commissionValue);
        if (v === 0 || row.original.commissionType === CommissionType.NONE) return <span className="text-gray-600">—</span>;
        if (row.original.commissionType === CommissionType.PERCENTAGE) return <span className="text-zinc-300">{v}%</span>;
        return <span className="text-zinc-100">{formatCurrency(v)}</span>;
      },
    },
    {
      accessorKey: "isActive",
      header: "Ativo",
      cell: ({ row }) => (
        <Switch
          checked={row.original.isActive}
          onCheckedChange={() => handleToggle(row.original.id)}
          className="data-[state=checked]:bg-zinc-200"
        />
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-100">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="border-gray-700 bg-gray-800">
            <DropdownMenuItem className="cursor-pointer text-gray-200 focus:bg-gray-700"
              onClick={() => { setEditSeller(row.original); setDialogOpen(true); }}>
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem className="cursor-pointer text-yellow-400 focus:bg-gray-700"
              onClick={() => handleToggle(row.original.id)}>
              <PowerOff className="mr-2 h-4 w-4" /> {row.original.isActive ? "Desativar" : "Ativar"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Vendedores</h1>
          <p className="mt-1 text-xs text-zinc-500">{sellers.total} registros</p>
        </div>
        <Button onClick={() => { setEditSeller(null); setDialogOpen(true); }} className="h-8 gap-2 bg-zinc-100 px-3 text-xs font-medium text-zinc-900 hover:bg-zinc-200">
          <Plus className="h-3.5 w-3.5" /> Novo vendedor
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={sellers.data}
        total={sellers.total}
        page={page}
        perPage={sellers.perPage}
        onPageChange={(p) => fetch(p, search)}
        onSearch={(s) => { setSearch(s); fetch(1, s); }}
        searchPlaceholder="Buscar por nome, código..."
        loading={loading}
      />

      <SellerFormDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditSeller(null); }}
        companyId={companyId}
        seller={editSeller}
        onSuccess={() => { setDialogOpen(false); setEditSeller(null); fetch(page, search); }}
      />
    </div>
  );
}
