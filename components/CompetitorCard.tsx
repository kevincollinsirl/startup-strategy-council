"use client";

import { Competitor } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Pencil, Trash2 } from "lucide-react";

interface CompetitorCardProps {
  competitor: Competitor;
  onEdit?: (competitor: Competitor) => void;
  onDelete?: (id: string) => void;
}

export default function CompetitorCard({ competitor, onEdit, onDelete }: CompetitorCardProps) {
  const threatDot = {
    low: "bg-emerald-500",
    medium: "bg-amber-500",
    high: "bg-red-500",
  }[competitor.threat];

  const threatLabel = {
    low: "Low Threat",
    medium: "Medium Threat",
    high: "High Threat",
  }[competitor.threat];

  return (
    <Card className="hover:border-primary/50 transition-colors">
      {/* Header */}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{competitor.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{competitor.description}</p>
          </div>
          <Badge variant="secondary" className="gap-1.5">
            <span className={`w-2 h-2 rounded-full ${threatDot}`} />
            {threatLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Market Share */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted-foreground">Market Share</p>
            <p className="text-xs font-medium">{competitor.marketShare}%</p>
          </div>
          <Progress value={competitor.marketShare} className="h-2" />
        </div>

        {/* Strengths */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Strengths</p>
          <div className="flex flex-wrap gap-1">
            {competitor.strengths.map((strength, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {strength}
              </Badge>
            ))}
          </div>
        </div>

        {/* Weaknesses */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Weaknesses</p>
          <div className="flex flex-wrap gap-1">
            {competitor.weaknesses.map((weakness, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {weakness}
              </Badge>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        {(onEdit || onDelete) && (
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onEdit(competitor)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => onDelete(competitor.id)}
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
