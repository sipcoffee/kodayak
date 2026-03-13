"use client";

import { useState } from "react";
import useSWR from "swr";
import { Check, CreditCard, Loader2, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { fetcher } from "@/lib/swr";

interface Plan {
  id: string;
  name: string;
  type: "BASIC" | "STANDARD" | "PREMIUM";
  price: string;
  guestPhotoLimit: number;
  eventDuration: number;
  features: string[];
  isActive: boolean;
  revenue: number;
  _count: {
    payments: number;
  };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AdminPlansPage() {
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Plan>>({});
  const [saving, setSaving] = useState(false);

  const { data: plans, isLoading, mutate } = useSWR<Plan[]>(
    "/api/admin/plans",
    fetcher
  );

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan.id);
    setEditForm({
      name: plan.name,
      price: plan.price,
      guestPhotoLimit: plan.guestPhotoLimit,
      eventDuration: plan.eventDuration,
      isActive: plan.isActive,
    });
  };

  const handleCancel = () => {
    setEditingPlan(null);
    setEditForm({});
  };

  const handleSave = async (planId: string) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/plans/${planId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!response.ok) throw new Error("Failed to update plan");
      setEditingPlan(null);
      setEditForm({});
      mutate();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (plan: Plan) => {
    try {
      const response = await fetch(`/api/admin/plans/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !plan.isActive }),
      });
      if (!response.ok) throw new Error("Failed to update plan");
      mutate();
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Plans</h1>
        <p className="text-muted-foreground">
          Manage pricing plans and their features.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {plans?.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${!plan.isActive ? "opacity-60" : ""}`}
          >
            {plan.type === "STANDARD" && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary">Popular</Badge>
              </div>
            )}
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{plan.name}</CardTitle>
                <Badge variant={plan.isActive ? "default" : "secondary"}>
                  {plan.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <CardDescription className="text-3xl font-bold">
                {formatCurrency(Number(plan.price))}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingPlan === plan.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`name-${plan.id}`}>Plan Name</Label>
                    <Input
                      id={`name-${plan.id}`}
                      value={editForm.name || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`price-${plan.id}`}>Price (PHP)</Label>
                    <Input
                      id={`price-${plan.id}`}
                      type="number"
                      value={editForm.price || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, price: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`guestPhotoLimit-${plan.id}`}>Guest Photo Limit</Label>
                    <Input
                      id={`guestPhotoLimit-${plan.id}`}
                      type="number"
                      value={editForm.guestPhotoLimit || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          guestPhotoLimit: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`eventDuration-${plan.id}`}>
                      Event Duration (days)
                    </Label>
                    <Input
                      id={`eventDuration-${plan.id}`}
                      type="number"
                      value={editForm.eventDuration || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          eventDuration: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSave(plan.id)}
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{plan.guestPhotoLimit} photos per guest</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{plan.eventDuration} days event duration</span>
                    </div>
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg border bg-muted/50 p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Sales</span>
                      <span className="font-bold">{plan._count.payments}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Revenue</span>
                      <span className="font-bold">
                        {formatCurrency(Number(plan.revenue))}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={plan.isActive}
                        onCheckedChange={() => handleToggleActive(plan)}
                      />
                      <Label className="text-sm">
                        {plan.isActive ? "Active" : "Inactive"}
                      </Label>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(plan)}
                    >
                      Edit
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {(!plans || plans.length === 0) && (
        <Card>
          <CardContent className="flex h-64 flex-col items-center justify-center">
            <CreditCard className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No plans configured</p>
            <p className="text-sm text-muted-foreground">
              Run the database seed to create default plans
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
