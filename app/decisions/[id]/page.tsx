import Link from "next/link";
import { notFound } from "next/navigation";
import { getDecision, getContext } from "@/lib/storage";
import RankingBadge from "@/components/RankingBadge";
import DebateTimeline from "@/components/DebateTimeline";
import EvaluateButton from "./EvaluateButton";
import OutcomeButtons from "./OutcomeButtons";

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
          <Link
            href="/decisions"
            className="text-sm text-gray-400 hover:text-gray-300 mb-2 inline-block"
          >
            ← Back to History
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">{decision.title}</h1>
          <p className="text-gray-400">
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
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-sm font-medium text-gray-400 mb-2">Context</h2>
          <p className="text-gray-200 whitespace-pre-wrap">{decision.description}</p>
        </div>
      )}

      {/* Options */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Options</h2>
        <div className="grid gap-4">
          {decision.options.map((option) => {
            const score = decision.evaluation?.agentEvaluations
              .flatMap((e) => e.optionScores)
              .filter((s) => s.optionId === option.id)
              .reduce((sum, s, _, arr) => sum + s.score / arr.length, 0);

            const isRecommended = option.id === decision.evaluation?.recommendedOptionId;

            return (
              <div
                key={option.id}
                className={`bg-gray-900 rounded-lg p-6 border-2 ${
                  isRecommended ? "border-green-500" : "border-transparent"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-medium text-white">
                        {option.name}
                      </h3>
                      {isRecommended && (
                        <span className="px-2 py-1 bg-green-600 rounded text-xs font-medium">
                          Recommended
                        </span>
                      )}
                    </div>
                    {option.description && (
                      <p className="text-gray-400 mb-3">{option.description}</p>
                    )}
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>€{option.estimatedCost.toLocaleString()}</span>
                      <span>{option.estimatedTimeWeeks} weeks</span>
                    </div>
                  </div>
                  {score !== undefined && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {score.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">avg score</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Evaluation Section */}
      {decision.evaluation ? (
        <div className="space-y-6">
          {/* Synthesis */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Council Recommendation
            </h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl font-bold text-white">
                {decision.evaluation.confidence}%
              </div>
              <div>
                <p className="text-lg font-medium">
                  {recommendedOption?.name}
                </p>
                <p className="text-sm text-gray-400">Confidence Level</p>
              </div>
            </div>
            <p className="text-gray-300">{decision.evaluation.synthesis}</p>

            {/* Deliberation Stats */}
            <div className="mt-4 pt-4 border-t border-gray-800 flex items-center gap-4">
              <span className="text-sm text-gray-400">
                Deliberation: {decision.evaluation.deliberationRounds || 1} round{(decision.evaluation.deliberationRounds || 1) !== 1 ? 's' : ''}
              </span>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  decision.evaluation.consensusReached
                    ? "bg-green-600/20 text-green-400"
                    : "bg-yellow-600/20 text-yellow-400"
                }`}
              >
                {decision.evaluation.consensusReached ? "Consensus Reached" : "Partial Consensus"}
              </span>
            </div>

            {decision.evaluation.dissent.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-800">
                <h3 className="text-sm font-medium text-red-400 mb-2">
                  Dissenting Opinions
                </h3>
                <ul className="space-y-1">
                  {decision.evaluation.dissent.map((d, i) => (
                    <li key={i} className="text-sm text-gray-400">
                      • {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

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
            <h2 className="text-xl font-semibold text-white mb-4">
              Agent Perspectives
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {decision.evaluation.agentEvaluations.map((agent) => (
                <div key={agent.agentType} className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">
                      {getAgentIcon(agent.agentType)}
                    </span>
                    <h3 className="font-medium text-white">
                      {getAgentName(agent.agentType)}
                    </h3>
                  </div>
                  <div className="space-y-2 mb-3">
                    {agent.optionScores.map((score) => {
                      const opt = decision.options.find((o) => o.id === score.optionId);
                      return (
                        <div key={score.optionId} className="text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-300">{opt?.name}</span>
                            <span className={`font-bold ${getScoreColor(score.score)}`}>
                              {score.score}/10
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{score.reasoning}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {agent.keyFactors.map((factor, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400"
                      >
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Outcome Tracking */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Track Outcome
            </h2>
            <p className="text-gray-400 mb-4">
              Did this decision work out? Mark the outcome to help improve future recommendations.
            </p>
            <OutcomeButtons decisionId={decision.id} currentOutcome={decision.outcome} />
          </div>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-white mb-4">
            Ready for Evaluation
          </h2>
          <p className="text-gray-400 mb-6">
            Run the Strategy Council to get recommendations from all 5 agents.
          </p>
          <EvaluateButton decisionId={decision.id} context={context} />
        </div>
      )}
    </div>
  );
}

function getAgentIcon(type: string): string {
  const icons: Record<string, string> = {
    financial: "💰",
    market: "📊",
    risk: "⚠️",
    gametheory: "♟️",
    resource: "⏱️",
    "chief-of-staff": "🎯",
    // Legacy agent types
    cfo: "💰",
    growth: "📈",
    synthesizer: "🎯",
  };
  return icons[type] || "🤖";
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

function getScoreColor(score: number): string {
  if (score >= 7) return "text-green-400";
  if (score >= 4) return "text-yellow-400";
  return "text-red-400";
}
