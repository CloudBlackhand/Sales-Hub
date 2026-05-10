/**
 * Converte valores Decimal do Prisma (ou equivalentes) em number para respostas JSON e tipos de cliente.
 */
export function decimalToNumber(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (typeof value === "object" && value !== null && "toNumber" in value) {
    const n = (value as { toNumber: () => number }).toNumber();
    return typeof n === "number" && !Number.isNaN(n) ? n : Number(value);
  }
  return Number(value);
}
