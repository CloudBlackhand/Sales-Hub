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
import { Seller, ActivityStatus, PostSaleType } from "@/generated/prisma";
import { getPostSaleActivities, updateActivityStatus } from "@/server/actions/post-sale";
import { Plus, MoreHorizontal, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { formatDate, formatDateTime } from "@/lib/utils";
import { PostSaleFormDialog } from "@/components/forms/post-sale-form-dialog";

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
  OPEN: "bg-yellow-900 text-yellow-300",
  IN_PROGRESS: "bg-blue-900 text-blue-300",
  RESOLVED: "bg-green-900 text-green-300",
  CANCELLED: "bg-gray-700 text-gray-400",
};

const statusLabels: Record<string, string> = {
  OPEN: "Aberto",
  IN_PROGRESS: "Em andamento",
  RESOLVED: "Resolvido",
  CANCELLED: "Cancelado",
};

const typeLabels: Record<string, string> = {
  FOLLOWUP: "Follow-up",
  COMPLAINT: "Reclamação",
  RETURN: "Devolução",
  FEEDBACK: "Feedback",
  DELIVERY: "Entrega",
  SUPPORT: "Suporte",
};

const typeColors: Record<string, string> = {
  FOLLOWUP: "bg-blue-900 text-blue-300",
  COMPLAINT: "bg-red-900 text-red-300",
  RETURN: "bg-orange-900 text-orange-300",
  FEEDBACK: "bg-purple-900 text-purple-300",
  DELIVERY: "bg-green-900 text-green-300",
  SUPPORT: "bg-cyan-900 text-cyan-300",
};

interface Props {
  companyId: string;
  initialActivities: { data: ActivityRow[]; total: number; page: number; perPage: number };
  sellers: Seller[];
}

export function PostSaleClient({ companyId, initialActivities, sellers }: Props) {
  const [activities, setActivities] = useState(initialActivities);
  const [page, setPage] = useState(initialActivities.page);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

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
      cell: ({ row }) => <span className="text-gray-400 text-sm">{row.original.assignedSeller?.name ?? "—"}</span>,
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
        ? <span className="text-gray-400 text-sm">{formatDateTime(row.original.scheduledAt)}</span>
        : <span className="text-gray-600">—</span>,
    },
    {
      accessorKey: "createdAt",
      header: "Criado em",
      cell: ({ row }) => <span className="text-gray-500 text-sm">{formatDate(row.original.createdAt)}</span>,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
            {row.original.status === "OPEN" && (
              <DropdownMenuItem className="text-blue-400 focus:bg-gray-700 cursor-pointer"
                onClick={() => handleStatusChange(row.original.id, ActivityStatus.IN_PROGRESS)}>
                <Clock className="w-4 h-4 mr-2" /> Em andamento
              </DropdownMenuItem>
            )}
            {["OPEN", "IN_PROGRESS"].includes(row.original.status) && (
              <DropdownMenuItem className="text-green-400 focus:bg-gray-700 cursor-pointer"
                onClick={() => handleStatusChange(row.original.id, ActivityStatus.RESOLVED)}>
                <CheckCircle className="w-4 h-4 mr-2" /> Resolver
              </DropdownMenuItem>
            )}
            {["OPEN", "IN_PROGRESS"].includes(row.original.status) && (
              <DropdownMenuItem className="text-red-400 focus:bg-gray-700 cursor-pointer"
                onClick={() => handleStatusChange(row.original.id, ActivityStatus.CANCELLED)}>
                <XCircle className="w-4 h-4 mr-2" /> Cancelar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pós-Venda</h1>
          <p className="text-gray-400 text-sm mt-1">{activities.total} atividade{activities.total !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Nova atividade
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
            <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="ALL" className="text-gray-200 focus:bg-gray-700">Todos</SelectItem>
              {Object.entries(statusLabels).map(([k, v]) => (
                <SelectItem key={k} value={k} className="text-gray-200 focus:bg-gray-700">{v}</SelectItem>
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
