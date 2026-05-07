import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isPlatformAdmin } from "@/lib/platform-admin";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, Building2, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Supervisão da plataforma",
};

export default async function SupervisePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if (!isPlatformAdmin(session.user.email)) redirect("/");

  const [companies, firstMembership] = await Promise.all([
    db.company.findMany({
      include: {
        _count: {
          select: {
            members: true,
            sales: true,
            customers: true,
            products: true,
            sellers: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.companyMember.findFirst({
      where: { userId: session.user.id },
      include: { company: { select: { slug: true } } },
      orderBy: { joinedAt: "asc" },
    }),
  ]);

  const backHref = firstMembership ? `/${firstMembership.company.slug}/overview` : "/";

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 bg-gray-900/80 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-amber-500/15 p-2 text-amber-400">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Supervisão da plataforma</h1>
              <p className="text-sm text-gray-400">
                Visão consolidada de todas as empresas (tenants). Acesso restrito a administradores da
                plataforma.
              </p>
            </div>
          </div>
          <Link
            href={backHref}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "border-gray-600 text-gray-200 shrink-0 inline-flex items-center",
            )}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao painel
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 rounded-lg border border-gray-800 bg-gray-900/50 p-4 text-sm text-gray-400">
          <p>
            Logado como <span className="text-gray-200">{session.user.email}</span>. Para incluir outros
            supervisores em produção, defina a variável{" "}
            <code className="rounded bg-black/40 px-1.5 py-0.5 text-amber-200/90">PLATFORM_ADMIN_EMAILS</code>{" "}
            (e-mails separados por vírgula).
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/40 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-gray-800 bg-gray-900/80 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Empresa</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Plano</th>
                  <th className="px-4 py-3 font-medium text-right">Membros</th>
                  <th className="px-4 py-3 font-medium text-right">Vendas</th>
                  <th className="px-4 py-3 font-medium text-right">Clientes</th>
                  <th className="px-4 py-3 font-medium text-right">Produtos</th>
                  <th className="px-4 py-3 font-medium text-right">Vendedores</th>
                  <th className="px-4 py-3 font-medium">Criada</th>
                  <th className="px-4 py-3 font-medium"> </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {companies.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-800/40">
                    <td className="px-4 py-3 font-medium text-gray-100">
                      <span className="inline-flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-400" />
                        {c.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{c.slug}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-gray-800 px-2 py-0.5 text-xs text-gray-300">
                        {c.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{c._count.members}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{c._count.sales}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{c._count.customers}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{c._count.products}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{c._count.sellers}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {c.createdAt.toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/${c.slug}/overview`}
                        className="text-blue-400 hover:text-blue-300 text-xs font-medium"
                      >
                        Abrir →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {companies.length === 0 ? (
            <p className="p-8 text-center text-gray-500">Nenhuma empresa cadastrada.</p>
          ) : null}
        </div>
      </main>
    </div>
  );
}
