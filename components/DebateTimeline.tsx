"use client";

import { AgentDebate } from "@/lib/types";

interface DebateTimelineProps {
  debates: AgentDebate[];
  consensusReached: boolean;
  deliberationRounds: number;
}

const agentColors: Record<string, string> = {
  "financial": "border-green-500 bg-green-900/20",
  "market": "border-purple-500 bg-purple-900/20",
  "risk": "border-red-500 bg-red-900/20",
  "gametheory": "border-blue-500 bg-blue-900/20",
  "resource": "border-yellow-500 bg-yellow-900/20",
  "chief-of-staff": "border-white bg-gray-800",
};

const agentLabels: Record<string, string> = {
  "financial": "Financial Analyst",
  "market": "Market Analyst",
  "risk": "Risk Analyst",
  "gametheory": "Game Theorist",
  "resource": "Resource Allocation",
  "chief-of-staff": "Chief of Staff",
};

export default function DebateTimeline({
  debates,
  consensusReached,
  deliberationRounds,
}: DebateTimelineProps) {
  if (debates.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Deliberation</h3>
        <p className="text-gray-400 text-sm">
          No debates needed - agents reached immediate consensus.
        </p>
      </div>
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
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Deliberation Timeline</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">
            {deliberationRounds} round{deliberationRounds !== 1 ? "s" : ""}
          </span>
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              consensusReached
                ? "bg-green-600/20 text-green-400"
                : "bg-yellow-600/20 text-yellow-400"
            }`}
          >
            {consensusReached ? "Consensus Reached" : "Partial Consensus"}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {rounds.map(([roundNumber, roundDebates]) => (
          <div key={roundNumber}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">
                {roundNumber}
              </div>
              <span className="text-sm text-gray-400">Round {roundNumber}</span>
            </div>

            <div className="ml-3 border-l-2 border-gray-700 pl-6 space-y-4">
              {roundDebates.map((debate, index) => (
                <DebateEntry key={index} debate={debate} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DebateEntry({ debate }: { debate: AgentDebate }) {
  const colorClass = agentColors[debate.agentType] || "border-gray-500 bg-gray-900/20";
  const label = agentLabels[debate.agentType] || debate.agentType;

  return (
    <div className={`border-l-2 ${colorClass} pl-4 py-2 rounded-r-lg`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-medium text-white">{label}</span>
        {debate.challengedBy && (
          <span className="text-xs text-orange-400">
            (challenged by {agentLabels[debate.challengedBy] || debate.challengedBy})
          </span>
        )}
      </div>

      <p className="text-sm text-gray-300">{debate.position}</p>

      {debate.challenge && (
        <div className="mt-2 p-2 bg-orange-900/20 rounded border border-orange-800/50">
          <p className="text-xs text-orange-400 font-medium mb-1">Challenge:</p>
          <p className="text-sm text-gray-300">{debate.challenge}</p>
        </div>
      )}

      {debate.response && (
        <div className="mt-2 p-2 bg-blue-900/20 rounded border border-blue-800/50">
          <p className="text-xs text-blue-400 font-medium mb-1">Resolution:</p>
          <p className="text-sm text-gray-300">{debate.response}</p>
        </div>
      )}
    </div>
  );
}
