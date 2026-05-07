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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MemberRole } from "@/generated/prisma";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: MemberRole[];
}

const navItems: NavItem[] = [
  { label: "Visão Geral", href: "overview", icon: LayoutDashboard },
  { label: "Vendas", href: "sales", icon: ShoppingCart },
  { label: "Clientes", href: "customers", icon: Users },
  { label: "Produtos", href: "products", icon: Package },
  { label: "Vendedores", href: "sellers", icon: UserCheck, roles: [MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MANAGER] },
  { label: "Pós-Venda", href: "post-sale", icon: MessageSquare },
  { label: "Financeiro", href: "financial", icon: DollarSign, roles: [MemberRole.OWNER, MemberRole.ADMIN] },
  { label: "Configurações", href: "settings", icon: Settings, roles: [MemberRole.OWNER, MemberRole.ADMIN] },
];

interface SidebarProps {
  companySlug: string;
  role: MemberRole;
}

export function Sidebar({ companySlug, role }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "relative flex flex-col bg-gray-900 border-r border-gray-800 transition-all duration-300",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <div className={cn(
          "flex items-center border-b border-gray-800 h-16 px-4",
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
                            : "text-gray-400 hover:text-white hover:bg-gray-800"
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
                          : "text-gray-400 hover:text-white hover:bg-gray-800"
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
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-600 transition-colors z-10"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>
    </TooltipProvider>
  );
}
