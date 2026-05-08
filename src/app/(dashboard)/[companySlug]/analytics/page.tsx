import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MemberRole } from "@/lib/prisma-types";
import { OpenPanelEmbed } from "./openpanel-embed";

export const metadata: Metadata = { title: "Análises (OpenPanel)" };

interface Props {
  params: Promise<{ companySlug: string }>;
}

export default async function AnalyticsPage({ params }: Props) {
  const { companySlug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const company = await db.company.findUnique({ where: { slug: companySlug } });
  if (!company) redirect("/onboarding");

  const membership = await db.companyMember.findUnique({
    where: { userId_companyId: { userId: session.user.id, companyId: company.id } },
  });
  if (!membership) redirect("/onboarding");

  if (membership.role !== MemberRole.OWNER && membership.role !== MemberRole.ADMIN) {
    redirect(`/${companySlug}/overview`);
  }

  const dashboardUrl = process.env.NEXT_PUBLIC_OPENPANEL_DASHBOARD_URL?.trim() ?? "";

  if (!dashboardUrl) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-black px-4 py-12">
        <div className="w-full max-w-md rounded-xl border border-zinc-800/90 bg-zinc-950/90 px-8 py-10 text-center shadow-[0_0_0_1px_rgba(24,24,27,0.5)]">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">OpenPanel</p>
          <h1 className="mt-3 text-lg font-semibold tracking-tight text-zinc-100">Painel OpenPanel não configurado</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            Defina{" "}
            <code className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-[0.8rem] text-amber-200/90">
              NEXT_PUBLIC_OPENPANEL_DASHBOARD_URL
            </code>{" "}
            no Railway ou no <code className="font-mono text-zinc-400">.env</code> com o URL do projeto no
            dashboard OpenPanel.
          </p>
          <p className="mt-6 text-xs leading-relaxed text-zinc-600">
            Stack de referência:{" "}
            <a
              href="https://github.com/Openpanel-dev/openpanel"
              className="text-zinc-400 underline-offset-2 hover:text-white hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Openpanel-dev/openpanel
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <OpenPanelEmbed dashboardUrl={dashboardUrl} />
    </div>
  );
}
