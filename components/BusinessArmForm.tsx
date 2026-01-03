"use client";

import { useState, useEffect } from "react";
import { BusinessArm } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface BusinessArmFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  arm?: BusinessArm | null;
  existingArms: BusinessArm[];
  onSave: () => void;
}

const DEFAULT_ARM: Omit<BusinessArm, "id"> = {
  name: "",
  description: "",
  monthlyRevenue: 0,
  monthlyCosts: 0,
  timeInvestmentHours: 0,
  strategicValue: 5,
  status: "planned",
  dependencies: [],
};

export default function BusinessArmForm({
  open,
  onOpenChange,
  arm,
  existingArms,
  onSave,
}: BusinessArmFormProps) {
  const [formData, setFormData] = useState<Omit<BusinessArm, "id"> & { id?: string }>(DEFAULT_ARM);
  const [saving, setSaving] = useState(false);

  const isEditing = !!arm;

  useEffect(() => {
    if (arm) {
      setFormData(arm);
    } else {
      setFormData(DEFAULT_ARM);
    }
  }, [arm, open]);

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    setSaving(true);
    try {
      const method = isEditing ? "PUT" : "POST";
      const body = isEditing
        ? formData
        : { ...formData, id: `arm-${formData.name.toLowerCase().replace(/\s+/g, "-")}` };

      const res = await fetch("/api/arms", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onSave();
        onOpenChange(false);
      }
    } catch (err) {
      console.error("Failed to save:", err);
    }
    setSaving(false);
  };

  const toggleDependency = (depId: string) => {
    const deps = formData.dependencies || [];
    if (deps.includes(depId)) {
      setFormData({ ...formData, dependencies: deps.filter((d) => d !== depId) });
    } else {
      setFormData({ ...formData, dependencies: [...deps, depId] });
    }
  };

  // Filter out current arm from dependencies options
  const availableDependencies = existingArms.filter((a) => a.id !== arm?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Business Arm" : "Add Business Arm"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Core SaaS Product"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this business arm..."
              rows={2}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value as "active" | "paused" | "planned" })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Financial Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="revenue">Monthly Revenue (EUR)</Label>
              <Input
                id="revenue"
                type="number"
                value={formData.monthlyRevenue}
                onChange={(e) =>
                  setFormData({ ...formData, monthlyRevenue: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="costs">Monthly Costs (EUR)</Label>
              <Input
                id="costs"
                type="number"
                value={formData.monthlyCosts}
                onChange={(e) =>
                  setFormData({ ...formData, monthlyCosts: Number(e.target.value) })
                }
              />
            </div>
          </div>

          {/* Time Investment */}
          <div className="space-y-2">
            <Label htmlFor="time">Time Investment (hours/month)</Label>
            <Input
              id="time"
              type="number"
              value={formData.timeInvestmentHours}
              onChange={(e) =>
                setFormData({ ...formData, timeInvestmentHours: Number(e.target.value) })
              }
            />
          </div>

          {/* Strategic Value */}
          <div className="space-y-2">
            <Label htmlFor="value">Strategic Value (1-10)</Label>
            <div className="flex items-center gap-4">
              <Input
                id="value"
                type="number"
                min={1}
                max={10}
                value={formData.strategicValue}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    strategicValue: Math.min(10, Math.max(1, Number(e.target.value))),
                  })
                }
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">
                {formData.strategicValue <= 3
                  ? "Low"
                  : formData.strategicValue <= 6
                  ? "Medium"
                  : "High"}{" "}
                priority
              </span>
            </div>
          </div>

          {/* Dependencies */}
          {availableDependencies.length > 0 && (
            <div className="space-y-2">
              <Label>Dependencies (select arms this depends on)</Label>
              <div className="flex flex-wrap gap-2">
                {availableDependencies.map((dep) => (
                  <Button
                    key={dep.id}
                    type="button"
                    variant={formData.dependencies?.includes(dep.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleDependency(dep.id)}
                  >
                    {dep.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !formData.name.trim()}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Add Business Arm"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
