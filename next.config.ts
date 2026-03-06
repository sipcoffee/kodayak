import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  // Use custom worker with offline upload queue functionality
  customWorkerDir: "worker",
  // Disable PWA in development unless explicitly enabled
  disable: process.env.NODE_ENV === "development" && !process.env.ENABLE_PWA,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["192.168.254.100"],
  // Enable PWA headers
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        // Camera pages need specific permissions policy
        source: "/c/:path*",
        headers: [
          {
            key: "Permissions-Policy",
            value: "camera=*, microphone=()",
          },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
