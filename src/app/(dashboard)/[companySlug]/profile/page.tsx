import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { MemberRole } from "@/lib/prisma-types";
import { ProfileClient } from "./profile-client";

export const metadata: Metadata = { title: "Perfil da Empresa" };

interface Props {
  params: Promise<{ companySlug: string }>;
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export default async function CompanyProfilePage({ params }: Props) {
  const { companySlug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const company = await db.company.findUnique({
    where: { slug: companySlug },
    include: { settings: true },
  });
  if (!company) redirect("/onboarding");

  const membership = await db.companyMember.findUnique({
    where: { userId_companyId: { userId: session.user.id, companyId: company.id } },
    select: { role: true },
  });
  if (!membership) redirect("/onboarding");

  const custom = asObject(company.settings?.customFields);
  const profile = asObject(custom.profile);
  const canEdit = membership.role === MemberRole.OWNER || membership.role === MemberRole.ADMIN;

  return (
    <ProfileClient
      company={{
        id: company.id,
        name: company.name,
        slug: company.slug,
        logo: company.logo,
        plan: company.plan,
        createdAtLabel: formatDate(company.createdAt),
      }}
      profile={{
        displayName: typeof profile.displayName === "string" ? profile.displayName : "",
        slogan: typeof profile.slogan === "string" ? profile.slogan : "",
        bio: typeof profile.bio === "string" ? profile.bio : "",
        coverUrl: typeof profile.coverUrl === "string" ? profile.coverUrl : "",
        website: typeof profile.website === "string" ? profile.website : "",
        instagram: typeof profile.instagram === "string" ? profile.instagram : "",
        linkedin: typeof profile.linkedin === "string" ? profile.linkedin : "",
        city: typeof profile.city === "string" ? profile.city : "",
        state: typeof profile.state === "string" ? profile.state : "",
        country: typeof profile.country === "string" ? profile.country : "",
      }}
      canEdit={canEdit}
    />
  );
}
