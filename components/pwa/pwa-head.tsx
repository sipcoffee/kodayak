"use client";

import { useEffect } from "react";

interface PWAHeadProps {
  manifest: string;
  serviceWorker: string;
  themeColor?: string;
}

export function PWAHead({ manifest, serviceWorker, themeColor = "#E91E63" }: PWAHeadProps) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register(serviceWorker)
        .then((registration) => {
          console.log("SW registered for scope:", registration.scope);

          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  console.log("New content available, please refresh.");
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error("SW registration failed:", error);
        });
    }
  }, [serviceWorker]);

  return (
    <>
      <link rel="manifest" href={manifest} />
      <meta name="theme-color" content={themeColor} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="mobile-web-app-capable" content="yes" />
      <link rel="apple-touch-icon" href="/icons/icon-192.png" />
    </>
  );
}
