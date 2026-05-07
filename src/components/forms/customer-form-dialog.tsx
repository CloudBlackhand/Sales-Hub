"use client";

import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerSchema, type CustomerInput } from "@/lib/schemas/customers";
import { createCustomer, updateCustomer } from "@/server/actions/customers";
import { Customer } from "@/generated/prisma";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  companyId: string;
  customer: Customer | null;
  onSuccess: () => void;
}

export function CustomerFormDialog({ open, onClose, companyId, customer, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const form = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema) as Resolver<CustomerInput>,
    defaultValues: { name: "", email: "", phone: "", document: "", tags: [], notes: "" },
  });

  useEffect(() => {
    if (customer) {
      form.reset({
        name: customer.name,
        email: customer.email ?? "",
        phone: customer.phone ?? "",
        document: customer.document ?? "",
        tags: customer.tags ?? [],
        notes: customer.notes ?? "",
      });
    } else {
      form.reset({ name: "", email: "", phone: "", document: "", tags: [], notes: "" });
    }
  }, [customer, form]);

  async function onSubmit(values: CustomerInput) {
    setLoading(true);
    const result = customer
      ? await updateCustomer(companyId, customer.id, values)
      : await createCustomer(companyId, values);
    if (result.success) {
      toast.success(customer ? "Cliente atualizado" : "Cliente criado");
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
          <DialogTitle className="text-white">{customer ? "Editar cliente" : "Novo cliente"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
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
              <Input className="bg-gray-800 border-gray-700 text-gray-200" placeholder="(11) 99999-9999" {...form.register("phone")} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label className="text-gray-300">CPF / CNPJ</Label>
              <Input className="bg-gray-800 border-gray-700 text-gray-200 font-mono" placeholder="000.000.000-00" {...form.register("document")} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label className="text-gray-300">Observações</Label>
              <Textarea className="bg-gray-800 border-gray-700 text-gray-200 resize-none" rows={3} {...form.register("notes")} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1 text-gray-400 hover:text-white hover:bg-gray-800" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {customer ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
