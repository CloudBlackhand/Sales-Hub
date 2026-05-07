"use client";

import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sellerSchema, type SellerInput } from "@/lib/schemas/sellers";
import { createSeller, updateSeller } from "@/server/actions/sellers";
import { Seller, CommissionType } from "@/lib/prisma-types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Info } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  companyId: string;
  seller: Seller | null;
  onSuccess: () => void;
}

export function SellerFormDialog({ open, onClose, companyId, seller, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const form = useForm<SellerInput>({
    resolver: zodResolver(sellerSchema) as Resolver<SellerInput>,
    defaultValues: {
      code: "", name: "", email: "", phone: "",
      commissionType: CommissionType.NONE,
      commissionValue: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (seller) {
      form.reset({
        code: seller.code,
        name: seller.name,
        email: seller.email ?? "",
        phone: seller.phone ?? "",
        commissionType: seller.commissionType,
        commissionValue: Number(seller.commissionValue),
        isActive: seller.isActive,
      });
    } else {
      form.reset({ code: "", name: "", email: "", phone: "", commissionType: CommissionType.NONE, commissionValue: 0, isActive: true });
    }
  }, [seller, form]);

  const watchedType = form.watch("commissionType");

  async function onSubmit(values: SellerInput) {
    setLoading(true);
    const result = seller
      ? await updateSeller(companyId, seller.id, values)
      : await createSeller(companyId, values);
    if (result.success) {
      toast.success(seller ? "Vendedor atualizado" : "Vendedor criado");
      onSuccess();
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  }

  const commissionHint: Record<CommissionType, string> = {
    [CommissionType.NONE]: "Sem cálculo de comissão",
    [CommissionType.FIXED]: "Valor fixo pago por cada venda concluída",
    [CommissionType.PERCENTAGE]: "Percentual sobre o valor total da venda",
    [CommissionType.MIXED]: "Valor fixo + metade do percentual aplicado ao total",
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">{seller ? "Editar vendedor" : "Novo vendedor"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Código *</Label>
              <Input className="bg-gray-800 border-gray-700 text-gray-200 font-mono" placeholder="V0001" {...form.register("code")} />
              {form.formState.errors.code && <p className="text-red-400 text-xs">{form.formState.errors.code.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Nome *</Label>
              <Input className="bg-gray-800 border-gray-700 text-gray-200" {...form.register("name")} />
              {form.formState.errors.name && <p className="text-red-400 text-xs">{form.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">E-mail</Label>
              <Input type="email" className="bg-gray-800 border-gray-700 text-gray-200" {...form.register("email")} />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Telefone</Label>
              <Input className="bg-gray-800 border-gray-700 text-gray-200" {...form.register("phone")} />
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
            <Label className="text-gray-200 text-sm font-medium">Configuração de comissão</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-400 text-xs">Tipo</Label>
                <Select
                  value={form.watch("commissionType")}
                  onValueChange={(v) => { if (v) form.setValue("commissionType", v as CommissionType); }}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="NONE" className="text-gray-200 focus:bg-gray-700">Sem comissão</SelectItem>
                    <SelectItem value="FIXED" className="text-gray-200 focus:bg-gray-700">Valor fixo (R$)</SelectItem>
                    <SelectItem value="PERCENTAGE" className="text-gray-200 focus:bg-gray-700">Percentual (%)</SelectItem>
                    <SelectItem value="MIXED" className="text-gray-200 focus:bg-gray-700">Misto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {watchedType !== CommissionType.NONE && (
                <div className="space-y-2">
                  <Label className="text-gray-400 text-xs">
                    {watchedType === CommissionType.PERCENTAGE ? "Taxa (%)" : "Valor (R$)"}
                  </Label>
                  <Input
                    type="number"
                    step={watchedType === CommissionType.PERCENTAGE ? "0.01" : "0.01"}
                    min="0"
                    className="bg-gray-800 border-gray-700 text-gray-200"
                    {...form.register("commissionValue", { valueAsNumber: true })}
                  />
                </div>
              )}
            </div>

            <div className="flex items-start gap-2 text-xs text-gray-500">
              <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>{commissionHint[watchedType]}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Data de contratação</Label>
            <Input type="date" className="bg-gray-800 border-gray-700 text-gray-200" {...form.register("hiredAt")} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1 text-gray-400 hover:text-white hover:bg-gray-800" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {seller ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
