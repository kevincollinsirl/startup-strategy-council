"use client";

import { useState, useEffect } from "react";
import { MarketData, Competitor, CompanyContext } from "@/lib/types";
import CompetitorCard from "@/components/CompetitorCard";
import CompetitorForm from "@/components/CompetitorForm";
import MarketDataForm from "@/components/MarketDataForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import { Users, ShieldAlert, Shield, TrendingUp, Target, Plus } from "lucide-react";

const DEFAULT_MARKET_DATA: MarketData = {
  tam: 0,
  sam: 0,
  som: 0,
  marketTrends: [],
  competitors: [],
};

export default function MarketPage() {
  const [marketData, setMarketData] = useState<MarketData>(DEFAULT_MARKET_DATA);
  const [context, setContext] = useState<CompanyContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCompetitor, setEditingCompetitor] = useState<Competitor | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [marketRes, contextRes] = await Promise.all([
        fetch("/api/market"),
        fetch("/api/context"),
      ]);

      if (marketRes.ok) {
        const data = await marketRes.json();
        setMarketData(data);
      }
      if (contextRes.ok) {
        const data = await contextRes.json();
        setContext(data);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditCompetitor = (competitor: Competitor) => {
    setEditingCompetitor(competitor);
    setFormOpen(true);
  };

  const handleAddCompetitor = () => {
    setEditingCompetitor(null);
    setFormOpen(true);
  };

  const handleDeleteCompetitor = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/market?competitorId=${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Failed to delete:", err);
    }
    setDeleteId(null);
  };

  const highThreats = marketData.competitors.filter((c) => c.threat === "high").length;
  const mediumThreats = marketData.competitors.filter((c) => c.threat === "medium").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Market Intelligence</h1>
        <p className="text-muted-foreground">
          Track market size, competitors, and trends
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <Users className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{marketData.competitors.length}</p>
                <p className="text-sm text-muted-foreground">Competitors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <ShieldAlert className="h-5 w-5 text-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{highThreats}</p>
                <span className="w-2 h-2 rounded-full bg-red-500" />
              </div>
              <p className="text-sm text-muted-foreground">High Threats</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <Shield className="h-5 w-5 text-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{mediumThreats}</p>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              </div>
              <p className="text-sm text-muted-foreground">Medium Threats</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <TrendingUp className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{marketData.marketTrends.length}</p>
                <p className="text-sm text-muted-foreground">Market Trends</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Size & Trends - Editable */}
      <MarketDataForm marketData={marketData} onSave={fetchData} />

      {/* Competitors */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Competitors</h2>
          <Button onClick={handleAddCompetitor}>
            <Plus className="h-4 w-4 mr-2" />
            Add Competitor
          </Button>
        </div>
        {marketData.competitors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No competitors tracked yet</p>
              <Button onClick={handleAddCompetitor}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Competitor
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {marketData.competitors.map((competitor) => (
              <CompetitorCard
                key={competitor.id}
                competitor={competitor}
                onEdit={handleEditCompetitor}
                onDelete={(id) => setDeleteId(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Competitive Landscape */}
      {marketData.competitors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Market Share Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {marketData.competitors
              .sort((a, b) => b.marketShare - a.marketShare)
              .map((competitor) => {
                const threatDot = {
                  low: "bg-emerald-500",
                  medium: "bg-amber-500",
                  high: "bg-red-500",
                }[competitor.threat];

                return (
                  <div key={competitor.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 ${threatDot} rounded-full`} />
                        <span className="text-sm">{competitor.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{competitor.marketShare}%</span>
                    </div>
                    <Progress value={competitor.marketShare} className="h-2" />
                  </div>
                );
              })}

            {/* Our position */}
            {marketData.tam > 0 && (
              <div className="pt-4 mt-4 border-t">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      {context?.companyName || "Your Company"} (Target)
                    </span>
                  </div>
                  <span className="text-sm text-primary font-medium">
                    {((marketData.som / marketData.tam) * 100).toFixed(2)}%
                  </span>
                </div>
                <Progress
                  value={Math.max((marketData.som / marketData.tam) * 100, 0.5)}
                  className="h-2"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Competitor Form Modal */}
      <CompetitorForm
        open={formOpen}
        onOpenChange={setFormOpen}
        competitor={editingCompetitor}
        onSave={fetchData}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Competitor?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this competitor. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCompetitor}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
