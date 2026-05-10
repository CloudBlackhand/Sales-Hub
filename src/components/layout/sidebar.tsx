"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartNoAxesCombined,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  ShoppingCart,
  UserCheck,
  UserRound,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MemberRole } from "@/lib/prisma-types";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: MemberRole[];
  requiresOpenPanelUrl?: boolean;
}

const navItems: NavItem[] = [
  { label: "Visão geral", href: "overview", icon: LayoutDashboard },
  { label: "Painéis", href: "analytics", icon: ChartNoAxesCombined, requiresOpenPanelUrl: true },
  { label: "Vendas", href: "sales", icon: ShoppingCart },
  { label: "Clientes", href: "customers", icon: Users },
  { label: "Produtos", href: "products", icon: Package },
  { label: "Vendedores", href: "sellers", icon: UserCheck, roles: [MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MANAGER] },
  { label: "Pós-venda", href: "post-sale", icon: MessageSquare },
  { label: "Financeiro", href: "financial", icon: DollarSign, roles: [MemberRole.OWNER, MemberRole.ADMIN] },
  { label: "Perfil", href: "profile", icon: UserRound },
  { label: "Configurações", href: "settings", icon: Settings, roles: [MemberRole.OWNER, MemberRole.ADMIN] },
];

interface SidebarProps {
  companySlug: string;
  role: MemberRole;
}

const openPanelDashboardUrl =
  typeof process.env.NEXT_PUBLIC_OPENPANEL_DASHBOARD_URL === "string"
    ? process.env.NEXT_PUBLIC_OPENPANEL_DASHBOARD_URL.trim()
    : "";

const preferredActiveLabelByRoute: Record<string, string> = {
  overview: "Visão geral",
  analytics: "Painéis",
  sales: "Vendas",
  customers: "Clientes",
  products: "Produtos",
  sellers: "Vendedores",
  "post-sale": "Pós-venda",
  financial: "Financeiro",
  profile: "Perfil",
  settings: "Configurações",
};

export function Sidebar({ companySlug, role }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const visibleItems = navItems.filter((item) => {
    if (item.requiresOpenPanelUrl && !openPanelDashboardUrl) return false;
    if (item.roles && !item.roles.includes(role)) return false;
    return true;
  });

  const currentRoute = pathname.split("/")[2] ?? "";

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "relative flex flex-col border-r border-zinc-900 bg-zinc-950 transition-all duration-300",
          collapsed ? "w-14" : "w-[248px]"
        )}
      >
        <div className={cn("flex h-14 items-center border-b border-zinc-900 px-4", collapsed ? "justify-center" : "gap-3")}>
          <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-600/90 text-sm font-black text-white shadow-[0_0_0_1px_rgba(59,130,246,0.5)]">
            O!
          </div>
          {!collapsed ? <span className="truncate text-sm font-semibold text-zinc-100">{companySlug}</span> : null}
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2.5">
          <ul className="space-y-0.5 px-2.5">
            {visibleItems.map((item) => {
              const href = `/${companySlug}/${item.href}`;
              const isCurrentRoute = pathname === href || pathname.startsWith(`${href}/`);
              const preferredLabel = preferredActiveLabelByRoute[item.href];
              const isPreferredItem = preferredLabel ? item.label === preferredLabel : true;
              const isActive = isCurrentRoute && isPreferredItem && item.href === currentRoute;
              const Icon = item.icon;

              return (
                <li key={`${item.href}-${item.label}`}>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger
                        className={cn(
                          "mx-auto flex h-9 w-9 items-center justify-center rounded-md transition-colors",
                          isActive ? "bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-100"
                        )}
                      >
                        <Link href={href} className="flex h-full w-full items-center justify-center">
                          <Icon className="h-4 w-4" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  ) : (
                    <Link
                      href={href}
                      className={cn(
                        "flex h-8 items-center gap-3 rounded-md px-2.5 text-[13px] transition-colors",
                        isActive ? "bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-100"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-14 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>
    </TooltipProvider>
  );
}
