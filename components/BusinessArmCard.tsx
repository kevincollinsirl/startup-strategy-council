"use client";

import { BusinessArm } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Euro, Clock, Pencil, Trash2, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface BusinessArmCardProps {
  arm: BusinessArm;
  onEdit?: (arm: BusinessArm) => void;
  onDelete?: (id: string) => void;
}

export default function BusinessArmCard({ arm, onEdit, onDelete }: BusinessArmCardProps) {
  const profit = arm.monthlyRevenue - arm.monthlyCosts;

  const statusDot = {
    active: "bg-emerald-500",
    paused: "bg-amber-500",
    planned: "bg-muted-foreground",
  }[arm.status];

  const statusLabel = {
    active: "Active",
    paused: "Paused",
    planned: "Planned",
  }[arm.status];

  return (
    <Card className="hover:border-primary/50 transition-colors">
      {/* Header */}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{arm.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{arm.description}</p>
          </div>
          <Badge variant="secondary" className="gap-1.5">
            <span className={`w-2 h-2 rounded-full ${statusDot}`} />
            {statusLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Revenue</p>
            <p className="text-lg font-medium text-foreground flex items-center gap-1">
              <Euro className="h-4 w-4" />
              {arm.monthlyRevenue.toLocaleString()}/mo
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Costs</p>
            <p className="text-lg font-medium text-foreground flex items-center gap-1">
              <Euro className="h-4 w-4" />
              {arm.monthlyCosts.toLocaleString()}/mo
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Net Profit</p>
            <p className="text-lg font-medium flex items-center gap-1 text-foreground">
              {profit > 0 ? <TrendingUp className="h-4 w-4" /> : profit < 0 ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
              <Euro className="h-4 w-4" />
              {profit.toLocaleString()}/mo
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Time Investment</p>
            <p className="text-lg font-medium flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {arm.timeInvestmentHours}h/mo
            </p>
          </div>
        </div>

        {/* Strategic Value Bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted-foreground">Strategic Value</p>
            <p className="text-xs font-medium">{arm.strategicValue}/10</p>
          </div>
          <Progress value={arm.strategicValue * 10} className="h-2" />
        </div>

        {/* Dependencies */}
        {arm.dependencies.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Dependencies</p>
            <div className="flex flex-wrap gap-1">
              {arm.dependencies.map((dep, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {dep.replace("arm-", "")}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {(onEdit || onDelete) && (
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onEdit(arm)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => onDelete(arm.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
