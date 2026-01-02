import { getMarketData } from "@/lib/storage";
import CompetitorCard from "@/components/CompetitorCard";
import MarketMetrics from "@/components/MarketMetrics";

export const dynamic = "force-dynamic";

export default async function MarketPage() {
  const marketData = await getMarketData();

  const highThreats = marketData.competitors.filter((c) => c.threat === "high").length;
  const mediumThreats = marketData.competitors.filter((c) => c.threat === "medium").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Market Intelligence</h1>
        <p className="text-gray-400">
          Track market size, competitors, and trends
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Competitors"
          value={marketData.competitors.length.toString()}
        />
        <StatCard
          label="High Threats"
          value={highThreats.toString()}
          color="text-red-400"
        />
        <StatCard
          label="Medium Threats"
          value={mediumThreats.toString()}
          color="text-yellow-400"
        />
        <StatCard
          label="Market Trends"
          value={marketData.marketTrends.length.toString()}
          color="text-blue-400"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Market Metrics */}
        <MarketMetrics
          tam={marketData.tam}
          sam={marketData.sam}
          som={marketData.som}
        />

        {/* Market Trends */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Market Trends</h2>
          {marketData.marketTrends.length === 0 ? (
            <p className="text-gray-400 text-sm">No trends tracked yet</p>
          ) : (
            <ul className="space-y-3">
              {marketData.marketTrends.map((trend, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg"
                >
                  <span className="text-blue-400 mt-0.5">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-sm text-gray-300">{trend}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Competitors */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Competitors</h2>
        {marketData.competitors.length === 0 ? (
          <div className="bg-gray-900 rounded-lg p-12 text-center">
            <p className="text-gray-400">No competitors tracked yet</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {marketData.competitors.map((competitor) => (
              <CompetitorCard key={competitor.id} competitor={competitor} />
            ))}
          </div>
        )}
      </div>

      {/* Competitive Landscape */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Market Share Distribution</h2>
        <div className="space-y-3">
          {marketData.competitors
            .sort((a, b) => b.marketShare - a.marketShare)
            .map((competitor) => {
              const threatColor = {
                low: "bg-green-600",
                medium: "bg-yellow-600",
                high: "bg-red-600",
              }[competitor.threat];

              return (
                <div key={competitor.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 ${threatColor} rounded-full`} />
                      <span className="text-sm text-gray-300">{competitor.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{competitor.marketShare}%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${threatColor} rounded-full`}
                      style={{ width: `${competitor.marketShare}%` }}
                    />
                  </div>
                </div>
              );
            })}

          {/* Our position */}
          <div className="pt-3 mt-3 border-t border-gray-800">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full" />
                <span className="text-sm text-white font-medium">Echofold (Target)</span>
              </div>
              <span className="text-sm text-blue-400">
                {((marketData.som / marketData.tam) * 100).toFixed(2)}%
              </span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                style={{ width: `${Math.max((marketData.som / marketData.tam) * 100, 0.5)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color = "text-white",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
