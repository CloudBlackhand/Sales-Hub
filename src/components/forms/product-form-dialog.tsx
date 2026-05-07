"use client";

import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductInput } from "@/lib/schemas/products";
import { createProduct, updateProduct } from "@/server/actions/products";
import { Product, ProductType } from "@/generated/prisma";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
  product: Product | null;
  onSuccess: () => void;
}

export function ProductFormDialog({ open, onClose, companyId, product, onSuccess }: ProductFormDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema) as Resolver<ProductInput>,
    defaultValues: {
      name: "", sku: "", description: "",
      type: ProductType.PRODUCT,
      price: 0, rentalPricePerDay: null,
      unit: "", stock: null, isActive: true,
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        sku: product.sku ?? "",
        description: product.description ?? "",
        type: product.type,
        price: Number(product.price),
        rentalPricePerDay: product.rentalPricePerDay ? Number(product.rentalPricePerDay) : null,
        unit: product.unit ?? "",
        stock: product.stock,
        isActive: product.isActive,
      });
    } else {
      form.reset({ name: "", sku: "", description: "", type: ProductType.PRODUCT, price: 0, rentalPricePerDay: null, unit: "", stock: null, isActive: true });
    }
  }, [product, form]);

  const watchedType = form.watch("type");

  async function onSubmit(values: ProductInput) {
    setLoading(true);
    const result = product
      ? await updateProduct(companyId, product.id, values)
      : await createProduct(companyId, values);

    if (result.success) {
      toast.success(product ? "Produto atualizado" : "Produto criado");
      onSuccess();
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">{product ? "Editar produto" : "Novo produto"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label className="text-gray-300">Nome *</Label>
              <Input className="bg-gray-800 border-gray-700 text-gray-200" {...form.register("name")} />
              {form.formState.errors.name && <p className="text-red-400 text-xs">{form.formState.errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Tipo *</Label>
              <Select value={form.watch("type")} onValueChange={(v) => { if (v) form.setValue("type", v as ProductType); }}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="PRODUCT" className="text-gray-200 focus:bg-gray-700">Produto</SelectItem>
                  <SelectItem value="SERVICE" className="text-gray-200 focus:bg-gray-700">Serviço</SelectItem>
                  <SelectItem value="RENTAL" className="text-gray-200 focus:bg-gray-700">Aluguel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">SKU</Label>
              <Input className="bg-gray-800 border-gray-700 text-gray-200" placeholder="ABC-001" {...form.register("sku")} />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Preço (R$) *</Label>
              <Input type="number" step="0.01" min="0" className="bg-gray-800 border-gray-700 text-gray-200" {...form.register("price", { valueAsNumber: true })} />
            </div>

            {watchedType === "RENTAL" && (
              <div className="space-y-2">
                <Label className="text-gray-300">Preço por dia (R$)</Label>
                <Input type="number" step="0.01" min="0" className="bg-gray-800 border-gray-700 text-gray-200" {...form.register("rentalPricePerDay", { valueAsNumber: true })} />
              </div>
            )}

            {watchedType === "PRODUCT" && (
              <>
                <div className="space-y-2">
                  <Label className="text-gray-300">Estoque</Label>
                  <Input type="number" min="0" className="bg-gray-800 border-gray-700 text-gray-200" {...form.register("stock", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Unidade</Label>
                  <Input className="bg-gray-800 border-gray-700 text-gray-200" placeholder="un, kg, m²..." {...form.register("unit")} />
                </div>
              </>
            )}

            <div className="space-y-2 col-span-2">
              <Label className="text-gray-300">Descrição</Label>
              <Textarea className="bg-gray-800 border-gray-700 text-gray-200 resize-none" rows={3} {...form.register("description")} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1 text-gray-400 hover:text-white hover:bg-gray-800" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {product ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
