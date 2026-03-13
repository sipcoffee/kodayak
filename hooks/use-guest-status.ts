"use client";

import useSWR from "swr";
import { getOrCreateGuestId } from "@/lib/image-utils";
import { fetcher } from "@/lib/swr";

interface GuestStatus {
  guestId: string;
  uploadedCount: number;
  limit: number;
  remaining: number;
  hasReachedLimit: boolean;
  guestName: string | null;
  eventStatus: string;
}

export function useGuestStatus(slug: string | null) {
  const guestId = typeof window !== "undefined" ? getOrCreateGuestId() : null;

  const { data, error, isLoading, mutate } = useSWR<GuestStatus>(
    slug && guestId ? `/api/c/${slug}/guest-status?guestId=${guestId}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );

  return {
    status: data,
    error,
    isLoading,
    mutate,
    guestId,
  };
}
