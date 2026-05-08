"use client";

import type { UseFormReturn } from "react-hook-form";
import type { SaleInput } from "@/lib/schemas/sales";
import type { Seller } from "@/lib/prisma-types";
import { SaleType } from "@/lib/prisma-types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SaleFormMainFieldsProps {
  form: UseFormReturn<SaleInput>;
  sellers: Seller[];
}

export function SaleFormMainFields({ form, sellers }: SaleFormMainFieldsProps) {
  const sellerId = form.watch("sellerId");
  const type = form.watch("type");

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-2 lg:col-span-2">
        <Label className="text-gray-300">Vendedor *</Label>
        <Select
          value={sellerId}
          onValueChange={(v) => {
            if (v) form.setValue("sellerId", v);
          }}
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
          <p className="text-xs text-red-400">{form.formState.errors.sellerId.message}</p>
        )}
      </div>

      <div className="space-y-2 lg:col-span-2">
        <Label className="text-gray-300">Tipo *</Label>
        <Select
          value={type}
          onValueChange={(v) => {
            if (v) form.setValue("type", v as SaleType);
          }}
        >
          <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-200 [&>span]:truncate">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="SALE" className="text-gray-200 focus:bg-gray-700">
              Venda
            </SelectItem>
            <SelectItem value="RENTAL" className="text-gray-200 focus:bg-gray-700">
              Aluguel
            </SelectItem>
            <SelectItem value="SERVICE" className="text-gray-200 focus:bg-gray-700">
              Serviço
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-300">Data da venda *</Label>
        <Input
          type="date"
          className="border-gray-700 bg-gray-800 text-gray-200"
          {...form.register("saleDate")}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-gray-300">Previsão de entrega</Label>
        <Input
          type="date"
          className="border-gray-700 bg-gray-800 text-gray-200"
          {...form.register("expectedDelivery")}
        />
      </div>
    </div>
  );
}
