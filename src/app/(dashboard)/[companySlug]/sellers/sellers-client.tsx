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
import { Seller, CommissionType } from "@/generated/prisma";
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
  NONE: "bg-gray-700 text-gray-400",
  FIXED: "bg-green-900 text-green-300",
  PERCENTAGE: "bg-blue-900 text-blue-300",
  MIXED: "bg-purple-900 text-purple-300",
};

interface SellersClientProps {
  companyId: string;
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
          <p className="text-gray-200 font-medium">{row.original.name}</p>
          {row.original.email && <p className="text-gray-500 text-xs">{row.original.email}</p>}
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
        if (row.original.commissionType === CommissionType.PERCENTAGE) return <span className="text-blue-400">{v}%</span>;
        return <span className="text-green-400">{formatCurrency(v)}</span>;
      },
    },
    {
      accessorKey: "isActive",
      header: "Ativo",
      cell: ({ row }) => (
        <Switch
          checked={row.original.isActive}
          onCheckedChange={() => handleToggle(row.original.id)}
          className="data-[state=checked]:bg-blue-600"
        />
      ),
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
              onClick={() => { setEditSeller(row.original); setDialogOpen(true); }}>
              <Pencil className="w-4 h-4 mr-2" /> Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem className="text-yellow-400 focus:bg-gray-700 cursor-pointer"
              onClick={() => handleToggle(row.original.id)}>
              <PowerOff className="w-4 h-4 mr-2" /> {row.original.isActive ? "Desativar" : "Ativar"}
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
          <h1 className="text-2xl font-bold text-white">Vendedores</h1>
          <p className="text-gray-400 text-sm mt-1">{sellers.total} vendedor{sellers.total !== 1 ? "es" : ""} cadastrado{sellers.total !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => { setEditSeller(null); setDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Novo vendedor
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
