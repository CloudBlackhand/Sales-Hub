"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
      await signIn.email({
        email,
        password: values.password,
        callbackURL: callbackUrl,
        fetchOptions: {
          onSuccess: () => router.push(callbackUrl),
          onError: (ctx) => {
            toast.error(ctx.error.message ?? "Credenciais inválidas");
            setLoading(false);
          },
        },
      });
    } catch {
      toast.error("Erro ao fazer login");
      setLoading(false);
    }
  }

  return (
    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white text-xl">Entrar na sua conta</CardTitle>
        <CardDescription className="text-slate-400">
          Insira suas credenciais para acessar o painel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100/90">
          <p className="font-medium text-amber-200">Demonstração para visitantes</p>
          <p className="mt-1 text-amber-100/80">
            Usuário: <code className="rounded bg-black/30 px-1">admin</code> ou{" "}
            <code className="rounded bg-black/30 px-1">{DEMO_LOGIN_EMAIL}</code> — Senha:{" "}
            <code className="rounded bg-black/30 px-1">admin</code>
          </p>
          <p className="mt-1 text-amber-100/60">
            Rode <code className="rounded bg-black/30 px-1">npm run db:seed</code> após migrar o banco para criar essa conta e dados de exemplo.
          </p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">E-mail ou &quot;admin&quot;</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                id="email"
                type="text"
                autoComplete="username"
                placeholder={`admin ou ${DEMO_LOGIN_EMAIL}`}
                className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                {...form.register("email")}
              />
            </div>
            {form.formState.errors.email && (
              <p className="text-red-400 text-xs">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                {...form.register("password")}
              />
            </div>
            {form.formState.errors.password && (
              <p className="text-red-400 text-xs">{form.formState.errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Entrar
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-slate-400 text-sm">
          Não tem conta?{" "}
          <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">
            Criar conta
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
