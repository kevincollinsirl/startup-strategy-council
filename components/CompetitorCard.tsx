"use client";

import { Competitor } from "@/lib/types";

interface CompetitorCardProps {
  competitor: Competitor;
  onEdit?: (competitor: Competitor) => void;
}

export default function CompetitorCard({ competitor, onEdit }: CompetitorCardProps) {
  const threatColors = {
    low: "bg-green-600",
    medium: "bg-yellow-600",
    high: "bg-red-600",
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{competitor.name}</h3>
          <p className="text-sm text-gray-400 mt-1">{competitor.description}</p>
        </div>
        <span className={`px-2 py-1 ${threatColors[competitor.threat]} rounded text-xs font-medium capitalize`}>
          {competitor.threat} threat
        </span>
      </div>

      {/* Market Share */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-gray-500">Market Share</p>
          <p className="text-xs font-medium">{competitor.marketShare}%</p>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all"
            style={{ width: `${competitor.marketShare}%` }}
          />
        </div>
      </div>

      {/* Strengths */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2">Strengths</p>
        <div className="flex flex-wrap gap-1">
          {competitor.strengths.map((strength, i) => (
            <span key={i} className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs">
              {strength}
            </span>
          ))}
        </div>
      </div>

      {/* Weaknesses */}
      <div>
        <p className="text-xs text-gray-500 mb-2">Weaknesses</p>
        <div className="flex flex-wrap gap-1">
          {competitor.weaknesses.map((weakness, i) => (
            <span key={i} className="px-2 py-1 bg-red-900/30 text-red-400 rounded text-xs">
              {weakness}
            </span>
          ))}
        </div>
      </div>

      {/* Edit Button */}
      {onEdit && (
        <button
          onClick={() => onEdit(competitor)}
          className="mt-4 w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
        >
          Edit
        </button>
      )}
    </div>
  );
}
