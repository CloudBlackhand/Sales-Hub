"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postSaleSchema, type PostSaleInput } from "@/lib/schemas/post-sale";
import { createPostSaleActivity } from "@/server/actions/post-sale";
import { Seller, PostSaleType, ActivityStatus } from "@/lib/prisma-types";
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
  sellers: Seller[];
  onSuccess: () => void;
}

export function PostSaleFormDialog({ open, onClose, companyId, sellers, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const form = useForm<PostSaleInput>({
    resolver: zodResolver(postSaleSchema) as Resolver<PostSaleInput>,
    defaultValues: {
      saleId: "",
      type: PostSaleType.FOLLOWUP,
      status: ActivityStatus.OPEN,
      title: "",
      notes: "",
      scheduledAt: null,
      assignedToSellerId: null,
    },
  });

  async function onSubmit(values: PostSaleInput) {
    setLoading(true);
    const r = await createPostSaleActivity(companyId, values);
    if (r.success) { onSuccess(); form.reset(); }
    else { toast.error(r.error); }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Nova atividade de pós-venda</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label className="text-gray-300">ID da venda *</Label>
              <Input className="bg-gray-800 border-gray-700 text-gray-200 font-mono" placeholder="ID da venda" {...form.register("saleId")} />
              {form.formState.errors.saleId && <p className="text-red-400 text-xs">{form.formState.errors.saleId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Tipo</Label>
              <Select value={form.watch("type")} onValueChange={(v) => { if (v) form.setValue("type", v as PostSaleType); }}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-200"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {["FOLLOWUP", "COMPLAINT", "RETURN", "FEEDBACK", "DELIVERY", "SUPPORT"].map((t) => (
                    <SelectItem key={t} value={t} className="text-gray-200 focus:bg-gray-700">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Responsável</Label>
              <Select onValueChange={(v) => form.setValue("assignedToSellerId", typeof v === "string" ? v : null)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-200"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {sellers.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="text-gray-200 focus:bg-gray-700">{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label className="text-gray-300">Título</Label>
              <Input className="bg-gray-800 border-gray-700 text-gray-200" {...form.register("title")} />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Agendamento</Label>
              <Input type="datetime-local" className="bg-gray-800 border-gray-700 text-gray-200" {...form.register("scheduledAt")} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label className="text-gray-300">Notas</Label>
              <Textarea className="bg-gray-800 border-gray-700 text-gray-200 resize-none" rows={3} {...form.register("notes")} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1 text-gray-400 hover:text-white hover:bg-gray-800" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Criar atividade
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
