import Link from "next/link";
import { getDecisions, getContext, getArms, getMarketData } from "@/lib/storage";
import ResourceHeatmap from "@/components/ResourceHeatmap";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [decisions, context, arms, marketData] = await Promise.all([
    getDecisions(),
    getContext(),
    getArms(),
    getMarketData(),
  ]);

  const recentDecisions = decisions.slice(-5).reverse();
  const evaluatedCount = decisions.filter((d) => d.evaluation).length;
  const avgConfidence =
    evaluatedCount > 0
      ? Math.round(
          decisions
            .filter((d) => d.evaluation)
            .reduce((sum, d) => sum + (d.evaluation?.confidence || 0), 0) /
            evaluatedCount
        )
      : 0;

  // Business arms summary
  const totalRevenue = arms.reduce((sum, a) => sum + a.monthlyRevenue, 0);
  const totalCosts = arms.reduce((sum, a) => sum + a.monthlyCosts, 0);
  const netProfit = totalRevenue - totalCosts;
  const activeArms = arms.filter((a) => a.status === "active").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">
          Welcome back, {context.companyName || "Founder"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Decisions"
          value={decisions.length}
          icon="📋"
        />
        <StatCard
          label="Avg Confidence"
          value={`${avgConfidence}%`}
          icon="🎯"
        />
        <StatCard
          label="Net Profit"
          value={`€${netProfit.toLocaleString()}`}
          icon="💰"
          color={netProfit > 0 ? "text-green-400" : "text-red-400"}
        />
        <StatCard
          label="Active Arms"
          value={`${activeArms}/${arms.length}`}
          icon="🏗️"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Link
          href="/decisions/new"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
        >
          + New Decision
        </Link>
        <Link
          href="/context"
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
        >
          Update Context
        </Link>
        <Link
          href="/arms"
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
        >
          Manage Arms
        </Link>
        <Link
          href="/market"
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
        >
          Market Intel
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Decisions */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            Recent Decisions
          </h2>
          {recentDecisions.length === 0 ? (
            <div className="bg-gray-900 rounded-lg p-8 text-center">
              <p className="text-gray-400 mb-4">No decisions yet</p>
              <Link
                href="/decisions/new"
                className="text-blue-400 hover:text-blue-300"
              >
                Create your first decision →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDecisions.map((decision) => (
                <Link
                  key={decision.id}
                  href={`/decisions/${decision.id}`}
                  className="block bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">{decision.title}</h3>
                      <p className="text-sm text-gray-400">
                        {new Date(decision.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {decision.evaluation ? (
                      <ConfidenceBadge confidence={decision.evaluation.confidence} />
                    ) : (
                      <span className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300">
                        Pending
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Business Arms Summary */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            Business Arms
          </h2>
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-400">Monthly Revenue</p>
                <p className="text-xl font-bold text-green-400">
                  €{totalRevenue.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Monthly Costs</p>
                <p className="text-xl font-bold text-red-400">
                  €{totalCosts.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {arms.slice(0, 4).map((arm) => {
                const profit = arm.monthlyRevenue - arm.monthlyCosts;
                return (
                  <div
                    key={arm.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          arm.status === "active"
                            ? "bg-green-500"
                            : arm.status === "paused"
                            ? "bg-yellow-500"
                            : "bg-blue-500"
                        }`}
                      />
                      <span className="text-gray-300">{arm.name}</span>
                    </div>
                    <span
                      className={profit > 0 ? "text-green-400" : profit < 0 ? "text-red-400" : "text-gray-400"}
                    >
                      €{profit.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
            <Link
              href="/arms"
              className="block text-center text-sm text-blue-400 hover:text-blue-300 mt-4 pt-4 border-t border-gray-800"
            >
              View all arms →
            </Link>
          </div>
        </div>
      </div>

      {/* Resource Allocation */}
      <ResourceHeatmap arms={arms} />

      {/* Market Overview */}
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Market Overview</h2>
          <Link
            href="/market"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            View details →
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-400">TAM</p>
            <p className="text-lg font-medium">${(marketData.tam / 1_000_000_000).toFixed(1)}B</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">SAM</p>
            <p className="text-lg font-medium">${(marketData.sam / 1_000_000_000).toFixed(1)}B</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">SOM</p>
            <p className="text-lg font-medium">${(marketData.som / 1_000_000).toFixed(1)}M</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-400 mb-2">Competitors ({marketData.competitors.length})</p>
          <div className="flex flex-wrap gap-2">
            {marketData.competitors.slice(0, 5).map((comp) => (
              <span
                key={comp.id}
                className={`px-2 py-1 rounded text-xs ${
                  comp.threat === "high"
                    ? "bg-red-900/30 text-red-400"
                    : comp.threat === "medium"
                    ? "bg-yellow-900/30 text-yellow-400"
                    : "bg-green-900/30 text-green-400"
                }`}
              >
                {comp.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Company Context Summary */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">
          Company Context
        </h2>
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-400">Revenue</p>
              <p className="text-lg font-medium">€{context.monthlyRevenue?.toLocaleString() || 0}/mo</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Burn</p>
              <p className="text-lg font-medium">€{context.monthlyBurn?.toLocaleString() || 0}/mo</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Team</p>
              <p className="text-lg font-medium">{context.teamSize || 0} people</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Goal</p>
              <p className="text-lg font-medium capitalize">{context.strategicGoal || 'Not set'}</p>
            </div>
          </div>
          {context.activeProjects && context.activeProjects.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-800">
              <p className="text-sm text-gray-400 mb-2">Active Projects</p>
              <div className="flex flex-wrap gap-2">
                {context.activeProjects.map((project, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-gray-800 rounded-full text-sm"
                  >
                    {project}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color = "text-white",
}: {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
}) {
  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          <p className="text-sm text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const color =
    confidence >= 70
      ? "bg-green-600"
      : confidence >= 40
      ? "bg-yellow-600"
      : "bg-red-600";

  return (
    <span className={`px-3 py-1 ${color} rounded-full text-sm font-medium`}>
      {confidence}% confident
    </span>
  );
}
