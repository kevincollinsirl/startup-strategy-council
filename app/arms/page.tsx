"use client";

import { useState, useEffect } from "react";
import { BusinessArm } from "@/lib/types";
import BusinessArmCard from "@/components/BusinessArmCard";
import BusinessArmForm from "@/components/BusinessArmForm";
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
import { Euro, Clock, TrendingUp, TrendingDown, Building2, Plus } from "lucide-react";

export default function ArmsPage() {
  const [arms, setArms] = useState<BusinessArm[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingArm, setEditingArm] = useState<BusinessArm | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchArms = async () => {
    try {
      const res = await fetch("/api/arms");
      if (res.ok) {
        const data = await res.json();
        setArms(data);
      }
    } catch (err) {
      console.error("Failed to fetch arms:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchArms();
  }, []);

  const handleEdit = (arm: BusinessArm) => {
    setEditingArm(arm);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditingArm(null);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/arms?id=${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        fetchArms();
      }
    } catch (err) {
      console.error("Failed to delete:", err);
    }
    setDeleteId(null);
  };

  const totalRevenue = arms.reduce((sum, a) => sum + a.monthlyRevenue, 0);
  const totalCosts = arms.reduce((sum, a) => sum + a.monthlyCosts, 0);
  const totalTime = arms.reduce((sum, a) => sum + a.timeInvestmentHours, 0);
  const activeCount = arms.filter((a) => a.status === "active").length;
  const netProfit = totalRevenue - totalCosts;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Business Arms</h1>
          <p className="text-muted-foreground">
            Track and manage all business verticals
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Business Arm
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <Euro className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Revenue/month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <Euro className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {totalCosts.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Costs/month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                {netProfit >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-foreground" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-foreground" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">
                    {netProfit.toLocaleString()}
                  </p>
                  <span className={`w-2 h-2 rounded-full ${netProfit >= 0 ? "bg-emerald-500" : "bg-red-500"}`} />
                </div>
                <p className="text-sm text-muted-foreground">Net Profit/month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {totalTime}h
                </p>
                <p className="text-sm text-muted-foreground">Time/month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active vs Total */}
      <div className="flex gap-3">
        <Badge variant="secondary" className="gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          {activeCount} Active
        </Badge>
        <Badge variant="secondary" className="gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          {arms.filter((a) => a.status === "paused").length} Paused
        </Badge>
        <Badge variant="secondary" className="gap-1.5">
          <span className="w-2 h-2 rounded-full bg-muted-foreground" />
          {arms.filter((a) => a.status === "planned").length} Planned
        </Badge>
      </div>

      {/* Arms Grid */}
      {arms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No business arms configured yet</p>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Business Arm
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {arms.map((arm) => (
            <BusinessArmCard
              key={arm.id}
              arm={arm}
              onEdit={handleEdit}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      {/* Time Allocation Chart */}
      {arms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Time Allocation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {arms
              .filter((a) => a.timeInvestmentHours > 0)
              .sort((a, b) => b.timeInvestmentHours - a.timeInvestmentHours)
              .map((arm) => {
                const percentage = totalTime > 0 ? (arm.timeInvestmentHours / totalTime) * 100 : 0;
                return (
                  <div key={arm.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{arm.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {arm.timeInvestmentHours}h ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Form Modal */}
      <BusinessArmForm
        open={formOpen}
        onOpenChange={setFormOpen}
        arm={editingArm}
        existingArms={arms}
        onSave={fetchArms}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Business Arm?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this business arm. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
