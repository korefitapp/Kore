import type { Metadata, Viewport } from "next";
import "./globals.css";
import { GlobalToasts } from "@/components/ui/GlobalToasts";
import { GlobalConfirm } from "@/components/ui/GlobalConfirm";

export const metadata: Metadata = {
  title: {
    default: "KORE — Saúde · Fitness · Nutrição",
    template: "%s · KORE",
  },
  description:
    "KORE Super App: nutrição, treino, marketplace local e gamificação em um só ecossistema.",
  applicationName: "KORE",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KORE",
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-kore-bg font-sans text-kore-ink antialiased">
        {children}
        <GlobalToasts />
        <GlobalConfirm />
      </body>
    </html>
  );
}
