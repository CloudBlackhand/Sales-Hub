"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useOpenPanel } from "@openpanel/nextjs";
import { signIn } from "@/lib/auth-client";
import { DEMO_LOGIN_EMAIL, resolveLoginEmail } from "@/lib/demo-login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().min(1, "Informe o e-mail ou admin"),
  password: z.string().min(5, "Senha deve ter no mínimo 5 caracteres"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [loading, setLoading] = useState(false);
  const openPanel = useOpenPanel();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    const email = resolveLoginEmail(values.email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("E-mail inválido");
      return;
    }
    setLoading(true);
    try {
      const res = await signIn.email({
        email,
        password: values.password,
        callbackURL: callbackUrl,
      });

      if (res && typeof res === "object" && "error" in res && res.error) {
        const err = res.error as { message?: string; status?: number; code?: string };
        const hint401 =
          "Conta/senha inválidos ou utilizador demo não existe nesta base. Confirme admin/admin, redeploy com seed, e que DATABASE_URL aponta ao Postgres certo.";
        const msg =
          (typeof err.message === "string" && err.message.trim()) ||
          (err.status === 401 ? hint401 : undefined) ||
          (typeof err.code === "string" ? err.code : undefined) ||
          "Não foi possível entrar.";
        toast.error(msg);
        return;
      }

      if (process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID) {
        openPanel.track("user_signed_in", { method: "email" });
      }

      router.push(callbackUrl);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900/80 shadow-[0_0_0_1px_rgba(39,39,42,0.45)] backdrop-blur">
      <CardHeader>
        <CardTitle className="text-xl text-zinc-100">Entrar na sua conta</CardTitle>
        <CardDescription className="text-zinc-500">
          Insira suas credenciais para acessar o painel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 rounded-md border border-blue-500/25 bg-blue-500/10 px-3 py-2 text-xs text-blue-100/90">
          <p className="font-medium text-blue-200">Demonstração para visitantes</p>
          <p className="mt-1 text-blue-100/80">
            Usuário: <code className="rounded bg-black/30 px-1">admin</code> ou{" "}
            <code className="rounded bg-black/30 px-1">{DEMO_LOGIN_EMAIL}</code> — Senha:{" "}
            <code className="rounded bg-black/30 px-1">admin</code>
          </p>
          <p className="mt-1 text-blue-100/60">
            Rode <code className="rounded bg-black/30 px-1">npm run db:seed</code> após migrar o banco para criar essa conta e dados de exemplo.
          </p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-400">E-mail ou &quot;admin&quot;</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                id="email"
                type="text"
                autoComplete="username"
                placeholder={`admin ou ${DEMO_LOGIN_EMAIL}`}
                className="h-9 border-zinc-800 bg-zinc-950 pl-10 text-zinc-100 placeholder:text-zinc-600"
                {...form.register("email")}
              />
            </div>
            {form.formState.errors.email && (
              <p className="text-xs text-red-400">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-400">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-9 border-zinc-800 bg-zinc-950 pl-10 text-zinc-100 placeholder:text-zinc-600"
                {...form.register("password")}
              />
            </div>
            {form.formState.errors.password && (
              <p className="text-xs text-red-400">{form.formState.errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="h-9 w-full border border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Entrar
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-zinc-500">
          Não tem conta?{" "}
          <Link href="/register" className="font-medium text-zinc-300 hover:text-zinc-100">
            Criar conta
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
