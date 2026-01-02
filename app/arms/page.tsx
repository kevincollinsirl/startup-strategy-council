import { getArms } from "@/lib/storage";
import BusinessArmCard from "@/components/BusinessArmCard";

export const dynamic = "force-dynamic";

export default async function ArmsPage() {
  const arms = await getArms();

  const totalRevenue = arms.reduce((sum, a) => sum + a.monthlyRevenue, 0);
  const totalCosts = arms.reduce((sum, a) => sum + a.monthlyCosts, 0);
  const totalTime = arms.reduce((sum, a) => sum + a.timeInvestmentHours, 0);
  const activeCount = arms.filter((a) => a.status === "active").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Business Arms</h1>
        <p className="text-gray-400">
          Track and manage all business verticals
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`€${totalRevenue.toLocaleString()}`} sub="/month" color="text-green-400" />
        <StatCard label="Total Costs" value={`€${totalCosts.toLocaleString()}`} sub="/month" color="text-red-400" />
        <StatCard label="Net Profit" value={`€${(totalRevenue - totalCosts).toLocaleString()}`} sub="/month" color={totalRevenue > totalCosts ? "text-green-400" : "text-red-400"} />
        <StatCard label="Time Investment" value={`${totalTime}h`} sub="/month" />
      </div>

      {/* Active vs Total */}
      <div className="flex gap-4 text-sm">
        <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full">
          {activeCount} Active
        </span>
        <span className="px-3 py-1 bg-yellow-600/20 text-yellow-400 rounded-full">
          {arms.filter((a) => a.status === "paused").length} Paused
        </span>
        <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full">
          {arms.filter((a) => a.status === "planned").length} Planned
        </span>
      </div>

      {/* Arms Grid */}
      {arms.length === 0 ? (
        <div className="bg-gray-900 rounded-lg p-12 text-center">
          <p className="text-gray-400">No business arms configured yet</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {arms.map((arm) => (
            <BusinessArmCard key={arm.id} arm={arm} />
          ))}
        </div>
      )}

      {/* Time Allocation Chart */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Time Allocation</h2>
        <div className="space-y-3">
          {arms
            .filter((a) => a.timeInvestmentHours > 0)
            .sort((a, b) => b.timeInvestmentHours - a.timeInvestmentHours)
            .map((arm) => {
              const percentage = totalTime > 0 ? (arm.timeInvestmentHours / totalTime) * 100 : 0;
              return (
                <div key={arm.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300">{arm.name}</span>
                    <span className="text-sm text-gray-500">{arm.timeInvestmentHours}h ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color = "text-white",
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>
        {value}
        {sub && <span className="text-sm font-normal text-gray-500">{sub}</span>}
      </p>
    </div>
  );
}
