import type { Metadata, Viewport } from "next";
import { PWAHead } from "@/components/pwa/pwa-head";

export const metadata: Metadata = {
  title: "Kodayak Manager",
  description: "Manage your events and track shots remaining",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kodayak",
  },
};

export const viewport: Viewport = {
  themeColor: "#E91E63",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function MobileAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <PWAHead
        manifest="/app-manifest.json"
        serviceWorker="/app-sw.js"
        themeColor="#E91E63"
      />
      {children}
    </div>
  );
}
