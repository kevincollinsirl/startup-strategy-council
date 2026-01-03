"use client";

import { useState, useEffect } from "react";
import { Competitor } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Loader2, Plus, X } from "lucide-react";

interface CompetitorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competitor?: Competitor | null;
  onSave: () => void;
}

const DEFAULT_COMPETITOR: Omit<Competitor, "id"> = {
  name: "",
  description: "",
  strengths: [],
  weaknesses: [],
  marketShare: 0,
  threat: "medium",
};

export default function CompetitorForm({
  open,
  onOpenChange,
  competitor,
  onSave,
}: CompetitorFormProps) {
  const [formData, setFormData] = useState<Omit<Competitor, "id"> & { id?: string }>(DEFAULT_COMPETITOR);
  const [saving, setSaving] = useState(false);
  const [newStrength, setNewStrength] = useState("");
  const [newWeakness, setNewWeakness] = useState("");

  const isEditing = !!competitor;

  useEffect(() => {
    if (competitor) {
      setFormData(competitor);
    } else {
      setFormData(DEFAULT_COMPETITOR);
    }
  }, [competitor, open]);

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    setSaving(true);
    try {
      const method = isEditing ? "PUT" : "POST";
      const body = isEditing
        ? { competitorId: formData.id, ...formData }
        : { ...formData, id: `comp-${formData.name.toLowerCase().replace(/\s+/g, "-")}` };

      const res = await fetch("/api/market", {
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

  const addStrength = () => {
    if (newStrength.trim()) {
      setFormData({
        ...formData,
        strengths: [...formData.strengths, newStrength.trim()],
      });
      setNewStrength("");
    }
  };

  const removeStrength = (index: number) => {
    setFormData({
      ...formData,
      strengths: formData.strengths.filter((_, i) => i !== index),
    });
  };

  const addWeakness = () => {
    if (newWeakness.trim()) {
      setFormData({
        ...formData,
        weaknesses: [...formData.weaknesses, newWeakness.trim()],
      });
      setNewWeakness("");
    }
  };

  const removeWeakness = (index: number) => {
    setFormData({
      ...formData,
      weaknesses: formData.weaknesses.filter((_, i) => i !== index),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Competitor" : "Add Competitor"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Mixpanel"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this competitor..."
              rows={2}
            />
          </div>

          {/* Market Share & Threat */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marketShare">Market Share (%)</Label>
              <Input
                id="marketShare"
                type="number"
                min={0}
                max={100}
                value={formData.marketShare}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    marketShare: Math.min(100, Math.max(0, Number(e.target.value))),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Threat Level</Label>
              <Select
                value={formData.threat}
                onValueChange={(value) =>
                  setFormData({ ...formData, threat: value as "low" | "medium" | "high" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Strengths */}
          <div className="space-y-2">
            <Label>Strengths</Label>
            <div className="flex gap-2">
              <Input
                value={newStrength}
                onChange={(e) => setNewStrength(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addStrength())}
                placeholder="Add strength..."
              />
              <Button type="button" onClick={addStrength} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.strengths.map((strength, i) => (
                <Badge key={i} variant="secondary" className="gap-1 pr-1">
                  {strength}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeStrength(i)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div className="space-y-2">
            <Label>Weaknesses</Label>
            <div className="flex gap-2">
              <Input
                value={newWeakness}
                onChange={(e) => setNewWeakness(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addWeakness())}
                placeholder="Add weakness..."
              />
              <Button type="button" onClick={addWeakness} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.weaknesses.map((weakness, i) => (
                <Badge key={i} variant="outline" className="gap-1 pr-1">
                  {weakness}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeWeakness(i)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
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
              "Add Competitor"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
