"use client";

import type { UseFormReturn, UseFieldArrayReturn } from "react-hook-form";
import type { SaleInput } from "@/lib/schemas/sales";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SaleFormLineItemsProps {
  form: UseFormReturn<SaleInput>;
  fieldArray: Pick<UseFieldArrayReturn<SaleInput, "items">, "fields" | "append" | "remove">;
  watchedItems: NonNullable<SaleInput["items"]>;
}

export function SaleFormLineItems({ form, fieldArray, watchedItems }: SaleFormLineItemsProps) {
  const { fields, append, remove } = fieldArray;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-base text-gray-300">Itens *</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1 text-blue-400 hover:text-blue-300"
          onClick={() =>
            append({ productId: null, description: "", quantity: 1, unitPrice: 0, discount: 0 })
          }
        >
          <Plus className="h-3 w-3" /> Adicionar item
        </Button>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="space-y-3 rounded-lg bg-gray-800/50 p-3.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1 space-y-2">
              <Input
                placeholder="Descrição do item"
                className="border-gray-700 bg-gray-800 text-gray-200 placeholder:text-gray-500"
                {...form.register(`items.${index}.description`)}
              />
            </div>
            {fields.length > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-red-400 hover:bg-red-900/20 hover:text-red-300"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-xs text-gray-400">Qtd</Label>
              <Input
                type="number"
                step="0.001"
                min="0.001"
                className="border-gray-700 bg-gray-800 text-gray-200"
                {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-400">Preço unit. (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                className="border-gray-700 bg-gray-800 text-gray-200"
                {...form.register(`items.${index}.unitPrice`, { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-400">Desconto (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                className="border-gray-700 bg-gray-800 text-gray-200"
                {...form.register(`items.${index}.discount`, { valueAsNumber: true })}
              />
            </div>
          </div>
          <p className="text-right text-xs text-gray-400">
            Subtotal:{" "}
            <strong className="text-white">
              {formatCurrency(
                Number(watchedItems[index]?.quantity ?? 0) * Number(watchedItems[index]?.unitPrice ?? 0) -
                  Number(watchedItems[index]?.discount ?? 0)
              )}
            </strong>
          </p>
        </div>
      ))}

      {form.formState.errors.items?.root ? (
        <p className="text-xs text-red-400">{form.formState.errors.items.root.message}</p>
      ) : null}
    </div>
  );
}
