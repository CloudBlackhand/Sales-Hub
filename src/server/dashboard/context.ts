import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MemberRole } from "@/lib/prisma-types";
import { isPlatformAdmin } from "@/lib/platform-admin";

interface RequireDashboardContextOptions {
  includeCompanies?: boolean;
  allowedRoles?: MemberRole[];
}

export async function requireDashboardContext(
  companySlug: string,
  options: RequireDashboardContextOptions = {}
) {
  const { includeCompanies = false, allowedRoles } = options;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const company = await db.company.findUnique({ where: { slug: companySlug } });
  if (!company) {
    redirect("/onboarding");
  }

  const membership = await db.companyMember.findUnique({
    where: { userId_companyId: { userId: session.user.id, companyId: company.id } },
  });
  if (!membership) {
    redirect("/onboarding");
  }

  if (allowedRoles?.length && !allowedRoles.includes(membership.role)) {
    redirect(`/${companySlug}/overview`);
  }

  const companies = includeCompanies
    ? (
        await db.companyMember.findMany({
          where: { userId: session.user.id },
          include: { company: { select: { id: true, name: true, slug: true, logo: true } } },
          orderBy: { joinedAt: "asc" },
        })
      ).map((item) => item.company)
    : [];

  return {
    session,
    company,
    membership,
    companies,
    showSupervise: isPlatformAdmin(session.user.email),
  };
}
