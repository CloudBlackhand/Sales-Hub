"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, CalendarDays, ChevronsUpDown, LogOut, Plus, Shield, SlidersHorizontal, User } from "lucide-react";
import { toast } from "sonner";

interface HeaderProps {
  user: { id: string; name: string; email: string; image: string | null };
  company: { id: string; name: string; slug: string; logo: string | null; plan: string };
  companies: { id: string; name: string; slug: string; logo: string | null }[];
  /** Painel global: todos os tenants (apenas platform admin). */
  showSupervise?: boolean;
}

export function Header({ user, company, companies, showSupervise }: HeaderProps) {
  const router = useRouter();
  const controls = ["Last Month", "Day", "Filters"];

  async function handleSignOut() {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          router.refresh();
        },
        onError: () => { toast.error("Erro ao sair"); },
      },
    });
  }

  const planColors: Record<string, string> = {
    FREE: "bg-zinc-800 text-zinc-300",
    PRO: "bg-zinc-100 text-zinc-900",
    ENTERPRISE: "bg-zinc-200 text-zinc-900",
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-900 bg-zinc-950 px-4">
      {/* Company switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex h-8 items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 text-sm text-zinc-200 transition-colors hover:bg-zinc-800 hover:text-white"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-600/90 text-white">
            <Building2 className="h-3 w-3" />
          </div>
          <div className="hidden text-left sm:block">
            <p className="max-w-[160px] truncate text-xs font-medium leading-none">{company.name}</p>
          </div>
          <ChevronsUpDown className="ml-1 h-3.5 w-3.5 text-zinc-500" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 bg-gray-800 border-gray-700">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-gray-400 text-xs uppercase tracking-wider px-2">
              Suas empresas
            </DropdownMenuLabel>
            {companies.map((co) => (
              <DropdownMenuItem
                key={co.id}
                className="cursor-pointer focus:bg-gray-700 text-gray-200"
                onClick={() => router.push(`/${co.slug}/overview`)}
              >
                <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{getInitials(co.name)}</span>
                </div>
                <span className="truncate">{co.name}</span>
                {co.id === company.id && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-gray-700" />
          <DropdownMenuItem
            className="cursor-pointer focus:bg-gray-700 text-blue-400"
            onClick={() => router.push("/onboarding")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova empresa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="hidden items-center gap-1.5 md:flex">
        {controls.map((item) => (
          <Button
            key={item}
            size="sm"
            variant="outline"
            className="h-8 border-zinc-800 bg-zinc-900 px-2.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
          >
            {item === "Last Month" ? <CalendarDays className="mr-1.5 h-3.5 w-3.5" /> : null}
            {item === "Filters" ? <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" /> : null}
            {item}
          </Button>
        ))}
      </div>

      {/* Supervisão global + plan badge + user */}
      <div className="flex items-center gap-2">
        {showSupervise ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hidden h-8 border-amber-600/50 bg-amber-950/40 text-amber-100 hover:bg-amber-950/70 hover:text-amber-50 sm:inline-flex"
            onClick={() => router.push("/supervise")}
          >
            <Shield className="mr-1.5 h-4 w-4" />
            Supervisão
          </Button>
        ) : null}
        <Badge className={`${planColors[company.plan] ?? planColors.FREE} border-0 text-[11px]`}>
          {company.plan}
        </Badge>

        <DropdownMenu>
          <DropdownMenuTrigger className="relative flex h-8 w-8 items-center justify-center rounded-full p-0 transition-opacity hover:opacity-80">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback className="bg-gray-700 text-xs text-gray-200">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-gray-700">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="py-2">
                <p className="text-sm font-medium text-gray-200 truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-gray-700" />
            {showSupervise ? (
              <DropdownMenuItem
                className="cursor-pointer focus:bg-gray-700 text-amber-300 sm:hidden"
                onClick={() => router.push("/supervise")}
              >
                <Shield className="w-4 h-4 mr-2" />
                Supervisão global
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem
              className="cursor-pointer focus:bg-gray-700 text-gray-300"
              onClick={() => router.push(`/${company.slug}/settings`)}
            >
              <User className="w-4 h-4 mr-2" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem
              className="cursor-pointer focus:bg-gray-700 text-red-400 focus:text-red-300"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
