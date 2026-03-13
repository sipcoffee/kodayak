"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  MoreHorizontal,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { fetcher } from "@/lib/swr";

interface Event {
  id: string;
  name: string;
  slug: string;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "EXPIRED" | "COMPLETED";
  guestPhotoLimit: number;
  expiresAt: string;
  isGalleryPublic: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  _count: {
    photos: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface EventsResponse {
  events: Event[];
  pagination: Pagination;
}

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
  { value: "PAUSED", label: "Paused" },
  { value: "EXPIRED", label: "Expired" },
  { value: "COMPLETED", label: "Completed" },
];

export default function AdminEventsPage() {
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Edit dialog
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    status: "",
    guestPhotoLimit: "",
    expiresAt: "",
    isGalleryPublic: false,
  });
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteEvent, setDeleteEvent] = useState<Event | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data, isLoading, mutate } = useSWR<EventsResponse>(
    `/api/admin/events?page=${page}&limit=10&search=${searchQuery}&status=${statusFilter === "all" ? "" : statusFilter}`,
    fetcher
  );

  const events = data?.events ?? [];
  const pagination = data?.pagination;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(search);
  };

  const handleEdit = (event: Event) => {
    setEditEvent(event);
    setEditForm({
      name: event.name,
      status: event.status,
      guestPhotoLimit: event.guestPhotoLimit.toString(),
      expiresAt: new Date(event.expiresAt).toISOString().split("T")[0],
      isGalleryPublic: event.isGalleryPublic,
    });
  };

  const handleSaveEdit = async () => {
    if (!editEvent) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/events/${editEvent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!response.ok) throw new Error("Failed to update event");
      setEditEvent(null);
      mutate();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteEvent) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/events/${deleteEvent.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete event");
      setDeleteEvent(null);
      mutate();
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: Event["status"]) => {
    const colors = {
      DRAFT: "bg-gray-500",
      ACTIVE: "bg-green-500",
      PAUSED: "bg-yellow-500",
      EXPIRED: "bg-red-500",
      COMPLETED: "bg-blue-500",
    };
    return colors[status];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Events</h1>
        <p className="text-muted-foreground">
          Manage all events across the platform.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Events</CardTitle>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
              </form>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : events.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No events found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Photos</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{event.name}</p>
                          <p className="text-sm text-muted-foreground font-mono">
                            /{event.slug}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{event.user.name || "—"}</p>
                          <p className="text-sm text-muted-foreground">
                            {event.user.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {event._count.photos} ({event.guestPhotoLimit}/guest)
                      </TableCell>
                      <TableCell>
                        {new Date(event.expiresAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(event.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <a
                                href={`/c/${event.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View Camera
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(event)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteEvent(event)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {(page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(page * pagination.limit, pagination.total)} of{" "}
                    {pagination.total} events
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === pagination.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editEvent} onOpenChange={() => setEditEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>Update event details and settings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Event Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(value) => setEditForm({ ...editForm, status: value })}
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
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="guestPhotoLimit">Guest Photo Limit</Label>
                <Input
                  id="guestPhotoLimit"
                  type="number"
                  value={editForm.guestPhotoLimit}
                  onChange={(e) =>
                    setEditForm({ ...editForm, guestPhotoLimit: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expires At</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={editForm.expiresAt}
                  onChange={(e) =>
                    setEditForm({ ...editForm, expiresAt: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditEvent(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteEvent} onOpenChange={() => setDeleteEvent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteEvent?.name}&quot;?
              This will also delete all photos associated with this event.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
