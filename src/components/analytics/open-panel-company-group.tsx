"use client";

import { useEffect, useRef } from "react";

type OpenPanelCompanyGroupProps = {
  companyId: string;
  companyName: string;
  companySlug: string;
};

/**
 * Liga o utilizador ao grupo OpenPanel da empresa (cliente).
 * O script op1.js expõe `window.op` como fila de chamadas; upsertGroup/setGroup
 * existem no runtime do SDK embora não estejam no hook useOpenPanel.
 */
export function OpenPanelCompanyGroup({
  companyId,
  companyName,
  companySlug,
}: OpenPanelCompanyGroupProps) {
  const lastKey = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const op = window.op as unknown as ((...args: unknown[]) => void) | undefined;
    if (!op) return;

    const key = `${companyId}:${companySlug}`;
    if (lastKey.current === key) return;
    lastKey.current = key;

    const groupId = `company_${companyId}`;
    try {
      op("upsertGroup", {
        id: groupId,
        type: "company",
        name: companyName,
        properties: { slug: companySlug },
      });
      op("setGroup", groupId);
    } catch {
      // Versão do SDK sem estes comandos na fila — eventos server-side cobrem vendas.
    }
  }, [companyId, companyName, companySlug]);

  return null;
}
