"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const eventSchema = z.object({
  name: z.string().min(2, "Event name must be at least 2 characters"),
  description: z.string().optional(),
  photoLimit: z.string().min(1, "Photo limit is required"),
  expiresAt: z.string().min(1, "Expiry date is required"),
  isGalleryPublic: z.boolean(),
  primaryColor: z.string(),
  welcomeMessage: z.string().optional(),
});

type EventValues = z.infer<typeof eventSchema>;

interface EventFormProps {
  initialData?: Partial<EventValues> & { id?: string };
  mode?: "create" | "edit";
}

export default function EventForm({ initialData, mode = "create" }: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default expiry to 3 days from now
  const defaultExpiry = new Date();
  defaultExpiry.setDate(defaultExpiry.getDate() + 3);

  const form = useForm<EventValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      photoLimit: initialData?.photoLimit || "100",
      expiresAt: initialData?.expiresAt || defaultExpiry.toISOString().split("T")[0],
      isGalleryPublic: initialData?.isGalleryPublic || false,
      primaryColor: initialData?.primaryColor || "#E91E63",
      welcomeMessage: initialData?.welcomeMessage || "",
    },
  });

  async function onSubmit(values: EventValues) {
    setLoading(true);
    setError(null);

    try {
      const url = mode === "edit" && initialData?.id
        ? `/api/events/${initialData.id}`
        : "/api/events";

      const response = await fetch(url, {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save event");
      }

      const event = await response.json();
      router.push(`/events/${event.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "edit" ? "Edit Event" : "Create New Event"}</CardTitle>
        <CardDescription>
          {mode === "edit"
            ? "Update your event details"
            : "Set up your event and start capturing moments"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="My Wedding Reception" />
                  </FormControl>
                  <FormDescription>
                    This will be displayed to your guests
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Tell your guests about the event..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="photoLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Photo Limit *</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="1" max="10000" />
                    </FormControl>
                    <FormDescription>
                      Maximum photos for this event
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input {...field} type="date" />
                        <CalendarIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Event will close after this date
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="welcomeMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Welcome Message</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Welcome to our event! Snap away and capture the moments..."
                      rows={2}
                    />
                  </FormControl>
                  <FormDescription>
                    Shown to guests when they open the camera
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="primaryColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Theme Color</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-3">
                      <Input {...field} type="color" className="h-10 w-16 cursor-pointer p-1" />
                      <Input
                        value={field.value}
                        onChange={field.onChange}
                        className="flex-1"
                        placeholder="#E91E63"
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Customize the camera interface color
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isGalleryPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Public Gallery</FormLabel>
                    <FormDescription>
                      Allow guests to view all photos from the event
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "edit" ? "Save Changes" : "Create Event"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
