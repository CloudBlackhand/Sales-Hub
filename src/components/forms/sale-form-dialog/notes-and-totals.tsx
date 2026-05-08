"use client";

import type { UseFormReturn } from "react-hook-form";
import type { SaleInput } from "@/lib/schemas/sales";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";

interface SaleFormNotesAndTotalsProps {
  form: UseFormReturn<SaleInput>;
  subtotal: number;
  total: number;
}

export function SaleFormNotesAndTotals({ form, subtotal, total }: SaleFormNotesAndTotalsProps) {
  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
      <div className="space-y-2 lg:col-span-5">
        <Label className="text-gray-300">Observações</Label>
        <Textarea
          placeholder="Notas sobre a venda..."
          className="min-h-[100px] resize-y border-gray-700 bg-gray-800 text-gray-200 placeholder:text-gray-500"
          rows={4}
          {...form.register("notes")}
        />
      </div>
      <div className="space-y-3 rounded-lg bg-gray-800/50 p-4 lg:col-span-7">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Subtotal</span>
          <span className="text-gray-200">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Label className="shrink-0 text-sm whitespace-nowrap text-gray-400">Desconto geral (R$)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            className="h-9 border-gray-700 bg-gray-800 text-sm text-gray-200 sm:max-w-[200px]"
            {...form.register("discount", { valueAsNumber: true })}
          />
        </div>
        <Separator className="bg-gray-700" />
        <div className="flex justify-between font-medium">
          <span className="text-white">Total</span>
          <span className="text-lg text-green-400">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
