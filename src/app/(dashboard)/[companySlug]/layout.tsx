import { IdentifyOpenPanel } from "@/components/openpanel/open-panel-scripts";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { DemoReadOnlyBanner } from "@/components/layout/demo-read-only-banner";
import { isDemoReadOnlyEnv } from "@/lib/demo-read-only";
import { requireDashboardContext } from "@/server/dashboard/context";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{ companySlug: string }>;
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { companySlug } = await params;
  const { session, company, membership, companies, showSupervise } = await requireDashboardContext(
    companySlug,
    { includeCompanies: true }
  );

  const openPanelClientId = process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID;
  const displayName = session.user.name?.trim() ?? "";
  const [firstName, ...rest] = displayName.split(/\s+/);
  const lastName = rest.join(" ") || undefined;

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      {openPanelClientId ? (
        <IdentifyOpenPanel
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
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          user={{ id: session.user.id, name: session.user.name, email: session.user.email, image: session.user.image ?? null }}
          company={company}
          companies={companies}
          showSupervise={showSupervise}
        />
        {isDemoReadOnlyEnv() ? <DemoReadOnlyBanner /> : null}
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden bg-zinc-950">
          {children}
        </main>
      </div>
    </div>
  );
}
