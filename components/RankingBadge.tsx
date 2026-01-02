interface RankingBadgeProps {
  confidence?: number;
  outcome?: 'success' | 'failure' | 'pending';
}

export default function RankingBadge({ confidence, outcome }: RankingBadgeProps) {
  if (outcome === 'success') {
    return (
      <span className="px-3 py-1 bg-green-600 rounded-full text-sm font-medium">
        Success
      </span>
    );
  }

  if (outcome === 'failure') {
    return (
      <span className="px-3 py-1 bg-red-600 rounded-full text-sm font-medium">
        Failed
      </span>
    );
  }

  if (confidence === undefined) {
    return (
      <span className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300">
        Pending Evaluation
      </span>
    );
  }

  const color =
    confidence >= 70
      ? "bg-green-600"
      : confidence >= 40
      ? "bg-yellow-600"
      : "bg-red-600";

  const label =
    confidence >= 70
      ? "Do It"
      : confidence >= 40
      ? "Maybe"
      : "Don't";

  return (
    <span className={`px-3 py-1 ${color} rounded-full text-sm font-medium`}>
      {label} ({confidence}%)
    </span>
  );
}
