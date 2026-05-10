"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverHeader,
  PopoverTitle,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { dashboardToolbar } from "@/lib/dashboard-ui-strings";
import { cn } from "@/lib/utils";
import { resolveDashboardPeriod } from "@/lib/dashboard-period";

function formatDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function mergePeriodIntoUrl(
  pathname: string,
  current: URLSearchParams,
  update: { period: string; from?: string; to?: string }
): string {
  const next = new URLSearchParams(current.toString());
  next.delete("page");
  next.set("period", update.period);
  if (update.period === "custom" && update.from && update.to) {
    next.set("from", update.from);
    next.set("to", update.to);
  } else {
    next.delete("from");
    next.delete("to");
  }
  const q = next.toString();
  return q ? `${pathname}?${q}` : pathname;
}

function DashboardPeriodToolbarFallback() {
  return (
    <div className="flex flex-wrap gap-2">
      <div className="h-8 w-28 animate-pulse rounded-md bg-zinc-900" />
      <div className="h-8 w-12 animate-pulse rounded-md bg-zinc-900" />
      <div className="h-8 w-24 animate-pulse rounded-md bg-zinc-900" />
    </div>
  );
}

function DashboardPeriodToolbarInner({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const resolved = useMemo(() => {
    return resolveDashboardPeriod({
      period: searchParams.get("period") ?? undefined,
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
    });
  }, [searchParams]);

  const [customFrom, setCustomFrom] = useState(() => formatDateInput(resolved.from));
  const [customTo, setCustomTo] = useState(() => formatDateInput(resolved.to));
  const [filtersOpen, setFiltersOpen] = useState(false);

  const pushPeriod = useCallback(
    (period: string, from?: string, to?: string) => {
      const href = mergePeriodIntoUrl(pathname, searchParams, {
        period,
        from,
        to,
      });
      router.push(href);
      router.refresh();
    },
    [pathname, router, searchParams]
  );

  const onApplyCustom = useCallback(() => {
    if (!customFrom || !customTo || customFrom > customTo) return;
    pushPeriod("custom", customFrom, customTo);
    setFiltersOpen(false);
  }, [customFrom, customTo, pushPeriod]);

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className={cn(
          "h-8 border-zinc-800 bg-zinc-900 px-2.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100",
          resolved.preset === "last_month" && "border-zinc-500 bg-zinc-800 text-zinc-100"
        )}
        onClick={() => pushPeriod("last_month")}
      >
        <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
        {dashboardToolbar.lastMonth}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className={cn(
          "h-8 border-zinc-800 bg-zinc-900 px-2.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100",
          resolved.preset === "today" && "border-zinc-500 bg-zinc-800 text-zinc-100"
        )}
        onClick={() => pushPeriod("today")}
      >
        {dashboardToolbar.day}
      </Button>
      <Popover
        open={filtersOpen}
        onOpenChange={(open) => {
          setFiltersOpen(open);
          if (open) {
            setCustomFrom(formatDateInput(resolved.from));
            setCustomTo(formatDateInput(resolved.to));
          }
        }}
      >
        <PopoverTrigger
          render={
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={cn(
                "h-8 border-zinc-800 bg-zinc-900 px-2.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100",
                (resolved.preset === "this_month" || resolved.preset === "custom") &&
                  "border-zinc-500 bg-zinc-800 text-zinc-100"
              )}
            >
              <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
              {dashboardToolbar.filters}
            </Button>
          }
        />
        <PopoverContent align="start" className="w-[min(100vw-2rem,20rem)] border-zinc-800 bg-zinc-950 p-3 text-zinc-200">
          <PopoverHeader>
            <PopoverTitle className="text-zinc-100">Período</PopoverTitle>
          </PopoverHeader>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start text-xs text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100"
              onClick={() => {
                pushPeriod("this_month");
                setFiltersOpen(false);
              }}
            >
              Este mês
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start text-xs text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100"
              onClick={() => {
                pushPeriod("last_month");
                setFiltersOpen(false);
              }}
            >
              Último mês
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start text-xs text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100"
              onClick={() => {
                pushPeriod("today");
                setFiltersOpen(false);
              }}
            >
              Hoje
            </Button>
            <div className="my-1 border-t border-zinc-800" />
            <p className="text-[11px] uppercase tracking-wide text-zinc-500">Intervalo</p>
            <div className="grid gap-2">
              <div className="space-y-1">
                <Label htmlFor="dash-period-from" className="text-xs text-zinc-400">
                  De
                </Label>
                <Input
                  id="dash-period-from"
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="h-8 border-zinc-800 bg-zinc-900 text-xs text-zinc-200"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dash-period-to" className="text-xs text-zinc-400">
                  Até
                </Label>
                <Input
                  id="dash-period-to"
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="h-8 border-zinc-800 bg-zinc-900 text-xs text-zinc-200"
                />
              </div>
              <Button
                type="button"
                size="sm"
                className="mt-1 h-8 bg-zinc-100 text-xs text-zinc-900 hover:bg-zinc-200"
                onClick={onApplyCustom}
              >
                Aplicar intervalo
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function DashboardPeriodToolbar({ className }: { className?: string }) {
  return (
    <Suspense fallback={<DashboardPeriodToolbarFallback />}>
      <DashboardPeriodToolbarInner className={className} />
    </Suspense>
  );
}
