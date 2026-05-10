/** Preset de período na query string (?period=...) */
export type DashboardPeriodPreset = "today" | "last_month" | "this_month" | "custom";

export interface ResolvedDashboardPeriod {
  preset: DashboardPeriodPreset;
  /** Início do intervalo (inclusivo), hora local */
  from: Date;
  /** Fim do intervalo (inclusivo), hora local */
  to: Date;
}

function pick(v?: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v ?? undefined;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

/** yyyy-mm-dd → Date em hora local */
export function parseLocalDateOnly(isoDay: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDay.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const day = Number(m[3]);
  const d = new Date(y, mo, day);
  if (d.getFullYear() !== y || d.getMonth() !== mo || d.getDate() !== day) return null;
  return d;
}

export function rangeToday(now = new Date()): { from: Date; to: Date } {
  return { from: startOfDay(now), to: endOfDay(now) };
}

export function rangeThisMonth(now = new Date()): { from: Date; to: Date } {
  const from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { from, to };
}

export function rangeLastMonth(now = new Date()): { from: Date; to: Date } {
  const y = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const m = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
  const from = new Date(y, m, 1, 0, 0, 0, 0);
  const to = new Date(y, m + 1, 0, 23, 59, 59, 999);
  return { from, to };
}

/**
 * Resolve período a partir de search params do Next.js.
 * Default (sem period): mês corrente (comportamento anterior da visão geral).
 */
export function resolveDashboardPeriod(sp: {
  period?: string | string[] | undefined;
  from?: string | string[] | undefined;
  to?: string | string[] | undefined;
}): ResolvedDashboardPeriod {
  const period = pick(sp.period);
  const fromStr = pick(sp.from);
  const toStr = pick(sp.to);

  if (period === "custom" && fromStr && toStr) {
    const a = parseLocalDateOnly(fromStr);
    const b = parseLocalDateOnly(toStr);
    if (a && b && a <= b) {
      return { preset: "custom", from: startOfDay(a), to: endOfDay(b) };
    }
  }
  if (period === "today") {
    const { from, to } = rangeToday();
    return { preset: "today", from, to };
  }
  if (period === "last_month") {
    const { from, to } = rangeLastMonth();
    return { preset: "last_month", from, to };
  }
  const { from, to } = rangeThisMonth();
  return { preset: "this_month", from, to };
}
