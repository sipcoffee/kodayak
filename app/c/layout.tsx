import type { Metadata, Viewport } from "next";
import { PWAHead } from "@/components/pwa/pwa-head";

export const metadata: Metadata = {
  title: "Kodayak Camera",
  description: "Capture moments at this event",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Kodayak",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function CameraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-screen bg-black">
      <PWAHead
        manifest="/camera-manifest.json"
        serviceWorker="/camera-sw.js"
        themeColor="#000000"
      />
      {children}
    </div>
  );
}
