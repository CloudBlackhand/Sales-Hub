import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SettingsClient } from "./settings-client";

export const metadata: Metadata = { title: "Configurações" };

interface Props {
  params: Promise<{ companySlug: string }>;
}

export default async function SettingsPage({ params }: Props) {
  const { companySlug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const company = await db.company.findUnique({
    where: { slug: companySlug },
    include: { settings: true },
  });
  if (!company) redirect("/onboarding");

  return <SettingsClient company={company} settings={company.settings} />;
}
