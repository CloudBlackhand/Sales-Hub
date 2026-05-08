import { OpenPanel } from "@openpanel/sdk";
import { SaleStatus } from "@/lib/prisma-types";

function getServerOpenPanel(): OpenPanel | null {
  const clientId =
    process.env.OPENPANEL_CLIENT_ID?.trim() ||
    process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID?.trim();
  const clientSecret = process.env.OPENPANEL_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;

  const apiUrl =
    process.env.OPENPANEL_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_OPENPANEL_API_URL?.trim() ||
    undefined;

  return new OpenPanel({
    clientId,
    clientSecret,
    ...(apiUrl ? { apiUrl } : {}),
    sdk: "sales-hub",
  });
}

function isRevenueStatus(status: SaleStatus): boolean {
  return status === SaleStatus.CONFIRMED || status === SaleStatus.DELIVERED;
}

export async function trackOpenPanelSaleCreated(params: {
  companySlug: string;
  saleId: string;
  saleNumber: number;
  status: SaleStatus;
  amount: number;
  profileId?: string;
}): Promise<void> {
  const op = getServerOpenPanel();
  if (!op) return;

  const { companySlug, saleId, saleNumber, status, amount, profileId } = params;
  const base = {
    companySlug,
    saleId,
    saleNumber,
    status,
    currency: "BRL",
    amount,
  };

  await op.track("sale_created", {
    ...base,
    ...(profileId ? { profileId } : {}),
  });

  if (isRevenueStatus(status)) {
    await op.revenue(amount, {
      ...base,
      ...(profileId ? { profileId } : {}),
    });
    await op.track("sale_confirmed", {
      ...base,
      ...(profileId ? { profileId } : {}),
    });
  }
}

export async function trackOpenPanelSaleStatusUpdated(params: {
  companySlug: string;
  saleId: string;
  saleNumber: number;
  previousStatus: SaleStatus;
  status: SaleStatus;
  amount: number;
  profileId?: string;
}): Promise<void> {
  const op = getServerOpenPanel();
  if (!op) return;

  const { companySlug, saleId, saleNumber, previousStatus, status, amount, profileId } = params;
  const common = {
    companySlug,
    saleId,
    saleNumber,
    previousStatus,
    status,
    currency: "BRL",
    amount,
    ...(profileId ? { profileId } : {}),
  };

  await op.track("sale_status_updated", common);

  if (isRevenueStatus(status) && !isRevenueStatus(previousStatus)) {
    await op.revenue(amount, common);
    await op.track("sale_confirmed", common);
  }
}
