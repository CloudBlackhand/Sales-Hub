"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema, type TransactionInput } from "@/lib/schemas/financial";
import { createTransaction } from "@/server/actions/financial";
import { TransactionType } from "@/generated/prisma";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  companyId: string;
  onSuccess: () => void;
}

export function TransactionFormDialog({ open, onClose, companyId, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const form = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema) as Resolver<TransactionInput>,
    defaultValues: { type: TransactionType.INCOME, category: "", amount: 0, description: "", date: new Date().toISOString().split("T")[0] },
  });

  async function onSubmit(values: TransactionInput) {
    setLoading(true);
    const r = await createTransaction(companyId, values);
    if (r.success) { onSuccess(); form.reset(); }
    else toast.error(r.error);
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Novo lançamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Tipo *</Label>
              <Select value={form.watch("type")} onValueChange={(v) => { if (v) form.setValue("type", v as TransactionType); }}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-200"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="INCOME" className="text-gray-200 focus:bg-gray-700">Receita</SelectItem>
                  <SelectItem value="EXPENSE" className="text-gray-200 focus:bg-gray-700">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Data *</Label>
              <Input type="date" className="bg-gray-800 border-gray-700 text-gray-200" {...form.register("date")} />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Categoria</Label>
              <Input className="bg-gray-800 border-gray-700 text-gray-200" placeholder="Ex: Marketing" {...form.register("category")} />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Valor (R$) *</Label>
              <Input type="number" step="0.01" min="0.01" className="bg-gray-800 border-gray-700 text-gray-200" {...form.register("amount", { valueAsNumber: true })} />
              {form.formState.errors.amount && <p className="text-red-400 text-xs">{form.formState.errors.amount.message}</p>}
            </div>
            <div className="space-y-2 col-span-2">
              <Label className="text-gray-300">Descrição</Label>
              <Textarea className="bg-gray-800 border-gray-700 text-gray-200 resize-none" rows={2} {...form.register("description")} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1 text-gray-400 hover:text-white hover:bg-gray-800" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Criar lançamento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
