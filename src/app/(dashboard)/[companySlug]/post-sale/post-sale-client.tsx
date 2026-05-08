"use client";

import { useState, useCallback, useTransition } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Seller, ActivityStatus, PostSaleType } from "@/lib/prisma-types";
import { getPostSaleActivities, updateActivityStatus } from "@/server/actions/post-sale";
import { Plus, MoreHorizontal, CheckCircle, XCircle, Clock, CalendarDays, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { formatDate, formatDateTime } from "@/lib/utils";
import { PostSaleFormDialog } from "@/components/forms/post-sale-form-dialog";
import { dashboardToolbar } from "@/lib/dashboard-ui-strings";

type ActivityRow = {
  id: string;
  type: PostSaleType;
  status: ActivityStatus;
  title: string | null;
  notes: string | null;
  scheduledAt: Date | null;
  createdAt: Date;
  sale: { id: string; number: number };
  assignedSeller: { id: string; name: string } | null;
};

const statusColors: Record<string, string> = {
  OPEN: "bg-zinc-700 text-zinc-200",
  IN_PROGRESS: "bg-zinc-100 text-zinc-900",
  RESOLVED: "bg-zinc-100 text-zinc-900",
  CANCELLED: "bg-zinc-800 text-zinc-400",
};

const statusLabels: Record<string, string> = {
  OPEN: "Aberto",
  IN_PROGRESS: "Em andamento",
  RESOLVED: "Resolvido",
  CANCELLED: "Cancelado",
};

const typeLabels: Record<string, string> = {
  FOLLOWUP: "Acompanhamento",
  COMPLAINT: "Reclamação",
  RETURN: "Devolução",
  FEEDBACK: "Feedback",
  DELIVERY: "Entrega",
  SUPPORT: "Suporte",
};

const typeColors: Record<string, string> = {
  FOLLOWUP: "bg-zinc-700 text-zinc-200",
  COMPLAINT: "bg-zinc-800 text-zinc-300",
  RETURN: "bg-zinc-800 text-zinc-300",
  FEEDBACK: "bg-zinc-700 text-zinc-200",
  DELIVERY: "bg-zinc-100 text-zinc-900",
  SUPPORT: "bg-zinc-700 text-zinc-200",
};

interface Props {
  companyId: string;
  companySlug: string;
  initialActivities: { data: ActivityRow[]; total: number; page: number; perPage: number };
  sellers: Seller[];
}

export function PostSaleClient({ companyId, initialActivities, sellers }: Props) {
  const [activities, setActivities] = useState(initialActivities);
  const [page, setPage] = useState(initialActivities.page);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [, startTransition] = useTransition();

  const fetch = useCallback(async (p: number, status: string) => {
    setLoading(true);
    const r = await getPostSaleActivities(companyId, {
      page: p,
      status: (status !== "ALL" ? status : undefined) as never,
    });
    setActivities(r as never);
    setPage(p);
    setLoading(false);
  }, [companyId]);

  async function handleStatusChange(id: string, status: ActivityStatus) {
    startTransition(async () => {
      const r = await updateActivityStatus(companyId, id, status);
      if (r.success) { toast.success("Status atualizado"); fetch(page, statusFilter); }
      else toast.error(r.error);
    });
  }

  const columns: ColumnDef<ActivityRow>[] = [
    {
      accessorKey: "sale",
      header: "Venda",
      cell: ({ row }) => <span className="font-mono text-gray-300">#{row.original.sale.number}</span>,
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge className={`${typeColors[row.original.type] ?? ""} border-0 text-xs`}>
          {typeLabels[row.original.type] ?? row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: "title",
      header: "Título",
      cell: ({ row }) => <span className="text-gray-200">{row.original.title ?? row.original.notes?.slice(0, 40) ?? "—"}</span>,
    },
    {
      accessorKey: "assignedSeller",
      header: "Responsável",
      cell: ({ row }) => <span className="text-sm text-gray-400">{row.original.assignedSeller?.name ?? "—"}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge className={`${statusColors[row.original.status] ?? ""} border-0 text-xs`}>
          {statusLabels[row.original.status] ?? row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "scheduledAt",
      header: "Agendado",
      cell: ({ row }) => row.original.scheduledAt
        ? <span className="text-sm text-gray-400">{formatDateTime(row.original.scheduledAt)}</span>
        : <span className="text-gray-600">—</span>,
    },
    {
      accessorKey: "createdAt",
      header: "Criado em",
      cell: ({ row }) => <span className="text-sm text-gray-500">{formatDate(row.original.createdAt)}</span>,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-100">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="border-gray-700 bg-gray-800">
            {row.original.status === "OPEN" && (
              <DropdownMenuItem className="cursor-pointer text-blue-400 focus:bg-gray-700"
                onClick={() => handleStatusChange(row.original.id, ActivityStatus.IN_PROGRESS)}>
                <Clock className="mr-2 h-4 w-4" /> Em andamento
              </DropdownMenuItem>
            )}
            {["OPEN", "IN_PROGRESS"].includes(row.original.status) && (
              <DropdownMenuItem className="cursor-pointer text-green-400 focus:bg-gray-700"
                onClick={() => handleStatusChange(row.original.id, ActivityStatus.RESOLVED)}>
                <CheckCircle className="mr-2 h-4 w-4" /> Resolver
              </DropdownMenuItem>
            )}
            {["OPEN", "IN_PROGRESS"].includes(row.original.status) && (
              <DropdownMenuItem className="cursor-pointer text-red-400 focus:bg-gray-700"
                onClick={() => handleStatusChange(row.original.id, ActivityStatus.CANCELLED)}>
                <XCircle className="mr-2 h-4 w-4" /> Cancelar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" className="h-8 border-zinc-800 bg-zinc-900 px-2.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
          <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
          {dashboardToolbar.lastMonth}
        </Button>
        <Button size="sm" variant="outline" className="h-8 border-zinc-800 bg-zinc-900 px-2.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
          {dashboardToolbar.day}
        </Button>
        <Button size="sm" variant="outline" className="h-8 border-zinc-800 bg-zinc-900 px-2.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
          <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
          {dashboardToolbar.filters}
        </Button>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Pós-venda</h1>
          <p className="mt-1 text-xs text-zinc-500">{activities.total} atividades</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="h-8 gap-2 bg-zinc-100 px-3 text-xs font-medium text-zinc-900 hover:bg-zinc-200">
          <Plus className="h-3.5 w-3.5" /> Nova atividade
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={activities.data}
        total={activities.total}
        page={page}
        perPage={activities.perPage}
        onPageChange={(p) => fetch(p, statusFilter)}
        loading={loading}
        toolbar={
          <Select value={statusFilter} onValueChange={(v) => { const val = v ?? "ALL"; setStatusFilter(val); fetch(1, val); }}>
            <SelectTrigger className="h-8 w-40 border-zinc-800 bg-zinc-900 text-xs text-zinc-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-zinc-800 bg-zinc-900">
              <SelectItem value="ALL" className="text-zinc-200 focus:bg-zinc-800">Todos</SelectItem>
              {Object.entries(statusLabels).map(([k, v]) => (
                <SelectItem key={k} value={k} className="text-zinc-200 focus:bg-zinc-800">{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <PostSaleFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        companyId={companyId}
        sellers={sellers}
        onSuccess={() => { setDialogOpen(false); fetch(1, statusFilter); toast.success("Atividade criada!"); }}
      />
    </div>
  );
}
