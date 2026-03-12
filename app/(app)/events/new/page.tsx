"use client";

import EventForm from "@/components/forms/event-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function EventFormWithParams() {
  const searchParams = useSearchParams();
  const filmId = searchParams.get("filmId");

  return <EventForm mode="create" preselectedFilmId={filmId} />;
}

function EventFormLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/events">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create Event</h1>
          <p className="text-muted-foreground">
            Set up your event to start capturing moments
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Suspense fallback={<EventFormLoading />}>
          <EventFormWithParams />
        </Suspense>
      </div>
    </div>
  );
}
