import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { OpenPanelScripts } from "@/components/openpanel/open-panel-scripts";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Sales Hub",
    template: "%s | Sales Hub",
  },
  description: "Plataforma completa de gestão de vendas, aluguéis e serviços",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const openPanelClientId = process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID;
  const useOpenPanelProxy = process.env.NEXT_PUBLIC_OPENPANEL_USE_PROXY === "1";
  const openPanelApiUrl = useOpenPanelProxy
    ? "/api/op"
    : process.env.NEXT_PUBLIC_OPENPANEL_API_URL;
  const openPanelScriptUrl = useOpenPanelProxy
    ? "/api/op/op1.js"
    : process.env.NEXT_PUBLIC_OPENPANEL_SCRIPT_URL;

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} dark antialiased`}>
        {openPanelClientId ? (
          <OpenPanelScripts
            clientId={openPanelClientId}
            trackScreenViews
            trackOutgoingLinks={false}
            {...(openPanelApiUrl ? { apiUrl: openPanelApiUrl } : {})}
            {...(openPanelScriptUrl ? { scriptUrl: openPanelScriptUrl } : {})}
            globalProperties={{
              app: process.env.NEXT_PUBLIC_APP_NAME ?? "Sales Hub",
            }}
          />
        ) : null}
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
