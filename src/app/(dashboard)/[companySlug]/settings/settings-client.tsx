"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { companySettingsSchema, type CompanySettingsInput } from "@/lib/schemas/company-settings";
import { updateCompanyInfo } from "@/server/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building2, Loader2, Settings, Shield } from "lucide-react";
import { toast } from "sonner";

interface Props {
  company: {
    id: string;
    name: string;
    slug: string;
    cnpj: string | null;
    phone: string | null;
    email: string | null;
    plan: string;
  };
  settings: { id: string; currency: string; } | null;
}

const planFeatures: Record<string, string[]> = {
  FREE: ["Até 3 vendedores", "100 vendas/mês", "Suporte por e-mail"],
  PRO: ["Vendedores ilimitados", "Vendas ilimitadas", "Suporte prioritário", "Relatórios avançados"],
  ENTERPRISE: ["Tudo do PRO", "API de integração", "SLA garantido", "Gerente de conta"],
};

export function SettingsClient({ company, settings }: Props) {
  const [loading, setLoading] = useState(false);

  const form = useForm<CompanySettingsInput>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: {
      name: company.name,
      cnpj: company.cnpj ?? "",
      phone: company.phone ?? "",
      email: company.email ?? "",
    },
  });

  async function onSubmit(values: CompanySettingsInput) {
    setLoading(true);
    const r = await updateCompanyInfo(company.id, values);
    if (r.success) toast.success("Configurações salvas");
    else toast.error(r.error);
    setLoading(false);
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Configurações</h1>
        <p className="text-gray-400 text-sm mt-1">Gerencie os dados da sua empresa</p>
      </div>

      {/* Company info */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <Building2 className="w-4 h-4 text-blue-400" />
            Dados da empresa
          </CardTitle>
          <CardDescription className="text-gray-400">
            Informações básicas exibidas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label className="text-gray-300">Nome da empresa *</Label>
                <Input className="bg-gray-800 border-gray-700 text-gray-200" {...form.register("name")} />
                {form.formState.errors.name && <p className="text-red-400 text-xs">{form.formState.errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">CNPJ</Label>
                <Input className="bg-gray-800 border-gray-700 text-gray-200 font-mono" {...form.register("cnpj")} />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Telefone</Label>
                <Input className="bg-gray-800 border-gray-700 text-gray-200" {...form.register("phone")} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label className="text-gray-300">E-mail da empresa</Label>
                <Input type="email" className="bg-gray-800 border-gray-700 text-gray-200" {...form.register("email")} />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Label className="text-gray-400 text-sm">Slug (URL):</Label>
              <code className="text-blue-400 text-sm bg-gray-800 px-2 py-0.5 rounded font-mono">/{company.slug}</code>
            </div>

            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Salvar alterações
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Plan */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <Shield className="w-4 h-4 text-purple-400" />
            Plano atual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge className={`border-0 text-sm px-3 py-1 ${
              company.plan === "ENTERPRISE" ? "bg-purple-900 text-purple-300" :
              company.plan === "PRO" ? "bg-blue-900 text-blue-300" :
              "bg-gray-700 text-gray-300"
            }`}>
              {company.plan}
            </Badge>
            {company.plan !== "ENTERPRISE" && (
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-8">
                Fazer upgrade
              </Button>
            )}
          </div>
          <Separator className="bg-gray-800" />
          <ul className="space-y-2">
            {(planFeatures[company.plan] ?? planFeatures.FREE).map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {f}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* System info */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <Settings className="w-4 h-4 text-gray-400" />
            Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Moeda</span>
            <span className="text-gray-200 text-sm">{settings?.currency ?? "BRL"} — Real Brasileiro</span>
          </div>
          <Separator className="bg-gray-800" />
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Versão</span>
            <span className="text-gray-500 text-sm font-mono">1.0.0-beta</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
