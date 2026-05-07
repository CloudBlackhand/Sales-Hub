import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { OnboardingForm } from "@/components/forms/onboarding-form";

export const metadata: Metadata = { title: "Configurar empresa" };

export default async function OnboardingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const existing = await db.companyMember.findFirst({
    where: { userId: session.user.id },
    include: { company: true },
  });

  if (existing) redirect(`/${existing.company.slug}/overview`);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-white text-xl font-bold tracking-tight">Sales Hub</span>
          </div>
          <h1 className="text-white text-2xl font-bold mb-2">Configure sua empresa</h1>
          <p className="text-slate-400">
            Olá, <strong className="text-slate-200">{session.user.name}</strong>! Vamos configurar seu espaço de trabalho.
          </p>
        </div>
        <OnboardingForm userId={session.user.id} userName={session.user.name} />
      </div>
    </div>
  );
}
