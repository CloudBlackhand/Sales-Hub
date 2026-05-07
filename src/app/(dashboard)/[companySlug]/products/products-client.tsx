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
import { Product, ProductType } from "@/generated/prisma";
import { type ProductInput } from "@/lib/schemas/products";
import { getProducts, deleteProduct, updateProduct } from "@/server/actions/products";
import { Plus, MoreHorizontal, Pencil, Archive } from "lucide-react";
import { toast } from "sonner";
import { ProductFormDialog } from "@/components/forms/product-form-dialog";

const typeColors: Record<string, string> = {
  PRODUCT: "bg-blue-900 text-blue-300",
  SERVICE: "bg-purple-900 text-purple-300",
  RENTAL: "bg-orange-900 text-orange-300",
};

const typeLabels: Record<string, string> = {
  PRODUCT: "Produto",
  SERVICE: "Serviço",
  RENTAL: "Aluguel",
};

interface ProductsClientProps {
  companyId: string;
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
          <p className="text-gray-200 font-medium">{row.original.name}</p>
          {row.original.sku && <p className="text-gray-500 text-xs">SKU: {row.original.sku}</p>}
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
      cell: ({ row }) => <span className="text-white font-medium">{formatCurrency(Number(row.original.price))}</span>,
    },
    {
      accessorKey: "rentalPricePerDay",
      header: "Preço/dia",
      cell: ({ row }) => row.original.rentalPricePerDay
        ? <span className="text-orange-400">{formatCurrency(Number(row.original.rentalPricePerDay))}</span>
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
        <Switch checked={row.original.isActive} disabled className="data-[state=checked]:bg-blue-600" />
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
            <DropdownMenuItem
              className="text-gray-200 focus:bg-gray-700 cursor-pointer"
              onClick={() => { setEditProduct(row.original); setDialogOpen(true); }}
            >
              <Pencil className="w-4 h-4 mr-2" /> Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem
              className="text-red-400 focus:bg-gray-700 cursor-pointer"
              onClick={() => handleDelete(row.original.id)}
            >
              <Archive className="w-4 h-4 mr-2" /> Desativar
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
          <h1 className="text-2xl font-bold text-white">Produtos & Serviços</h1>
          <p className="text-gray-400 text-sm mt-1">{products.total} item{products.total !== 1 ? "s" : ""} no catálogo</p>
        </div>
        <Button
          onClick={() => { setEditProduct(null); setDialogOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" /> Novo item
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
            <SelectTrigger className="w-36 bg-gray-800 border-gray-700 text-gray-300">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="ALL" className="text-gray-200 focus:bg-gray-700">Todos</SelectItem>
              <SelectItem value="PRODUCT" className="text-gray-200 focus:bg-gray-700">Produtos</SelectItem>
              <SelectItem value="SERVICE" className="text-gray-200 focus:bg-gray-700">Serviços</SelectItem>
              <SelectItem value="RENTAL" className="text-gray-200 focus:bg-gray-700">Aluguéis</SelectItem>
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
