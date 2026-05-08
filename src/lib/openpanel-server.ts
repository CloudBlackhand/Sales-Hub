import { OpenPanel } from "@openpanel/nextjs";

const DEFAULT_API = "https://api.openpanel.dev";

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, "");
}

function createServerClient(): OpenPanel | null {
  const clientId = process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID;
  const clientSecret = process.env.OPENPANEL_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const apiUrl = normalizeBaseUrl(
    process.env.OPENPANEL_API_URL ||
      process.env.NEXT_PUBLIC_OPENPANEL_API_URL ||
      DEFAULT_API
  );

  return new OpenPanel({
    clientId,
    clientSecret,
    apiUrl,
    sdk: "sales-hub-server",
  });
}

let cached: OpenPanel | null | undefined;

export function getOpenPanelServer(): OpenPanel | null {
  if (cached === undefined) {
    cached = createServerClient();
  }
  return cached;
}

const COMPANY_GROUP_PREFIX = "company_" as const;

export function openPanelCompanyGroupId(companyId: string): string {
  return `${COMPANY_GROUP_PREFIX}${companyId}`;
}

/** Garante o grupo da empresa e envia evento de venda (sem PII). */
export async function trackOpenPanelSaleCreated(params: {
  profileId: string;
  companyId: string;
  companyName: string;
  companySlug: string;
  saleId: string;
  saleNumber: number;
  saleType: string;
  status: string;
  totalAmount: number;
  itemsCount: number;
}): Promise<void> {
  const op = getOpenPanelServer();
  if (!op) return;

  const groupId = openPanelCompanyGroupId(params.companyId);

  try {
    await op.upsertGroup({
      id: groupId,
      type: "company",
      name: params.companyName,
      properties: { slug: params.companySlug },
    });

    await op.track("sale_created", {
      profileId: params.profileId,
      groups: [groupId],
      company_id: params.companyId,
      sale_id: params.saleId,
      sale_number: params.saleNumber,
      sale_type: params.saleType,
      status: params.status,
      total_amount: params.totalAmount,
      items_count: params.itemsCount,
    });

    if (params.totalAmount > 0) {
      await op.revenue(params.totalAmount, {
        profileId: params.profileId,
        groups: [groupId],
        currency: "BRL",
        sale_id: params.saleId,
        company_id: params.companyId,
      });
    }
  } catch (e) {
    console.error("[openpanel] sale_created", e);
  }
}

export async function trackOpenPanelSaleStatusChanged(params: {
  profileId: string;
  companyId: string;
  companyName: string;
  companySlug: string;
  saleId: string;
  saleNumber: number;
  fromStatus: string;
  toStatus: string;
}): Promise<void> {
  const op = getOpenPanelServer();
  if (!op) return;

  const groupId = openPanelCompanyGroupId(params.companyId);

  try {
    await op.upsertGroup({
      id: groupId,
      type: "company",
      name: params.companyName,
      properties: { slug: params.companySlug },
    });

    await op.track("sale_status_changed", {
      profileId: params.profileId,
      groups: [groupId],
      company_id: params.companyId,
      sale_id: params.saleId,
      sale_number: params.saleNumber,
      from_status: params.fromStatus,
      to_status: params.toStatus,
    });
  } catch (e) {
    console.error("[openpanel] sale_status_changed", e);
  }
}
