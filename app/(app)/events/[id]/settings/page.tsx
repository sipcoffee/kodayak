"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetcher } from "@/lib/swr";

interface Event {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "EXPIRED" | "COMPLETED";
  guestPhotoLimit: number;
  expiresAt: string;
  isGalleryPublic: boolean;
  primaryColor: string;
  welcomeMessage: string | null;
}

export default function EventSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { data: event, isLoading, mutate } = useSWR<Event>(
    `/api/events/${params.id}`,
    fetcher
  );

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "DRAFT" as Event["status"],
    guestPhotoLimit: "",
    expiresAt: "",
    isGalleryPublic: false,
    primaryColor: "#E91E63",
    welcomeMessage: "",
  });

  // Update form when event data loads
  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name,
        description: event.description || "",
        status: event.status,
        guestPhotoLimit: event.guestPhotoLimit.toString(),
        expiresAt: new Date(event.expiresAt).toISOString().split("T")[0],
        isGalleryPublic: event.isGalleryPublic,
        primaryColor: event.primaryColor || "#E91E63",
        welcomeMessage: event.welcomeMessage || "",
      });
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update event");
      }

      // Revalidate event data
      mutate();

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!event) return;
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete event");
      router.push("/events");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete event");
      setDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <p className="text-muted-foreground">Event not found</p>
        <Button asChild className="mt-4">
          <Link href="/events">Back to Events</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/events/${event.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Event Settings</h1>
          <p className="text-muted-foreground">{event.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-700">
            Settings saved successfully!
          </div>
        )}

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update your event details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Event Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="welcomeMessage">Welcome Message</Label>
              <Textarea
                id="welcomeMessage"
                value={formData.welcomeMessage}
                onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                rows={2}
                placeholder="Shown to guests when they open the camera"
              />
            </div>
          </CardContent>
        </Card>

        {/* Event Status */}
        <Card>
          <CardHeader>
            <CardTitle>Event Status</CardTitle>
            <CardDescription>Control the event state and availability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as Event["status"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PAUSED">Paused</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Only active events allow guests to upload photos
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="guestPhotoLimit">Guest Photo Limit</Label>
                <Input
                  id="guestPhotoLimit"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.guestPhotoLimit}
                  onChange={(e) => setFormData({ ...formData, guestPhotoLimit: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Max photos each guest can upload</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expiry Date</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gallery Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Gallery Settings</CardTitle>
            <CardDescription>Configure how guests see photos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Public Gallery</Label>
                <p className="text-sm text-muted-foreground">
                  Allow guests to view all photos from the event
                </p>
              </div>
              <Switch
                checked={formData.isGalleryPublic}
                onCheckedChange={(checked) => setFormData({ ...formData, isGalleryPublic: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Customization */}
        <Card>
          <CardHeader>
            <CardTitle>Customization</CardTitle>
            <CardDescription>Personalize the camera interface</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Theme Color</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="primaryColor"
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="h-10 w-16 cursor-pointer p-1"
                />
                <Input
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="flex-1"
                  placeholder="#E91E63"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href={`/events/${event.id}`}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Danger Zone */}
      <Card className="max-w-2xl border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that affect your event
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-medium">Delete Event</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete this event and all its photos
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleDeleteEvent}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Event
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
