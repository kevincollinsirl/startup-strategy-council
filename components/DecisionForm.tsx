"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Option } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Loader2 } from "lucide-react";

export default function DecisionForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<Option[]>([
    { id: uuidv4(), name: "", description: "", estimatedCost: 0, estimatedTimeWeeks: 1 },
    { id: uuidv4(), name: "", description: "", estimatedCost: 0, estimatedTimeWeeks: 1 },
  ]);
  const [saving, setSaving] = useState(false);

  const addOption = () => {
    setOptions([
      ...options,
      { id: uuidv4(), name: "", description: "", estimatedCost: 0, estimatedTimeWeeks: 1 },
    ]);
  };

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter((o) => o.id !== id));
    }
  };

  const updateOption = (id: string, field: keyof Option, value: string | number) => {
    setOptions(
      options.map((o) =>
        o.id === id ? { ...o, [field]: value } : o
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || options.some((o) => !o.name.trim())) {
      alert("Please fill in title and all option names");
      return;
    }

    setSaving(true);
    try {
      const decision = {
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        title: title.trim(),
        description: description.trim(),
        options: options.filter((o) => o.name.trim()),
      };

      const res = await fetch("/api/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(decision),
      });

      if (res.ok) {
        router.push(`/decisions/${decision.id}`);
      }
    } catch (err) {
      console.error("Failed to save:", err);
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Decision Title *</Label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Should we take VC funding?"
          className="text-lg"
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Context & Background</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the decision, its importance, and any relevant context..."
          rows={4}
        />
      </div>

      {/* Options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Options to Evaluate ({options.length})</Label>
          <Button type="button" variant="ghost" size="sm" onClick={addOption}>
            <Plus className="h-4 w-4 mr-1" />
            Add Option
          </Button>
        </div>

        <div className="space-y-4">
          {options.map((option, index) => (
            <Card key={option.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    Option {index + 1}
                  </span>
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(option.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <Input
                    type="text"
                    value={option.name}
                    onChange={(e) => updateOption(option.id, "name", e.target.value)}
                    placeholder="Option name *"
                    required
                  />

                  <Textarea
                    value={option.description}
                    onChange={(e) => updateOption(option.id, "description", e.target.value)}
                    placeholder="Describe this option..."
                    rows={2}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Estimated Cost (EUR)
                      </Label>
                      <Input
                        type="number"
                        value={option.estimatedCost}
                        onChange={(e) => updateOption(option.id, "estimatedCost", Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Time (weeks)
                      </Label>
                      <Input
                        type="number"
                        value={option.estimatedTimeWeeks}
                        onChange={(e) => updateOption(option.id, "estimatedTimeWeeks", Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-4">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {saving ? "Creating..." : "Create Decision"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
