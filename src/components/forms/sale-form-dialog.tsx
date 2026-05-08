"use client";

import { useState } from "react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saleSchema, type SaleInput } from "@/lib/schemas/sales";
import { createSale } from "@/server/actions/sales";
import { Seller, SaleType, SaleStatus } from "@/lib/prisma-types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface SaleFormDialogProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
  sellers: Seller[];
  onSuccess: () => void;
}

export function SaleFormDialog({ open, onClose, companyId, sellers, onSuccess }: SaleFormDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<SaleInput>({
    resolver: zodResolver(saleSchema) as Resolver<SaleInput>,
    defaultValues: {
      sellerId: "",
      customerId: null,
      type: SaleType.SALE,
      status: SaleStatus.DRAFT,
      discount: 0,
      notes: "",
      saleDate: new Date().toISOString().split("T")[0],
      items: [{ productId: null, description: "", quantity: 1, unitPrice: 0, discount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  const watchedItems = form.watch("items");
  const watchedDiscount = form.watch("discount") ?? 0;

  const subtotal = watchedItems.reduce((acc, item) => {
    return acc + (Number(item.quantity) * Number(item.unitPrice) - Number(item.discount ?? 0));
  }, 0);
  const total = subtotal - Number(watchedDiscount);

  async function onSubmit(values: SaleInput) {
    setLoading(true);
    const result = await createSale(companyId, values);
    if (result.success) {
      form.reset();
      onSuccess();
    } else {
      toast.error(result.error ?? "Erro ao criar venda");
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700 text-white p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-800">
          <DialogTitle className="text-white text-lg">Nova venda</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh]">
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-5 px-6 pb-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-gray-300">Vendedor *</Label>
                <Select
                  value={form.watch("sellerId")}
                  onValueChange={(v) => { if (v) form.setValue("sellerId", v); }}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-200 [&>span]:truncate">
                    <SelectValue placeholder="Selecionar vendedor" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {sellers.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="text-gray-200 focus:bg-gray-700">
                        {s.name} ({s.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.sellerId && (
                  <p className="text-red-400 text-xs">{form.formState.errors.sellerId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Tipo *</Label>
                <Select
                  value={form.watch("type")}
                  onValueChange={(v) => { if (v) form.setValue("type", v as SaleType); }}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-200 [&>span]:truncate">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="SALE" className="text-gray-200 focus:bg-gray-700">Venda</SelectItem>
                    <SelectItem value="RENTAL" className="text-gray-200 focus:bg-gray-700">Aluguel</SelectItem>
                    <SelectItem value="SERVICE" className="text-gray-200 focus:bg-gray-700">Serviço</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-gray-300">Data da venda *</Label>
                <Input
                  type="date"
                  className="bg-gray-800 border-gray-700 text-gray-200"
                  {...form.register("saleDate")}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Previsão de entrega</Label>
                <Input
                  type="date"
                  className="bg-gray-800 border-gray-700 text-gray-200"
                  {...form.register("expectedDelivery")}
                />
              </div>
            </div>

            <Separator className="bg-gray-800" />

            {/* Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-gray-300 text-base">Itens *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-blue-400 hover:text-blue-300 h-8 gap-1"
                  onClick={() => append({ productId: null, description: "", quantity: 1, unitPrice: 0, discount: 0 })}
                >
                  <Plus className="w-3 h-3" /> Adicionar item
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Descrição do item"
                        className="bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500"
                        {...form.register(`items.${index}.description`)}
                      />
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-red-400 hover:text-red-300 hover:bg-red-900/20 flex-shrink-0"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                      <Label className="text-gray-400 text-xs">Qtd</Label>
                      <Input
                        type="number"
                        step="0.001"
                        min="0.001"
                        className="bg-gray-800 border-gray-700 text-gray-200"
                        {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-gray-400 text-xs">Preço unit. (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        className="bg-gray-800 border-gray-700 text-gray-200"
                        {...form.register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-gray-400 text-xs">Desconto (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        className="bg-gray-800 border-gray-700 text-gray-200"
                        {...form.register(`items.${index}.discount`, { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 text-right">
                    Subtotal: <strong className="text-white">
                      {formatCurrency(Number(watchedItems[index]?.quantity ?? 0) * Number(watchedItems[index]?.unitPrice ?? 0) - Number(watchedItems[index]?.discount ?? 0))}
                    </strong>
                  </p>
                </div>
              ))}

              {form.formState.errors.items?.root && (
                <p className="text-red-400 text-xs">{form.formState.errors.items.root.message}</p>
              )}
            </div>

            <Separator className="bg-gray-800" />

            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-gray-300">Observações</Label>
                <Textarea
                  placeholder="Notas sobre a venda..."
                  className="bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500 resize-none"
                  rows={3}
                  {...form.register("notes")}
                />
              </div>
              <div className="space-y-3 bg-gray-800/50 rounded-lg p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-gray-200">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Label className="text-gray-400 text-sm whitespace-nowrap">Desconto geral (R$)</Label>
                    <Input
                    type="number"
                    step="0.01"
                    min="0"
                    className="bg-gray-800 border-gray-700 text-gray-200 h-8 text-sm"
                    {...form.register("discount", { valueAsNumber: true })}
                  />
                </div>
                <Separator className="bg-gray-700" />
                <div className="flex justify-between font-medium">
                  <span className="text-white">Total</span>
                  <span className="text-green-400 text-lg">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="flex-1 text-gray-400 hover:text-white hover:bg-gray-800"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Criar venda
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
