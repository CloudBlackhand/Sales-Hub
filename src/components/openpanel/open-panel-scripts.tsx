"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const OpenPanelLazy = dynamic(
  () => import("@openpanel/nextjs").then((m) => m.OpenPanelComponent),
  { ssr: false }
);

/** Snippet OpenPanel só no cliente — evita erro de hidratação (#418) por scripts no SSR. */
export function OpenPanelScripts(props: ComponentProps<typeof OpenPanelLazy>) {
  return <OpenPanelLazy {...props} />;
}

const IdentifyLazy = dynamic(
  () => import("@openpanel/nextjs").then((m) => m.IdentifyComponent),
  { ssr: false }
);

export function IdentifyOpenPanel(props: ComponentProps<typeof IdentifyLazy>) {
  return <IdentifyLazy {...props} />;
}
