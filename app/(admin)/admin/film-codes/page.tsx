"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Loader2,
  Plus,
  Search,
  Ticket,
  Ban,
  Check,
} from "lucide-react";
import { toast } from "sonner";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

interface Plan {
  id: string;
  name: string;
  type: "BASIC" | "STANDARD" | "PREMIUM";
}

interface FilmCode {
  id: string;
  code: string;
  status: "ACTIVE" | "REDEEMED" | "EXPIRED" | "REVOKED";
  expiresAt: string | null;
  redeemedAt: string | null;
  createdAt: string;
  plan: Plan;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  };
  redeemedBy: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface FilmCodesResponse {
  filmCodes: FilmCode[];
  pagination: Pagination;
}

const statusConfig = {
  ACTIVE: {
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    label: "Active",
  },
  REDEEMED: {
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    label: "Redeemed",
  },
  EXPIRED: {
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    label: "Expired",
  },
  REVOKED: {
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    label: "Revoked",
  },
};

export default function AdminFilmCodesPage() {
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [page, setPage] = useState(1);

  // Generate dialog
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    planId: "",
    quantity: 1,
    expiresAt: "",
  });
  const [generating, setGenerating] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);

  // Revoke dialog
  const [revokeCode, setRevokeCode] = useState<FilmCode | null>(null);
  const [revoking, setRevoking] = useState(false);

  // Copied state for code copy
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const params = new URLSearchParams({
    page: page.toString(),
    limit: "10",
    ...(searchQuery && { search: searchQuery }),
    ...(statusFilter && { status: statusFilter }),
    ...(planFilter && { planId: planFilter }),
  });

  const { data, isLoading, mutate } = useSWR<FilmCodesResponse>(
    `/api/admin/film-codes?${params.toString()}`,
    fetcher
  );

  const { data: plans } = useSWR<Plan[]>("/api/plans", fetcher);

  const filmCodes = data?.filmCodes ?? [];
  const pagination = data?.pagination;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(search);
  };

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleGenerate = async () => {
    if (!generateForm.planId) {
      toast.error("Please select a plan");
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch("/api/admin/film-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generateForm),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate codes");
      }

      const result = await response.json();
      setGeneratedCodes(result.codes);
      toast.success(result.message);
      mutate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate codes");
    } finally {
      setGenerating(false);
    }
  };

  const handleCloseGenerateDialog = () => {
    setGenerateDialogOpen(false);
    setGenerateForm({ planId: "", quantity: 1, expiresAt: "" });
    setGeneratedCodes([]);
  };

  const handleRevoke = async () => {
    if (!revokeCode) return;
    setRevoking(true);
    try {
      const response = await fetch(`/api/admin/film-codes/${revokeCode.id}`, {
        method: "PATCH",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to revoke code");
      }
      toast.success("Code revoked successfully");
      setRevokeCode(null);
      mutate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to revoke code");
    } finally {
      setRevoking(false);
    }
  };

  const handleCopyAllCodes = async () => {
    await navigator.clipboard.writeText(generatedCodes.join("\n"));
    toast.success("All codes copied to clipboard");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Film Codes</h1>
          <p className="text-muted-foreground">
            Generate and manage redemption codes for film plans.
          </p>
        </div>
        <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Generate Codes
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Film Codes</DialogTitle>
              <DialogDescription>
                Create new redemption codes that clients can use to claim films.
              </DialogDescription>
            </DialogHeader>

            {generatedCodes.length > 0 ? (
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {generatedCodes.length} code{generatedCodes.length > 1 ? "s" : ""} generated
                  </p>
                  <Button variant="outline" size="sm" onClick={handleCopyAllCodes}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy All
                  </Button>
                </div>
                <div className="max-h-64 overflow-y-auto rounded-md border">
                  {generatedCodes.map((code) => (
                    <div
                      key={code}
                      className="flex items-center justify-between border-b px-3 py-2 last:border-0"
                    >
                      <code className="font-mono text-sm">{code}</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleCopyCode(code)}
                      >
                        {copiedCode === code ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Plan</Label>
                  <Select
                    value={generateForm.planId}
                    onValueChange={(value) =>
                      setGenerateForm({ ...generateForm, planId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans?.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quantity (1-50)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={generateForm.quantity}
                    onChange={(e) =>
                      setGenerateForm({
                        ...generateForm,
                        quantity: Math.min(50, Math.max(1, parseInt(e.target.value) || 1)),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expiration Date (Optional)</Label>
                  <Input
                    type="date"
                    value={generateForm.expiresAt}
                    onChange={(e) =>
                      setGenerateForm({ ...generateForm, expiresAt: e.target.value })
                    }
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              {generatedCodes.length > 0 ? (
                <Button onClick={handleCloseGenerateDialog}>Done</Button>
              ) : (
                <>
                  <Button variant="outline" onClick={handleCloseGenerateDialog}>
                    Cancel
                  </Button>
                  <Button onClick={handleGenerate} disabled={generating}>
                    {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle>All Codes</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search codes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value.toUpperCase())}
                    className="pl-8 w-48"
                  />
                </div>
              </form>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value === "all" ? "" : value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="REDEEMED">Redeemed</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                  <SelectItem value="REVOKED">Revoked</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={planFilter}
                onValueChange={(value) => {
                  setPlanFilter(value === "all" ? "" : value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  {plans?.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filmCodes.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <Ticket className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No film codes found</p>
              <p className="text-sm text-muted-foreground">
                Click &quot;Generate Codes&quot; to create new codes
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Redeemed By</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filmCodes.map((filmCode) => {
                      const status = statusConfig[filmCode.status];
                      return (
                        <TableRow key={filmCode.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="font-mono text-sm">{filmCode.code}</code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleCopyCode(filmCode.code)}
                              >
                                {copiedCode === filmCode.code ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{filmCode.plan.name}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${status.color} border-0`}>
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(filmCode.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {filmCode.expiresAt
                              ? new Date(filmCode.expiresAt).toLocaleDateString()
                              : "—"}
                          </TableCell>
                          <TableCell>
                            {filmCode.redeemedBy ? (
                              <div>
                                <p className="text-sm font-medium">
                                  {filmCode.redeemedBy.name || "—"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {filmCode.redeemedBy.email}
                                </p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {filmCode.status === "ACTIVE" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setRevokeCode(filmCode)}
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {(page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(page * pagination.limit, pagination.total)} of{" "}
                    {pagination.total} codes
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

      {/* Revoke Dialog */}
      <AlertDialog open={!!revokeCode} onOpenChange={() => setRevokeCode(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Code</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke{" "}
              <code className="font-mono">{revokeCode?.code}</code>? This code will no
              longer be usable for redemption.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={revoking}
            >
              {revoking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
