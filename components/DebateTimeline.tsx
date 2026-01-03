"use client";

import { AgentDebate } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Gamepad2,
  Clock,
  Target,
  MessageSquare,
  Reply,
} from "lucide-react";

interface DebateTimelineProps {
  debates: AgentDebate[];
  consensusReached: boolean;
  deliberationRounds: number;
}

const agentLabels: Record<string, string> = {
  "financial": "Financial Analyst",
  "market": "Market Analyst",
  "risk": "Risk Analyst",
  "gametheory": "Game Theorist",
  "resource": "Resource Allocation",
  "chief-of-staff": "Chief of Staff",
};

function getAgentIcon(type: string) {
  const icons: Record<string, React.ReactNode> = {
    financial: <DollarSign className="h-4 w-4" />,
    market: <TrendingUp className="h-4 w-4" />,
    risk: <AlertTriangle className="h-4 w-4" />,
    gametheory: <Gamepad2 className="h-4 w-4" />,
    resource: <Clock className="h-4 w-4" />,
    "chief-of-staff": <Target className="h-4 w-4" />,
  };
  return icons[type] || <MessageSquare className="h-4 w-4" />;
}

export default function DebateTimeline({
  debates,
  consensusReached,
  deliberationRounds,
}: DebateTimelineProps) {
  if (debates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deliberation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No debates needed - agents reached immediate consensus.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group debates by round
  const roundsMap = new Map<number, AgentDebate[]>();
  debates.forEach((debate) => {
    const round = debate.round;
    if (!roundsMap.has(round)) {
      roundsMap.set(round, []);
    }
    roundsMap.get(round)!.push(debate);
  });

  const rounds = Array.from(roundsMap.entries()).sort((a, b) => a[0] - b[0]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Deliberation Timeline</CardTitle>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {deliberationRounds} round{deliberationRounds !== 1 ? "s" : ""}
          </span>
          <Badge variant="secondary" className="gap-1.5">
            <span className={`w-2 h-2 rounded-full ${consensusReached ? "bg-emerald-500" : "bg-amber-500"}`} />
            {consensusReached ? "Consensus Reached" : "Partial Consensus"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {rounds.map(([roundNumber, roundDebates]) => (
          <div key={roundNumber}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                {roundNumber}
              </div>
              <span className="text-sm text-muted-foreground">Round {roundNumber}</span>
            </div>

            <div className="ml-3 border-l-2 border-border pl-6 space-y-4">
              {roundDebates.map((debate, index) => (
                <DebateEntry key={index} debate={debate} />
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function DebateEntry({ debate }: { debate: AgentDebate }) {
  const label = agentLabels[debate.agentType] || debate.agentType;

  return (
    <div className="border-l-2 border-border bg-secondary/30 pl-4 py-2 rounded-r-lg">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-foreground">{getAgentIcon(debate.agentType)}</span>
        <span className="text-sm font-medium">{label}</span>
        {debate.challengedBy && (
          <Badge variant="outline" className="text-xs">
            challenged by {agentLabels[debate.challengedBy] || debate.challengedBy}
          </Badge>
        )}
      </div>

      <p className="text-sm text-muted-foreground">{debate.position}</p>

      {debate.challenge && (
        <div className="mt-2 p-2 bg-secondary rounded border border-border">
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium mb-1">
            <MessageSquare className="h-3 w-3" />
            Challenge
          </div>
          <p className="text-sm text-muted-foreground">{debate.challenge}</p>
        </div>
      )}

      {debate.response && (
        <div className="mt-2 p-2 bg-secondary rounded border border-border">
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium mb-1">
            <Reply className="h-3 w-3" />
            Resolution
          </div>
          <p className="text-sm text-muted-foreground">{debate.response}</p>
        </div>
      )}
    </div>
  );
}
