import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Kodayak Camera",
  description: "Capture moments at this event",
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
    <div className="h-screen w-screen overflow-hidden bg-black">
      {children}
    </div>
  );
}
