import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { OpenPanelComponent } from "@openpanel/nextjs";
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
  const openPanelApiUrl = process.env.NEXT_PUBLIC_OPENPANEL_API_URL;
  const openPanelUseProxy =
    process.env.NEXT_PUBLIC_OPENPANEL_USE_PROXY === "1" ||
    process.env.NEXT_PUBLIC_OPENPANEL_USE_PROXY === "true";

  const openPanelUrls = openPanelUseProxy
    ? { apiUrl: "/api/op", scriptUrl: "/api/op/op1.js" as const }
    : openPanelApiUrl
      ? { apiUrl: openPanelApiUrl }
      : {};

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        {openPanelClientId ? (
          <OpenPanelComponent
            clientId={openPanelClientId}
            trackScreenViews
            trackOutgoingLinks={false}
            {...openPanelUrls}
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
