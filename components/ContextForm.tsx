"use client";

import { useState } from "react";
import { CompanyContext } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Loader2, Check, TrendingUp, Calendar } from "lucide-react";

interface ContextFormProps {
  initialContext: CompanyContext;
}

export default function ContextForm({ initialContext }: ContextFormProps) {
  const [context, setContext] = useState<CompanyContext>(initialContext);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newProject, setNewProject] = useState("");
  const [newAsset, setNewAsset] = useState("");
  const [newConstraint, setNewConstraint] = useState("");

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/context", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(context),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error("Failed to save:", err);
    }
    setSaving(false);
  };

  const addProject = () => {
    if (newProject.trim()) {
      setContext({
        ...context,
        activeProjects: [...context.activeProjects, newProject.trim()],
      });
      setNewProject("");
    }
  };

  const removeProject = (index: number) => {
    setContext({
      ...context,
      activeProjects: context.activeProjects.filter((_, i) => i !== index),
    });
  };

  const addAsset = () => {
    if (newAsset.trim()) {
      setContext({
        ...context,
        keyAssets: [...context.keyAssets, newAsset.trim()],
      });
      setNewAsset("");
    }
  };

  const removeAsset = (index: number) => {
    setContext({
      ...context,
      keyAssets: context.keyAssets.filter((_, i) => i !== index),
    });
  };

  const addConstraint = () => {
    if (newConstraint.trim()) {
      setContext({
        ...context,
        keyConstraints: [...context.keyConstraints, newConstraint.trim()],
      });
      setNewConstraint("");
    }
  };

  const removeConstraint = (index: number) => {
    setContext({
      ...context,
      keyConstraints: context.keyConstraints.filter((_, i) => i !== index),
    });
  };

  // Calculate runway
  const netBurn = context.monthlyBurn - context.monthlyRevenue;
  const runway = netBurn > 0 ? Math.round((context.monthlyRevenue * 12) / netBurn) : Infinity;

  return (
    <div className="space-y-6">
      {/* Company Name */}
      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name</Label>
        <Input
          id="companyName"
          type="text"
          value={context.companyName}
          onChange={(e) => setContext({ ...context, companyName: e.target.value })}
        />
      </div>

      {/* Financial Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="revenue">Monthly Revenue (EUR)</Label>
          <Input
            id="revenue"
            type="number"
            value={context.monthlyRevenue}
            onChange={(e) => setContext({ ...context, monthlyRevenue: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="burn">Monthly Burn (EUR)</Label>
          <Input
            id="burn"
            type="number"
            value={context.monthlyBurn}
            onChange={(e) => setContext({ ...context, monthlyBurn: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="team">Team Size</Label>
          <Input
            id="team"
            type="number"
            value={context.teamSize}
            onChange={(e) => setContext({ ...context, teamSize: Number(e.target.value) })}
          />
        </div>
      </div>

      {/* Runway Display */}
      <Card className="bg-secondary">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-background">
              {runway === Infinity ? (
                <TrendingUp className="h-5 w-5 text-foreground" />
              ) : (
                <Calendar className="h-5 w-5 text-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Calculated Runway</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">
                  {runway === Infinity ? "Profitable" : `${runway} months`}
                </p>
                {runway === Infinity && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategic Goal */}
      <div className="space-y-2">
        <Label htmlFor="goal">Strategic Goal</Label>
        <Select
          value={context.strategicGoal}
          onValueChange={(value) => setContext({ ...context, strategicGoal: value as 'valuation' | 'independence' | 'hybrid' })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a goal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="valuation">EUR 100M+ Valuation (VC Path)</SelectItem>
            <SelectItem value="independence">Financial Independence</SelectItem>
            <SelectItem value="hybrid">Hybrid Approach</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Projects */}
      <div className="space-y-2">
        <Label>Active Projects</Label>
        <div className="flex gap-2">
          <Input
            type="text"
            value={newProject}
            onChange={(e) => setNewProject(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addProject()}
            placeholder="Add project..."
          />
          <Button type="button" onClick={addProject} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {context.activeProjects.map((project, i) => (
            <Badge key={i} variant="secondary" className="gap-1 pr-1">
              {project}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeProject(i)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Key Assets */}
      <div className="space-y-2">
        <Label>Key Assets</Label>
        <div className="flex gap-2">
          <Input
            type="text"
            value={newAsset}
            onChange={(e) => setNewAsset(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addAsset()}
            placeholder="Add asset..."
          />
          <Button type="button" onClick={addAsset} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <ul className="space-y-2 mt-2">
          {context.keyAssets.map((asset, i) => (
            <li
              key={i}
              className="flex items-center justify-between px-3 py-2 bg-secondary rounded-lg"
            >
              <span className="text-sm">{asset}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => removeAsset(i)}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </div>

      {/* Key Constraints */}
      <div className="space-y-2">
        <Label>Key Constraints</Label>
        <div className="flex gap-2">
          <Input
            type="text"
            value={newConstraint}
            onChange={(e) => setNewConstraint(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addConstraint()}
            placeholder="Add constraint..."
          />
          <Button type="button" onClick={addConstraint} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <ul className="space-y-2 mt-2">
          {context.keyConstraints.map((constraint, i) => (
            <li
              key={i}
              className="flex items-center justify-between px-3 py-2 bg-secondary rounded-lg"
            >
              <span className="text-sm">{constraint}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => removeConstraint(i)}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Context"
          )}
        </Button>
        {saved && (
          <span className="text-muted-foreground flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Saved successfully
          </span>
        )}
      </div>
    </div>
  );
}
