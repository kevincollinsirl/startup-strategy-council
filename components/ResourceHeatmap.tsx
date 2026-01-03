"use client";

import { BusinessArm } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface ResourceHeatmapProps {
  arms: BusinessArm[];
}

export default function ResourceHeatmap({ arms }: ResourceHeatmapProps) {
  const totalHours = arms.reduce((sum, a) => sum + a.timeInvestmentHours, 0);
  const FOUNDER_CAPACITY = 160; // hours per month

  // Sort by time investment
  const sortedArms = [...arms]
    .filter((a) => a.timeInvestmentHours > 0)
    .sort((a, b) => b.timeInvestmentHours - a.timeInvestmentHours);

  // Calculate efficiency (strategic value per hour)
  const withEfficiency = sortedArms.map((arm) => ({
    ...arm,
    efficiency: arm.timeInvestmentHours > 0 ? arm.strategicValue / arm.timeInvestmentHours : 0,
    percentage: totalHours > 0 ? (arm.timeInvestmentHours / totalHours) * 100 : 0,
  }));

  // Identify bottlenecks (high time, low value)
  const bottlenecks = withEfficiency.filter(
    (arm) => arm.timeInvestmentHours > 20 && arm.strategicValue < 6
  );

  // Calculate capacity usage
  const capacityUsed = (totalHours / FOUNDER_CAPACITY) * 100;
  const isOverCapacity = capacityUsed > 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resource Allocation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Capacity Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Founder Capacity Usage</span>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isOverCapacity ? "bg-red-500" : capacityUsed > 80 ? "bg-amber-500" : "bg-emerald-500"}`} />
              <span className="text-sm font-medium">
                {totalHours}h / {FOUNDER_CAPACITY}h ({capacityUsed.toFixed(0)}%)
              </span>
            </div>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${Math.min(capacityUsed, 100)}%` }}
            />
          </div>
          {isOverCapacity && (
            <p className="text-xs text-muted-foreground mt-1">Over capacity by {totalHours - FOUNDER_CAPACITY}h</p>
          )}
        </div>

        {/* Heatmap Grid */}
        <div className="space-y-3">
          {withEfficiency.map((arm) => {
            // Color based on efficiency using primary color opacity
            const heatOpacity = getHeatOpacity(arm.efficiency);
            const statusDot = arm.status === "active" ? "bg-emerald-500" : arm.status === "paused" ? "bg-amber-500" : "bg-muted-foreground";

            return (
              <div key={arm.id} className="group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded bg-primary ${heatOpacity}`}
                      title={`Efficiency: ${arm.efficiency.toFixed(2)} value/hour`}
                    />
                    <span className="text-sm">{arm.name}</span>
                    <Badge variant="secondary" className="gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                      {arm.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      {arm.timeInvestmentHours}h ({arm.percentage.toFixed(0)}%)
                    </span>
                    <span className="text-muted-foreground">Value: {arm.strategicValue}/10</span>
                  </div>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-primary ${heatOpacity} rounded-full transition-all`}
                    style={{ width: `${arm.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottlenecks Warning */}
        {bottlenecks.length > 0 && (
          <div className="p-4 bg-secondary border border-border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">Potential Inefficiencies</h4>
            </div>
            <ul className="space-y-1">
              {bottlenecks.map((arm) => (
                <li key={arm.id} className="text-sm text-muted-foreground">
                  <span className="text-foreground">{arm.name}</span>: {arm.timeInvestmentHours}h/month but
                  only {arm.strategicValue}/10 strategic value
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Legend */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-2">Efficiency (Strategic Value per Hour)</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-primary opacity-20" />
              <span className="text-xs text-muted-foreground">Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-primary opacity-50" />
              <span className="text-xs text-muted-foreground">Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-primary" />
              <span className="text-xs text-muted-foreground">High</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getHeatOpacity(efficiency: number): string {
  if (efficiency < 0.1) return "opacity-20";
  if (efficiency < 0.2) return "opacity-35";
  if (efficiency < 0.3) return "opacity-50";
  if (efficiency < 0.5) return "opacity-75";
  return "opacity-100";
}
