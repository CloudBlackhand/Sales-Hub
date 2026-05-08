"use client";

import { useState } from "react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saleSchema, type SaleInput } from "@/lib/schemas/sales";
import { createSale } from "@/server/actions/sales";
import { SaleType, SaleStatus } from "@/lib/prisma-types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { SaleFormDialogProps } from "./types";
import { SaleFormMainFields } from "./main-fields";
import { SaleFormLineItems } from "./line-items";
import { SaleFormNotesAndTotals } from "./notes-and-totals";
import { SaleFormActions } from "./form-actions";

/** Largura do popup: o Dialog base usa `sm:max-w-sm`; precisamos sobrescrever em todos os breakpoints `sm+`. */
const wideDialogClassName =
  "flex max-h-[90vh] w-full flex-col gap-0 overflow-hidden border-gray-700 bg-gray-900 p-0 text-white sm:max-w-[min(96vw,1080px)] md:max-w-[min(96vw,1080px)] lg:max-w-[min(96vw,1080px)] xl:max-w-[min(96vw,1080px)]";

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

  const fieldArray = useFieldArray({ control: form.control, name: "items" });
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
      <DialogContent className={wideDialogClassName} showCloseButton>
        <DialogHeader className="shrink-0 border-b border-gray-800 px-6 pt-6 pb-4">
          <DialogTitle className="text-lg text-white">Nova venda</DialogTitle>
        </DialogHeader>

        {/* Rolagem nativa: ScrollArea (Base UI) esconde a barra; precisamos da barra visível no tema global */}
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain [scrollbar-gutter:stable]">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-6 py-4 pb-6">
            <SaleFormMainFields form={form} sellers={sellers} />
            <Separator className="bg-gray-800" />
            <SaleFormLineItems form={form} fieldArray={fieldArray} watchedItems={watchedItems} />
            <Separator className="bg-gray-800" />
            <SaleFormNotesAndTotals form={form} subtotal={subtotal} total={total} />
            <SaleFormActions loading={loading} onCancel={onClose} />
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
