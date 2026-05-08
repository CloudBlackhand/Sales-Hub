"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  UserCheck,
  MessageSquare,
  DollarSign,
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BarChart3,
  CircleUserRound,
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
  /** Só mostra quando o dashboard OpenPanel está configurado (iframe interno). */
  requiresOpenPanelUrl?: boolean;
}

const navItems: NavItem[] = [
  { label: "Visão Geral", href: "overview", icon: LayoutDashboard },
  { label: "Perfil", href: "profile", icon: CircleUserRound },
  { label: "Vendas", href: "sales", icon: ShoppingCart },
  { label: "Clientes", href: "customers", icon: Users },
  { label: "Produtos", href: "products", icon: Package },
  { label: "Vendedores", href: "sellers", icon: UserCheck, roles: [MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MANAGER] },
  { label: "Pós-Venda", href: "post-sale", icon: MessageSquare },
  { label: "Financeiro", href: "financial", icon: DollarSign, roles: [MemberRole.OWNER, MemberRole.ADMIN] },
  {
    label: "Analytics",
    href: "analytics",
    icon: BarChart3,
    roles: [MemberRole.OWNER, MemberRole.ADMIN],
    requiresOpenPanelUrl: true,
  },
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

export function Sidebar({ companySlug, role }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const visibleItems = navItems.filter((item) => {
    if (item.requiresOpenPanelUrl && !openPanelDashboardUrl) return false;
    if (item.roles && !item.roles.includes(role)) return false;
    return true;
  });

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "relative flex flex-col border-r border-zinc-900 bg-black transition-all duration-300",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <div className={cn(
          "flex items-center border-b border-zinc-900 h-16 px-4",
          collapsed ? "justify-center" : "gap-3"
        )}>
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <span className="text-white font-bold text-base tracking-tight truncate">
              Sales Hub
            </span>
          )}
        </div>

        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
          <ul className="space-y-1 px-2">
            {visibleItems.map((item) => {
              const href = `/${companySlug}/${item.href}`;
              const isActive = pathname.startsWith(href);
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger
                        className={cn(
                          "flex items-center justify-center h-10 w-10 mx-auto rounded-lg transition-colors",
                          isActive
                            ? "bg-blue-600 text-white"
                            : "text-zinc-500 hover:text-white hover:bg-zinc-900/90"
                        )}
                      >
                        <Link href={href} className="flex items-center justify-center w-full h-full">
                          <Icon className="w-5 h-5" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center gap-3 h-10 px-3 rounded-lg transition-colors text-sm font-medium",
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-zinc-500 hover:text-white hover:bg-zinc-900/90"
                      )}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
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
          className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>
    </TooltipProvider>
  );
}
