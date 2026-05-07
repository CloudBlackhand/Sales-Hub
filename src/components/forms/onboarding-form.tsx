"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createCompanySchema, type CreateCompanyInput } from "@/lib/schemas/company";
import { createCompany } from "@/server/actions/company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Loader2, Phone, Mail, FileText } from "lucide-react";
import { toast } from "sonner";

interface OnboardingFormProps {
  userId: string;
  userName: string;
}

export function OnboardingForm({ userId, userName }: OnboardingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<CreateCompanyInput>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: { name: "", cnpj: "", phone: "", email: "" },
  });

  async function onSubmit(values: CreateCompanyInput) {
    setLoading(true);
    const result = await createCompany(userId, userName, values);
    if (result.success && result.data) {
      toast.success("Empresa criada com sucesso!");
      router.push(`/${result.data.slug}/overview`);
    } else {
      toast.error(result.error ?? "Erro ao criar empresa");
      setLoading(false);
    }
  }

  return (
    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-400" />
          Dados da empresa
        </CardTitle>
        <CardDescription className="text-slate-400">
          Essas informações identificam sua empresa no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300">
              Nome da empresa <span className="text-red-400">*</span>
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                id="name"
                placeholder="Empresa Ltda."
                className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                {...form.register("name")}
              />
            </div>
            {form.formState.errors.name && (
              <p className="text-red-400 text-xs">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj" className="text-slate-300">CNPJ</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                id="cnpj"
                placeholder="00.000.000/0001-00"
                className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                {...form.register("cnpj")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-300">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                  {...form.register("phone")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">E-mail da empresa</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="contato@empresa.com"
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                  {...form.register("email")}
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Criar empresa e começar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
