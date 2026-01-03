"use client";

import { useState } from "react";
import { AgentEvaluation, Option } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Gamepad2,
  Target,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface AgentCardProps {
  evaluation: AgentEvaluation;
  options: Option[];
}

const agentInfo: Record<string, { icon: React.ReactNode; name: string }> = {
  cfo: { icon: <DollarSign className="h-5 w-5" />, name: "CFO Agent" },
  growth: { icon: <TrendingUp className="h-5 w-5" />, name: "Growth Agent" },
  risk: { icon: <AlertTriangle className="h-5 w-5" />, name: "Risk Agent" },
  gametheory: { icon: <Gamepad2 className="h-5 w-5" />, name: "Game Theory Agent" },
  synthesizer: { icon: <Target className="h-5 w-5" />, name: "Synthesizer" },
};

export default function AgentCard({ evaluation, options }: AgentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const info = agentInfo[evaluation.agentType] || {
    icon: <Target className="h-5 w-5" />,
    name: evaluation.agentType,
  };

  return (
    <Card>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors rounded-t-lg"
      >
        <div className="flex items-center gap-3">
          <div className="text-foreground">{info.icon}</div>
          <div className="text-left">
            <h3 className="font-medium text-foreground">{info.name}</h3>
            <p className="text-sm text-muted-foreground">
              {evaluation.keyFactors.slice(0, 2).join(", ")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {evaluation.optionScores.map((score) => (
              <Badge key={score.optionId} variant="secondary" className="w-8 h-8 flex items-center justify-center p-0">
                {score.score}
              </Badge>
            ))}
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <CardContent className="pt-0 border-t">
          <div className="space-y-4 mt-4">
            {evaluation.optionScores.map((score) => {
              const option = options.find((o) => o.id === score.optionId);
              return (
                <div key={score.optionId} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">
                      {option?.name}
                    </span>
                    <span className="font-bold text-foreground">
                      {score.score}/10
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{score.reasoning}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">Key Factors</p>
            <div className="flex flex-wrap gap-2">
              {evaluation.keyFactors.map((factor, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {factor}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
