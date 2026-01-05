import Link from "next/link";
import { notFound } from "next/navigation";
import { getDecision, getContext } from "@/lib/storage";
import RankingBadge from "@/components/RankingBadge";
import DebateTimeline from "@/components/DebateTimeline";
import EvaluateButton from "./EvaluateButton";
import OutcomeButtons from "./OutcomeButtons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Gamepad2,
  Clock,
  Target,
  Calendar,
  Euro,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DecisionDetailPage({ params }: Props) {
  const { id } = await params;
  const [decision, context] = await Promise.all([
    getDecision(id),
    getContext(),
  ]);

  if (!decision) {
    notFound();
  }

  const recommendedOption = decision.evaluation
    ? decision.options.find((o) => o.id === decision.evaluation?.recommendedOptionId)
    : null;

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
            <Link href="/decisions">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to History
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mb-2">{decision.title}</h1>
          <p className="text-muted-foreground flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Created {new Date(decision.createdAt).toLocaleDateString()}
          </p>
        </div>
        <RankingBadge
          confidence={decision.evaluation?.confidence}
          outcome={decision.outcome}
        />
      </div>

      {/* Description */}
      {decision.description && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Context</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{decision.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Options */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Options</h2>
        <div className="grid gap-4">
          {decision.options.map((option) => {
            const score = decision.evaluation?.agentEvaluations
              .flatMap((e) => e.optionScores)
              .filter((s) => s.optionId === option.id)
              .reduce((sum, s, _, arr) => sum + s.score / arr.length, 0);

            const isRecommended = option.id === decision.evaluation?.recommendedOptionId;

            return (
              <Card
                key={option.id}
                className={isRecommended ? "border-2 border-primary" : ""}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-medium">
                          {option.name}
                        </h3>
                        {isRecommended && (
                          <Badge variant="secondary" className="gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Recommended
                          </Badge>
                        )}
                      </div>
                      {option.description && (
                        <p className="text-muted-foreground mb-3">{option.description}</p>
                      )}
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Euro className="h-3 w-3" />
                          {option.estimatedCost.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {option.estimatedTimeWeeks} weeks
                        </span>
                      </div>
                    </div>
                    {score !== undefined && (
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {score.toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground">avg score</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Evaluation Section */}
      {decision.evaluation ? (
        <div className="space-y-6">
          {/* Synthesis */}
          <Card>
            <CardHeader>
              <CardTitle>Council Recommendation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold">
                  {decision.evaluation.confidence}%
                </div>
                <div>
                  <p className="text-lg font-medium">
                    {recommendedOption?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">Confidence Level</p>
                </div>
              </div>
              {(() => {
                const points = formatReasoningAsList(decision.evaluation.synthesis);
                return points.length > 1 ? (
                  <ul className="text-muted-foreground space-y-2 ml-4 list-disc">
                    {points.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">{decision.evaluation.synthesis}</p>
                );
              })()}

              {/* Deliberation Stats */}
              <div className="pt-4 border-t flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Deliberation: {decision.evaluation.deliberationRounds || 1} round{(decision.evaluation.deliberationRounds || 1) !== 1 ? 's' : ''}
                </span>
                <Badge variant="secondary" className="gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${decision.evaluation.consensusReached ? "bg-emerald-500" : "bg-amber-500"}`} />
                  {decision.evaluation.consensusReached ? "Consensus Reached" : "Partial Consensus"}
                </Badge>
              </div>

              {decision.evaluation.dissent.length > 0 && (
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    Dissenting Opinions
                  </h3>
                  <ul className="space-y-1">
                    {decision.evaluation.dissent.map((d, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        - {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Debate Timeline */}
          {decision.evaluation.debates && decision.evaluation.debates.length > 0 && (
            <DebateTimeline
              debates={decision.evaluation.debates}
              consensusReached={decision.evaluation.consensusReached || false}
              deliberationRounds={decision.evaluation.deliberationRounds || 1}
            />
          )}

          {/* Agent Evaluations */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Agent Perspectives</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {decision.evaluation.agentEvaluations.map((agent) => (
                <Card key={agent.agentType}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-md bg-secondary">
                        {getAgentIcon(agent.agentType)}
                      </div>
                      <h3 className="font-medium">
                        {getAgentName(agent.agentType)}
                      </h3>
                    </div>
                    <div className="space-y-3 mb-3">
                      {agent.optionScores.map((score) => {
                        const opt = decision.options.find((o) => o.id === score.optionId);
                        const reasoningPoints = formatReasoningAsList(score.reasoning);
                        return (
                          <div key={score.optionId} className="text-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span>{opt?.name}</span>
                              <span className="font-bold">
                                {score.score}/10
                              </span>
                            </div>
                            {reasoningPoints.length > 1 ? (
                              <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                                {reasoningPoints.map((point, i) => (
                                  <li key={i}>{point}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-xs text-muted-foreground">{score.reasoning}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {agent.keyFactors.map((factor, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Outcome Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Track Outcome</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Did this decision work out? Mark the outcome to help improve future recommendations.
              </p>
              <OutcomeButtons decisionId={decision.id} currentOutcome={decision.outcome} />
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <h2 className="text-xl font-semibold mb-4">
              Ready for Evaluation
            </h2>
            <p className="text-muted-foreground mb-6">
              Run the Startup Strategy Council to get recommendations from all 5 agents.
            </p>
            <EvaluateButton decisionId={decision.id} context={context} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getAgentIcon(type: string) {
  const icons: Record<string, React.ReactNode> = {
    financial: <DollarSign className="h-4 w-4" />,
    market: <TrendingUp className="h-4 w-4" />,
    risk: <AlertTriangle className="h-4 w-4" />,
    gametheory: <Gamepad2 className="h-4 w-4" />,
    resource: <Clock className="h-4 w-4" />,
    "chief-of-staff": <Target className="h-4 w-4" />,
    // Legacy agent types
    cfo: <DollarSign className="h-4 w-4" />,
    growth: <TrendingUp className="h-4 w-4" />,
    synthesizer: <Target className="h-4 w-4" />,
  };
  return icons[type] || <Target className="h-4 w-4" />;
}

function getAgentName(type: string): string {
  const names: Record<string, string> = {
    financial: "Financial Analyst",
    market: "Market Analyst",
    risk: "Risk Analyst",
    gametheory: "Game Theorist",
    resource: "Resource Allocation",
    "chief-of-staff": "Chief of Staff",
    // Legacy agent types
    cfo: "CFO",
    growth: "Growth",
    synthesizer: "Synthesizer",
  };
  return names[type] || type;
}

function formatReasoningAsList(reasoning: string): string[] {
  if (!reasoning) return [];

  // First, check if it already has newlines
  if (reasoning.includes('\n')) {
    return reasoning.split('\n').map(s => s.trim()).filter(s => s.length > 0);
  }

  // Split by sentence boundaries (period followed by space and capital letter)
  // This regex splits at ". " followed by a capital letter, but keeps the capital letter
  const sentences = reasoning.split(/(?<=\.)\s+(?=[A-Z])/);

  // Filter out very short fragments and clean up
  return sentences
    .map(s => s.trim())
    .filter(s => s.length > 10); // Only keep meaningful points
}
