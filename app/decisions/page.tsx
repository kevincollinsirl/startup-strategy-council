import Link from "next/link";
import { getDecisions } from "@/lib/storage";
import DecisionCard from "@/components/DecisionCard";

export const dynamic = "force-dynamic";

export default async function DecisionsPage() {
  const decisions = await getDecisions();
  const sortedDecisions = [...decisions].reverse(); // Most recent first

  const pendingCount = decisions.filter((d) => !d.evaluation).length;
  const evaluatedCount = decisions.filter((d) => d.evaluation).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Decision History</h1>
          <p className="text-gray-400">
            {decisions.length} total decisions · {evaluatedCount} evaluated · {pendingCount} pending
          </p>
        </div>
        <Link
          href="/decisions/new"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
        >
          + New Decision
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <FilterButton label="All" count={decisions.length} active />
        <FilterButton label="Pending" count={pendingCount} />
        <FilterButton label="Evaluated" count={evaluatedCount} />
      </div>

      {/* Decision List */}
      {sortedDecisions.length === 0 ? (
        <div className="bg-gray-900 rounded-lg p-12 text-center">
          <p className="text-gray-400 mb-4">No decisions yet</p>
          <Link
            href="/decisions/new"
            className="text-blue-400 hover:text-blue-300"
          >
            Create your first decision →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDecisions.map((decision) => (
            <DecisionCard key={decision.id} decision={decision} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterButton({
  label,
  count,
  active = false,
}: {
  label: string;
  count: number;
  active?: boolean;
}) {
  return (
    <button
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
      }`}
    >
      {label} ({count})
    </button>
  );
}
