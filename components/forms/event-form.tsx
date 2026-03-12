"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2, Film, Plus, AlertCircle } from "lucide-react";
import useSWR from "swr";
import { fetcher } from "@/lib/swr";
import Link from "next/link";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Plan {
  id: string;
  name: string;
  type: "BASIC" | "STANDARD" | "PREMIUM";
  photoLimit: number;
  eventDuration: number;
}

interface UserFilm {
  id: string;
  status: string;
  plan: Plan;
}

const createEventSchema = z.object({
  filmId: z.string().min(1, "Please select a film"),
  name: z.string().min(2, "Event name must be at least 2 characters"),
  description: z.string().optional(),
  isGalleryPublic: z.boolean(),
  primaryColor: z.string(),
  welcomeMessage: z.string().optional(),
});

const editEventSchema = z.object({
  name: z.string().min(2, "Event name must be at least 2 characters"),
  description: z.string().optional(),
  photoLimit: z.string().min(1, "Photo limit is required"),
  expiresAt: z.string().min(1, "Expiry date is required"),
  isGalleryPublic: z.boolean(),
  primaryColor: z.string(),
  welcomeMessage: z.string().optional(),
});

type CreateEventValues = z.infer<typeof createEventSchema>;
type EditEventValues = z.infer<typeof editEventSchema>;
type EventValues = CreateEventValues | EditEventValues;

interface EventFormProps {
  initialData?: Partial<EditEventValues> & { id?: string };
  mode?: "create" | "edit";
  preselectedFilmId?: string | null;
}

export default function EventForm({ initialData, mode = "create", preselectedFilmId }: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilm, setSelectedFilm] = useState<UserFilm | null>(null);

  // Fetch available films for create mode
  const { data: availableFilms, isLoading: filmsLoading } = useSWR<UserFilm[]>(
    mode === "create" ? "/api/films/available" : null,
    fetcher
  );

  // Default expiry to 3 days from now (for edit mode)
  const defaultExpiry = new Date();
  defaultExpiry.setDate(defaultExpiry.getDate() + 3);

  const form = useForm<EventValues>({
    resolver: zodResolver(mode === "create" ? createEventSchema : editEventSchema),
    defaultValues: mode === "create"
      ? {
          filmId: preselectedFilmId || "",
          name: "",
          description: "",
          isGalleryPublic: false,
          primaryColor: "#E91E63",
          welcomeMessage: "",
        }
      : {
          name: initialData?.name || "",
          description: initialData?.description || "",
          photoLimit: initialData?.photoLimit || "100",
          expiresAt: initialData?.expiresAt || defaultExpiry.toISOString().split("T")[0],
          isGalleryPublic: initialData?.isGalleryPublic || false,
          primaryColor: initialData?.primaryColor || "#E91E63",
          welcomeMessage: initialData?.welcomeMessage || "",
        },
  });

  // Set preselected film when films are loaded
  useEffect(() => {
    if (preselectedFilmId && availableFilms) {
      const film = availableFilms.find((f) => f.id === preselectedFilmId);
      if (film) {
        setSelectedFilm(film);
        form.setValue("filmId" as keyof EventValues, preselectedFilmId);
      }
    }
  }, [preselectedFilmId, availableFilms, form]);

  // Update selected film when filmId changes
  const handleFilmChange = (filmId: string) => {
    const film = availableFilms?.find((f) => f.id === filmId);
    setSelectedFilm(film || null);
    form.setValue("filmId" as keyof EventValues, filmId);
  };

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

  // Show loading state for films
  if (mode === "create" && filmsLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading available films...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show no films message for create mode
  if (mode === "create" && (!availableFilms || availableFilms.length === 0)) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center px-4">
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-pink-500/20 rounded-full blur-xl" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-pink-500">
              <Film className="h-10 w-10 text-white" />
            </div>
          </div>
          <h3 className="mb-2 text-lg font-semibold">No Films Available</h3>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            You need to purchase a film before creating an event. Each film gives you the photo limit and duration for your event.
          </p>
          <Button asChild>
            <Link href="/films/purchase">
              <Plus className="mr-2 h-4 w-4" />
              Buy Films
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "edit" ? "Edit Event" : "Create New Event"}</CardTitle>
        <CardDescription>
          {mode === "edit"
            ? "Update your event details"
            : "Select a film and set up your event"}
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
            {/* Film Selection - Only for Create Mode */}
            {mode === "create" && (
              <FormField
                control={form.control}
                name={"filmId" as keyof EventValues}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Film *</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleFilmChange(value);
                      }}
                      defaultValue={field.value as string}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a film to use">
                            {selectedFilm && (
                              <div className="flex items-center gap-2">
                                <Film className="h-4 w-4 text-primary" />
                                <span>{selectedFilm.plan.name}</span>
                                <span className="text-muted-foreground">
                                  ({selectedFilm.plan.photoLimit} photos, {selectedFilm.plan.eventDuration} days)
                                </span>
                              </div>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableFilms?.map((film) => (
                          <SelectItem key={film.id} value={film.id}>
                            <div className="flex items-center gap-2">
                              <Film className="h-4 w-4 text-primary" />
                              <span className="font-medium">{film.plan.name}</span>
                              <span className="text-muted-foreground text-sm">
                                ({film.plan.photoLimit} photos, {film.plan.eventDuration} days)
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The film determines your photo limit and event duration
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Show selected film details */}
            {mode === "create" && selectedFilm && (
              <Alert>
                <Film className="h-4 w-4" />
                <AlertTitle>Using {selectedFilm.plan.name} Film</AlertTitle>
                <AlertDescription>
                  This event will allow up to <strong>{selectedFilm.plan.photoLimit} photos</strong> and
                  will be active for <strong>{selectedFilm.plan.eventDuration} days</strong> from creation.
                </AlertDescription>
              </Alert>
            )}

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

            {/* Photo Limit and Expiry Date - Only for Edit Mode */}
            {mode === "edit" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name={"photoLimit" as keyof EventValues}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Photo Limit *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="10000"
                          value={field.value as string}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
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
                  name={"expiresAt" as keyof EventValues}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="date"
                            value={field.value as string}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
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
            )}

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
              <Button type="submit" disabled={loading || (mode === "create" && !selectedFilm)}>
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
