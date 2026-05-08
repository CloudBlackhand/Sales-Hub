import { IdentifyComponent } from "@openpanel/nextjs";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isPlatformAdmin } from "@/lib/platform-admin";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{ companySlug: string }>;
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { companySlug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const company = await db.company.findUnique({ where: { slug: companySlug } });
  if (!company) redirect("/onboarding");

  const membership = await db.companyMember.findUnique({
    where: { userId_companyId: { userId: session.user.id, companyId: company.id } },
  });
  if (!membership) redirect("/onboarding");

  const allMemberships = await db.companyMember.findMany({
    where: { userId: session.user.id },
    include: { company: { select: { id: true, name: true, slug: true, logo: true } } },
    orderBy: { joinedAt: "asc" },
  });

  const companies = allMemberships.map((m) => m.company);
  const showSupervise = isPlatformAdmin(session.user.email);

  const openPanelClientId = process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID;
  const displayName = session.user.name?.trim() ?? "";
  const [firstName, ...rest] = displayName.split(/\s+/);
  const lastName = rest.join(" ") || undefined;

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {openPanelClientId ? (
        <IdentifyComponent
          profileId={session.user.id}
          firstName={firstName || undefined}
          lastName={lastName}
          email={session.user.email}
          properties={{
            company_id: company.id,
            company_slug: companySlug,
            company_name: company.name,
          }}
        />
      ) : null}
      <Sidebar companySlug={companySlug} role={membership.role} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          user={{ id: session.user.id, name: session.user.name, email: session.user.email, image: session.user.image ?? null }}
          company={company}
          companies={companies}
          showSupervise={showSupervise}
        />
        <main className="flex-1 overflow-y-auto bg-gray-950">
          {children}
        </main>
      </div>
    </div>
  );
}
