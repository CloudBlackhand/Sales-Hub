import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MemberRole } from "@/lib/prisma-types";
import { OpenPanelEmbed } from "./openpanel-embed";

export const metadata: Metadata = { title: "Analytics (OpenPanel)" };

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
      <div className="p-6 max-w-xl">
        <h1 className="text-xl font-semibold text-white mb-2">Analytics (OpenPanel)</h1>
        <p className="text-gray-400 text-sm mb-4">
          Define <code className="text-amber-200/90">NEXT_PUBLIC_OPENPANEL_DASHBOARD_URL</code> no ambiente
          (Railway / <code className="text-amber-200/90">.env</code>) com o URL do teu projeto OpenPanel — por
          exemplo o caminho do workspace no dashboard (cloud ou self-host).
        </p>
        <p className="text-gray-500 text-xs">
          O monorepo{" "}
          <a
            href="https://github.com/Openpanel-dev/openpanel"
            className="text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Openpanel-dev/openpanel
          </a>{" "}
          é a stack completa de analytics; aqui apenas incorporamos essa UI.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 h-full min-h-0">
      <OpenPanelEmbed dashboardUrl={dashboardUrl} />
    </div>
  );
}
