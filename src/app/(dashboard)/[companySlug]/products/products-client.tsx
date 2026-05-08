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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { dashboardToolbar } from "@/lib/dashboard-ui-strings";
import { Product } from "@/lib/prisma-types";
import { getProducts, deleteProduct } from "@/server/actions/products";
import { Plus, MoreHorizontal, Pencil, Archive, CalendarDays, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { ProductFormDialog } from "@/components/forms/product-form-dialog";

const typeColors: Record<string, string> = {
  PRODUCT: "bg-zinc-100 text-zinc-900",
  SERVICE: "bg-zinc-700 text-zinc-200",
  RENTAL: "bg-zinc-800 text-zinc-300",
};

const typeLabels: Record<string, string> = {
  PRODUCT: "Produto",
  SERVICE: "Serviço",
  RENTAL: "Aluguel",
};

interface ProductsClientProps {
  companyId: string;
  companySlug: string;
  initialProducts: { data: Product[]; total: number; page: number; perPage: number };
}

export function ProductsClient({ companyId, initialProducts }: ProductsClientProps) {
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(initialProducts.page);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const fetchProducts = useCallback(async (p: number, s: string, type: string) => {
    setLoading(true);
    const result = await getProducts(companyId, {
      page: p,
      search: s || undefined,
      type: (type !== "ALL" ? type : undefined) as never,
    });
    setProducts(result);
    setPage(p);
    setLoading(false);
  }, [companyId]);

  async function handleDelete(productId: string) {
    const result = await deleteProduct(companyId, productId);
    if (result.success) {
      toast.success("Produto desativado");
      fetchProducts(page, search, typeFilter);
    } else {
      toast.error(result.error);
    }
  }

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-gray-200">{row.original.name}</p>
          {row.original.sku && <p className="text-xs text-gray-500">SKU: {row.original.sku}</p>}
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge className={`${typeColors[row.original.type] ?? typeColors.PRODUCT} border-0 text-xs`}>
          {typeLabels[row.original.type] ?? row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: "price",
      header: "Preço",
      cell: ({ row }) => <span className="font-medium text-white">{formatCurrency(Number(row.original.price))}</span>,
    },
    {
      accessorKey: "rentalPricePerDay",
      header: "Preço/dia",
      cell: ({ row }) => row.original.rentalPricePerDay
        ? <span className="text-zinc-300">{formatCurrency(Number(row.original.rentalPricePerDay))}</span>
        : <span className="text-gray-600">—</span>,
    },
    {
      accessorKey: "stock",
      header: "Estoque",
      cell: ({ row }) => row.original.stock != null
        ? <span className="text-gray-300">{row.original.stock} {row.original.unit ?? "un"}</span>
        : <span className="text-gray-600">—</span>,
    },
    {
      accessorKey: "isActive",
      header: "Ativo",
      cell: ({ row }) => (
        <Switch checked={row.original.isActive} disabled className="data-[state=checked]:bg-zinc-200" />
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
            <DropdownMenuItem
              className="cursor-pointer text-gray-200 focus:bg-gray-700"
              onClick={() => { setEditProduct(row.original); setDialogOpen(true); }}
            >
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem
              className="cursor-pointer text-red-400 focus:bg-gray-700"
              onClick={() => handleDelete(row.original.id)}
            >
              <Archive className="mr-2 h-4 w-4" /> Desativar
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
          <h1 className="text-lg font-semibold text-zinc-100">Produtos</h1>
          <p className="mt-1 text-xs text-zinc-500">{products.total} produtos</p>
        </div>
        <Button
          onClick={() => { setEditProduct(null); setDialogOpen(true); }}
          className="h-8 gap-2 bg-zinc-100 px-3 text-xs font-medium text-zinc-900 hover:bg-zinc-200"
        >
          <Plus className="h-3.5 w-3.5" /> Novo produto
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={products.data}
        total={products.total}
        page={page}
        perPage={products.perPage}
        onPageChange={(p) => fetchProducts(p, search, typeFilter)}
        onSearch={(s) => { setSearch(s); fetchProducts(1, s, typeFilter); }}
        searchPlaceholder="Buscar por nome ou SKU..."
        loading={loading}
        toolbar={
          <Select value={typeFilter} onValueChange={(v) => { const val = v ?? "ALL"; setTypeFilter(val); fetchProducts(1, search, val); }}>
            <SelectTrigger className="h-8 w-36 border-zinc-800 bg-zinc-900 text-xs text-zinc-300">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent className="border-zinc-800 bg-zinc-900">
              <SelectItem value="ALL" className="text-zinc-200 focus:bg-zinc-800">Todos</SelectItem>
              <SelectItem value="PRODUCT" className="text-zinc-200 focus:bg-zinc-800">Produtos</SelectItem>
              <SelectItem value="SERVICE" className="text-zinc-200 focus:bg-zinc-800">Serviços</SelectItem>
              <SelectItem value="RENTAL" className="text-zinc-200 focus:bg-zinc-800">Aluguéis</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <ProductFormDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditProduct(null); }}
        companyId={companyId}
        product={editProduct}
        onSuccess={() => {
          setDialogOpen(false);
          setEditProduct(null);
          fetchProducts(page, search, typeFilter);
        }}
      />
    </div>
  );
}
