"use client";

import { useState } from "react";
import { MarketData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, X, Check, Pencil } from "lucide-react";

interface MarketDataFormProps {
  marketData: MarketData;
  onSave: () => void;
}

function formatCurrency(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value}`;
}

export default function MarketDataForm({ marketData, onSave }: MarketDataFormProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tam, setTam] = useState(marketData.tam);
  const [sam, setSam] = useState(marketData.sam);
  const [som, setSom] = useState(marketData.som);
  const [trends, setTrends] = useState<string[]>(marketData.marketTrends);
  const [newTrend, setNewTrend] = useState("");

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/market", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tam,
          sam,
          som,
          marketTrends: trends,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        setEditing(false);
        onSave();
      }
    } catch (err) {
      console.error("Failed to save:", err);
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setTam(marketData.tam);
    setSam(marketData.sam);
    setSom(marketData.som);
    setTrends(marketData.marketTrends);
    setEditing(false);
  };

  const addTrend = () => {
    if (newTrend.trim()) {
      setTrends([...trends, newTrend.trim()]);
      setNewTrend("");
    }
  };

  const removeTrend = (index: number) => {
    setTrends(trends.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Market Size Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Market Size</CardTitle>
          {!editing && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {editing ? (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tam">TAM (Total Addressable Market)</Label>
                  <Input
                    id="tam"
                    type="number"
                    value={tam}
                    onChange={(e) => setTam(Number(e.target.value))}
                    placeholder="e.g., 50000000000"
                  />
                  <p className="text-xs text-muted-foreground">{formatCurrency(tam)}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sam">SAM (Serviceable Addressable Market)</Label>
                  <Input
                    id="sam"
                    type="number"
                    value={sam}
                    onChange={(e) => setSam(Number(e.target.value))}
                    placeholder="e.g., 5000000000"
                  />
                  <p className="text-xs text-muted-foreground">{formatCurrency(sam)}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="som">SOM (Serviceable Obtainable Market)</Label>
                  <Input
                    id="som"
                    type="number"
                    value={som}
                    onChange={(e) => setSom(Number(e.target.value))}
                    placeholder="e.g., 50000000"
                  />
                  <p className="text-xs text-muted-foreground">{formatCurrency(som)}</p>
                </div>
              </div>

              {/* Market Trends */}
              <div className="space-y-2 pt-4 border-t">
                <Label>Market Trends</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTrend}
                    onChange={(e) => setNewTrend(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTrend())}
                    placeholder="Add market trend..."
                  />
                  <Button type="button" onClick={addTrend} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <ul className="space-y-2 mt-2">
                  {trends.map((trend, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between px-3 py-2 bg-secondary rounded-lg"
                    >
                      <span className="text-sm">{trend}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeTrend(i)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                {saved && (
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Saved
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">TAM</p>
                  <p className="text-xl font-bold">{formatCurrency(marketData.tam)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">SAM</p>
                  <p className="text-xl font-bold">{formatCurrency(marketData.sam)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">SOM</p>
                  <p className="text-xl font-bold">{formatCurrency(marketData.som)}</p>
                </div>
              </div>

              {marketData.marketTrends.length > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Market Trends</p>
                  <ul className="space-y-1">
                    {marketData.marketTrends.map((trend, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">→</span>
                        {trend}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
