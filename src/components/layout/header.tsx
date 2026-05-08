"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, ChevronsUpDown, LogOut, Plus, Shield, User } from "lucide-react";
import Link from "next/link";
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
    FREE: "bg-gray-700 text-gray-300",
    PRO: "bg-blue-900 text-blue-300",
    ENTERPRISE: "bg-purple-900 text-purple-300",
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-900 bg-black px-6">
      {/* Company switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-900 hover:text-white"
        >
          <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium leading-none truncate max-w-[160px]">{company.name}</p>
            <p className="mt-0.5 text-xs capitalize text-zinc-500">{company.plan.toLowerCase()}</p>
          </div>
          <ChevronsUpDown className="ml-1 h-4 w-4 text-zinc-500" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 bg-gray-800 border-gray-700">
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

      {/* Supervisão global + plan badge + user */}
      <div className="flex items-center gap-3">
        {showSupervise ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex border-amber-600/50 bg-amber-950/40 text-amber-100 hover:bg-amber-950/70 hover:text-amber-50"
            onClick={() => router.push("/supervise")}
          >
            <Shield className="w-4 h-4 mr-1.5" />
            Supervisão
          </Button>
        ) : null}
        <Badge className={`${planColors[company.plan] ?? planColors.FREE} border-0 text-xs`}>
          {company.plan}
        </Badge>

        <DropdownMenu>
          <DropdownMenuTrigger className="relative h-9 w-9 rounded-full p-0 flex items-center justify-center hover:opacity-80 transition-opacity">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback className="bg-gray-700 text-gray-200 text-sm">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-gray-700">
            <DropdownMenuLabel className="py-2">
              <p className="text-sm font-medium text-gray-200 truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </DropdownMenuLabel>
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
