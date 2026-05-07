"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: RegisterValues) {
    setLoading(true);
    try {
      await signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
        fetchOptions: {
          onSuccess: () => {
            toast.success("Conta criada! Configure sua empresa.");
            router.push("/onboarding");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message ?? "Erro ao criar conta");
            setLoading(false);
          },
        },
      });
    } catch {
      toast.error("Erro ao criar conta");
      setLoading(false);
    }
  }

  return (
    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white text-xl">Criar conta</CardTitle>
        <CardDescription className="text-slate-400">
          Comece gratuitamente — sem cartão de crédito
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300">Nome completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                id="name"
                placeholder="João da Silva"
                className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                {...form.register("name")}
              />
            </div>
            {form.formState.errors.name && (
              <p className="text-red-400 text-xs">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                id="email"
                type="email"
                placeholder="voce@empresa.com"
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-300">Confirmar senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                {...form.register("confirmPassword")}
              />
            </div>
            {form.formState.errors.confirmPassword && (
              <p className="text-red-400 text-xs">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Criar conta
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-slate-400 text-sm">
          Já tem conta?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Entrar
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
