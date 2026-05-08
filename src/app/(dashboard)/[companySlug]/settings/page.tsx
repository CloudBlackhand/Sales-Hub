import type { Metadata } from "next";
import { SettingsClient } from "./settings-client";
import { requireDashboardContext } from "@/server/dashboard/context";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Configurações" };

interface Props {
  params: Promise<{ companySlug: string }>;
}

export default async function SettingsPage({ params }: Props) {
  const { companySlug } = await params;
  const { company } = await requireDashboardContext(companySlug);
  const companyWithSettings = await db.company.findUnique({
    where: { id: company.id },
    include: { settings: true },
  });
  if (!companyWithSettings) {
    return null;
  }

  const settingsPayload = companyWithSettings.settings
    ? { id: companyWithSettings.settings.id, currency: companyWithSettings.settings.currency }
    : null;

  const companyPayload = {
    id: companyWithSettings.id,
    name: companyWithSettings.name,
    slug: companyWithSettings.slug,
    cnpj: companyWithSettings.cnpj,
    phone: companyWithSettings.phone,
    email: companyWithSettings.email,
    plan: companyWithSettings.plan,
  };

  return <SettingsClient company={companyPayload} companySlug={companySlug} settings={settingsPayload} />;
}
