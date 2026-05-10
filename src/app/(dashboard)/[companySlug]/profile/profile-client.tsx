"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Camera, Loader2, MapPin, PencilLine } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { companyProfileSchema, type CompanyProfileInput } from "@/lib/schemas/company-profile";
import { updateCompanyProfile } from "@/server/actions/settings";

interface Props {
  company: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    plan: string;
    createdAtLabel: string;
  };
  profile: {
    displayName: string;
    slogan: string;
    bio: string;
    coverUrl: string;
    website: string;
    instagram: string;
    linkedin: string;
    city: string;
    state: string;
    country: string;
  };
  canEdit: boolean;
}

export function ProfileClient({ company, profile, canEdit }: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const form = useForm<CompanyProfileInput>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      ...profile,
      logoUrl: company.logo ?? "",
    },
  });

  const values = form.watch();
  const nameToShow = values.displayName?.trim() || company.name;
  const sloganToShow = values.slogan?.trim() || "Transformando gestão comercial em crescimento";
  const bioToShow =
    values.bio?.trim() ||
    "Perfil público da empresa dentro do Sales Hub. Personalize com foto, capa e descrição.";
  const coverToShow = values.coverUrl?.trim() || "";
  const logoToShow = values.logoUrl?.trim() || "";
  const location =
    [values.city?.trim(), values.state?.trim(), values.country?.trim()].filter(Boolean).join(", ") || "Brasil";

  async function onSubmit(input: CompanyProfileInput) {
    setSaving(true);
    const result = await updateCompanyProfile(company.id, input);
    setSaving(false);

    if (!result.success) {
      toast.error(result.error ?? "Não foi possível salvar o perfil");
      return;
    }

    toast.success("Perfil da empresa atualizado");
    setEditing(false);
  }

  return (
    <div className="space-y-4 p-4">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
        <div
          className="h-44 md:h-56 w-full bg-gradient-to-r from-blue-700/70 via-indigo-700/70 to-violet-700/70"
          style={coverToShow ? { backgroundImage: `url(${coverToShow})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex items-end gap-4">
              <div className="h-24 w-24 rounded-2xl border-4 border-zinc-950 bg-zinc-900 overflow-hidden flex items-center justify-center">
                {logoToShow ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoToShow} alt={nameToShow} className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-10 w-10 text-zinc-500" />
                )}
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-white tracking-tight">{nameToShow}</h1>
                <p className="text-sm text-zinc-400">{sloganToShow}</p>
                <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
                  <span>@{company.slug}</span>
                  <span>{company.plan}</span>
                  <span>Desde {company.createdAtLabel}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{location}</span>
                </div>
              </div>
            </div>
            {canEdit ? (
              <Button
                variant={editing ? "secondary" : "outline"}
                className="h-8 border-zinc-700 bg-zinc-900 text-xs text-zinc-200 hover:bg-zinc-800"
                onClick={() => setEditing((v) => !v)}
                type="button"
              >
                <PencilLine className="h-4 w-4 mr-2" />
                {editing ? "Fechar edição" : "Editar perfil"}
              </Button>
            ) : null}
          </div>
          <p className="mt-5 text-sm leading-relaxed text-zinc-300 max-w-3xl">{bioToShow}</p>
        </div>
      </div>

      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Camera className="h-4 w-4 text-blue-400" />
            Perfil social da empresa
          </CardTitle>
          <CardDescription className="text-zinc-400">
            {canEdit ? "Personalize imagem, bio e links públicos da empresa." : "Apenas OWNER/ADMIN podem editar este perfil."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label className="text-zinc-300">Nome de exibição</Label>
              <Input className="bg-zinc-900 border-zinc-700 text-zinc-100" disabled={!editing} {...form.register("displayName")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-zinc-300">Slogan</Label>
              <Input className="bg-zinc-900 border-zinc-700 text-zinc-100" disabled={!editing} {...form.register("slogan")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-zinc-300">Bio</Label>
              <Textarea className="bg-zinc-900 border-zinc-700 text-zinc-100 min-h-28" disabled={!editing} {...form.register("bio")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-zinc-300">URL da capa</Label>
              <Input className="bg-zinc-900 border-zinc-700 text-zinc-100" placeholder="https://..." disabled={!editing} {...form.register("coverUrl")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-zinc-300">URL da foto/logo</Label>
              <Input className="bg-zinc-900 border-zinc-700 text-zinc-100" placeholder="https://..." disabled={!editing} {...form.register("logoUrl")} />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Website</Label>
              <Input className="bg-zinc-900 border-zinc-700 text-zinc-100" placeholder="https://site.com" disabled={!editing} {...form.register("website")} />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Instagram</Label>
              <Input className="bg-zinc-900 border-zinc-700 text-zinc-100" placeholder="https://instagram.com/..." disabled={!editing} {...form.register("instagram")} />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">LinkedIn</Label>
              <Input className="bg-zinc-900 border-zinc-700 text-zinc-100" placeholder="https://linkedin.com/company/..." disabled={!editing} {...form.register("linkedin")} />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Cidade</Label>
              <Input className="bg-zinc-900 border-zinc-700 text-zinc-100" disabled={!editing} {...form.register("city")} />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Estado</Label>
              <Input className="bg-zinc-900 border-zinc-700 text-zinc-100" disabled={!editing} {...form.register("state")} />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">País</Label>
              <Input className="bg-zinc-900 border-zinc-700 text-zinc-100" disabled={!editing} {...form.register("country")} />
            </div>

            {canEdit ? (
              <div className="md:col-span-2 pt-2">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={!editing || saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Salvar perfil
                </Button>
              </div>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
