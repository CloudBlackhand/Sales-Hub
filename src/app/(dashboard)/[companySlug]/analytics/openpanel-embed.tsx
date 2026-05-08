"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";

type Props = {
  dashboardUrl: string;
};

export function OpenPanelEmbed({ dashboardUrl }: Props) {
  const [blockedHint, setBlockedHint] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setBlockedHint(true), 12_000);
    return () => window.clearTimeout(t);
  }, [dashboardUrl]);

  return (
    <div className="flex flex-col gap-3 h-[calc(100dvh-4rem)] min-h-[480px] min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 shrink-0 px-1">
        <p className="text-sm text-gray-400">
          Dashboard OpenPanel (mesma UI que no{" "}
          <a
            href="https://demo.openpanel.dev/demo/shoey"
            className="text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            demo oficial
          </a>
          ). Os gráficos vivem neste painel, não na Visão Geral do CRM.
        </p>
        <a
          href={dashboardUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-gray-600 bg-transparent px-2.5 text-[0.8rem] font-medium text-gray-200 hover:bg-gray-800"
        >
          <ExternalLink className="w-4 h-4" />
          Abrir em nova janela
        </a>
      </div>
      <div className="relative flex-1 min-h-0 rounded-lg border border-gray-800 bg-gray-900 overflow-hidden">
        <iframe
          title="OpenPanel"
          src={dashboardUrl}
          className="absolute inset-0 h-full w-full border-0 bg-gray-950"
          referrerPolicy="strict-origin-when-cross-origin"
        />
        {blockedHint ? (
          <div className="absolute bottom-0 left-0 right-0 bg-gray-950/95 border-t border-gray-800 px-3 py-2 text-xs text-gray-400">
            Se o ecrã ficar em branco, o teu OpenPanel pode estar a bloquear iframes (
            <code className="text-gray-300">Content-Security-Policy: frame-ancestors</code>
            ). Nesse caso usa &quot;Abrir em nova janela&quot; ou self-host com{" "}
            <code className="text-gray-300">frame-ancestors</code> a incluir o domínio do Sales Hub.
          </div>
        ) : null}
      </div>
    </div>
  );
}
