"use client";

import { useState } from "react";
import { AgentEvaluation, Option } from "@/lib/types";

interface AgentCardProps {
  evaluation: AgentEvaluation;
  options: Option[];
}

const agentInfo: Record<string, { icon: string; name: string; color: string }> = {
  cfo: { icon: "💰", name: "CFO Agent", color: "text-green-400" },
  growth: { icon: "📈", name: "Growth Agent", color: "text-blue-400" },
  risk: { icon: "⚠️", name: "Risk Agent", color: "text-yellow-400" },
  gametheory: { icon: "♟️", name: "Game Theory Agent", color: "text-purple-400" },
  synthesizer: { icon: "🎯", name: "Synthesizer", color: "text-white" },
};

export default function AgentCard({ evaluation, options }: AgentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const info = agentInfo[evaluation.agentType] || {
    icon: "🤖",
    name: evaluation.agentType,
    color: "text-gray-400",
  };

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{info.icon}</span>
          <div className="text-left">
            <h3 className={`font-medium ${info.color}`}>{info.name}</h3>
            <p className="text-sm text-gray-500">
              {evaluation.keyFactors.slice(0, 2).join(", ")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Quick score summary */}
          <div className="flex gap-1">
            {evaluation.optionScores.map((score) => (
              <span
                key={score.optionId}
                className={`w-8 h-8 flex items-center justify-center rounded text-sm font-bold ${getScoreBg(
                  score.score
                )}`}
              >
                {score.score}
              </span>
            ))}
          </div>
          <span className="text-gray-500">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-800">
          {/* Option scores with reasoning */}
          <div className="space-y-4 mt-4">
            {evaluation.optionScores.map((score) => {
              const option = options.find((o) => o.id === score.optionId);
              return (
                <div key={score.optionId} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-300">
                      {option?.name}
                    </span>
                    <span
                      className={`font-bold ${getScoreColor(score.score)}`}
                    >
                      {score.score}/10
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{score.reasoning}</p>
                </div>
              );
            })}
          </div>

          {/* Key factors */}
          <div className="mt-4 pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-500 mb-2">Key Factors</p>
            <div className="flex flex-wrap gap-2">
              {evaluation.keyFactors.map((factor, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400"
                >
                  {factor}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 7) return "text-green-400";
  if (score >= 4) return "text-yellow-400";
  return "text-red-400";
}

function getScoreBg(score: number): string {
  if (score >= 7) return "bg-green-600/20 text-green-400";
  if (score >= 4) return "bg-yellow-600/20 text-yellow-400";
  return "bg-red-600/20 text-red-400";
}
