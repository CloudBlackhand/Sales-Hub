"use client";

import { useEffect, useState } from "react";
import { ExternalLink, HelpCircle } from "lucide-react";

type Props = {
  dashboardUrl: string;
};

const HELP =
  "Mesmo dashboard do projeto OpenPanel (funis, eventos, receita). O resumo operacional do CRM continua em Visão Geral.";

export function OpenPanelEmbed({ dashboardUrl }: Props) {
  const [blockedHint, setBlockedHint] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setBlockedHint(true), 12_000);
    return () => window.clearTimeout(t);
  }, [dashboardUrl]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-black">
      <header className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-zinc-900 bg-black px-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-sm font-semibold tracking-tight text-zinc-100">OpenPanel</span>
          <span className="hidden text-xs text-zinc-600 sm:inline">·</span>
          <span className="hidden truncate text-xs text-zinc-500 sm:inline">Analytics em tempo real</span>
          <button
            type="button"
            className="ml-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-zinc-300"
            title={HELP}
            aria-label={HELP}
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
        <a
          href={dashboardUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 shrink-0 items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-xs font-medium tracking-wide text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
        >
          <ExternalLink className="h-3.5 w-3.5 opacity-80" />
          Abrir externo
        </a>
      </header>

      <div className="relative min-h-0 flex-1 bg-black">
        <iframe
          title="OpenPanel"
          src={dashboardUrl}
          className="absolute inset-0 h-full w-full border-0 bg-black"
          referrerPolicy="strict-origin-when-cross-origin"
        />
        {blockedHint ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-zinc-900 bg-zinc-950/95 px-4 py-2.5 text-center text-[11px] leading-relaxed text-zinc-500">
            Ecrã em branco? O teu OpenPanel pode bloquear iframes (
            <code className="text-zinc-400">frame-ancestors</code>
            ). Usa <span className="text-zinc-400">Abrir externo</span> ou permite o domínio do Sales Hub no
            self-host.
          </div>
        ) : null}
      </div>
    </div>
  );
}
