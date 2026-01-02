import Link from "next/link";
import { Decision } from "@/lib/types";
import RankingBadge from "./RankingBadge";

interface DecisionCardProps {
  decision: Decision;
}

export default function DecisionCard({ decision }: DecisionCardProps) {
  const recommendedOption = decision.evaluation
    ? decision.options.find((o) => o.id === decision.evaluation?.recommendedOptionId)
    : null;

  return (
    <Link
      href={`/decisions/${decision.id}`}
      className="block bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-white mb-1">
            {decision.title}
          </h3>
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
            {decision.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{new Date(decision.createdAt).toLocaleDateString()}</span>
            <span>{decision.options.length} options</span>
            {recommendedOption && (
              <span className="text-blue-400">
                → {recommendedOption.name}
              </span>
            )}
          </div>
        </div>
        <RankingBadge
          confidence={decision.evaluation?.confidence}
          outcome={decision.outcome}
        />
      </div>
    </Link>
  );
}
