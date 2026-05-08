"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { companySettingsSchema, type CompanySettingsInput } from "@/lib/schemas/company-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building2, CalendarDays, Loader2, Settings, Shield, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { dashboardToolbar } from "@/lib/dashboard-ui-strings";

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
  companySlug: string;
  settings: { id: string; currency: string; } | null;
}

const planFeatures: Record<string, string[]> = {
  FREE: ["Até 3 vendedores", "100 vendas/mês", "Suporte por e-mail"],
  PRO: ["Vendedores ilimitados", "Vendas ilimitadas", "Suporte prioritário", "Relatórios avançados"],
  ENTERPRISE: ["Tudo do PRO", "API de integração", "SLA garantido", "Gerente de conta"],
};

export function SettingsClient({ company, companySlug, settings }: Props) {
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
    const response = await fetch(`/api/dashboard/${companySlug}/settings/company`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const payload = await response.json();
    if (response.ok) toast.success("Configurações salvas");
    else toast.error(payload.error ?? "Erro ao atualizar configurações");
    setLoading(false);
  }

  return (
    <div className="max-w-3xl space-y-4 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" className="h-8 border-zinc-800 bg-zinc-900 px-2.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
          <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
          {dashboardToolbar.lastMonth}
        </Button>
        <Button size="sm" variant="outline" className="h-8 border-zinc-800 bg-zinc-900 px-2.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
          {dashboardToolbar.day}
        </Button>
        <Button size="sm" variant="outline" className="h-8 border-zinc-800 bg-zinc-900 px-2.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
          <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
          {dashboardToolbar.filters}
        </Button>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
        <h1 className="text-lg font-semibold text-zinc-100">Configurações</h1>
        <p className="mt-1 text-xs text-zinc-500">Preferências da empresa e do plano</p>
      </div>

      <Card className="border-zinc-800 bg-zinc-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <Building2 className="h-4 w-4 text-zinc-300" />
            Dados da empresa
          </CardTitle>
          <CardDescription className="text-gray-400">
            Informações básicas exibidas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label className="text-gray-300">Nome da empresa *</Label>
                <Input className="border-zinc-700 bg-zinc-900 text-gray-200" {...form.register("name")} />
                {form.formState.errors.name && <p className="text-xs text-red-400">{form.formState.errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">CNPJ</Label>
                <Input className="border-zinc-700 bg-zinc-900 font-mono text-gray-200" {...form.register("cnpj")} />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Telefone</Label>
                <Input className="border-zinc-700 bg-zinc-900 text-gray-200" {...form.register("phone")} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="text-gray-300">E-mail da empresa</Label>
                <Input type="email" className="border-zinc-700 bg-zinc-900 text-gray-200" {...form.register("email")} />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Label className="text-sm text-gray-400">Slug (URL):</Label>
              <code className="rounded bg-zinc-900 px-2 py-0.5 font-mono text-sm text-zinc-300">/{company.slug}</code>
            </div>

            <Button type="submit" className="h-8 bg-zinc-100 px-3 text-xs font-medium text-zinc-900 hover:bg-zinc-200" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salvar alterações
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <Shield className="h-4 w-4 text-zinc-300" />
            Plano atual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge className={`border-0 px-3 py-1 text-sm ${
              company.plan === "ENTERPRISE" ? "bg-zinc-100 text-zinc-900" :
              company.plan === "PRO" ? "bg-zinc-200 text-zinc-900" :
              "bg-zinc-700 text-zinc-300"
            }`}>
              {company.plan}
            </Badge>
            {company.plan !== "ENTERPRISE" && (
              <Button size="sm" className="h-8 bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
                Fazer upgrade
              </Button>
            )}
          </div>
          <Separator className="bg-zinc-800" />
          <ul className="space-y-2">
            {(planFeatures[company.plan] ?? planFeatures.FREE).map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                <div className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                {f}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <Settings className="h-4 w-4 text-zinc-400" />
            Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Moeda</span>
            <span className="text-sm text-gray-200">{settings?.currency ?? "BRL"} — Real Brasileiro</span>
          </div>
          <Separator className="bg-zinc-800" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Versão</span>
            <span className="font-mono text-sm text-gray-500">1.0.0-beta</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
