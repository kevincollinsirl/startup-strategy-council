"use client";

import { BusinessArm } from "@/lib/types";

interface ResourceHeatmapProps {
  arms: BusinessArm[];
}

export default function ResourceHeatmap({ arms }: ResourceHeatmapProps) {
  const totalHours = arms.reduce((sum, a) => sum + a.timeInvestmentHours, 0);
  const FOUNDER_CAPACITY = 160; // hours per month

  // Sort by time investment
  const sortedArms = [...arms]
    .filter((a) => a.timeInvestmentHours > 0)
    .sort((a, b) => b.timeInvestmentHours - a.timeInvestmentHours);

  // Calculate efficiency (strategic value per hour)
  const withEfficiency = sortedArms.map((arm) => ({
    ...arm,
    efficiency: arm.timeInvestmentHours > 0 ? arm.strategicValue / arm.timeInvestmentHours : 0,
    percentage: totalHours > 0 ? (arm.timeInvestmentHours / totalHours) * 100 : 0,
  }));

  // Identify bottlenecks (high time, low value)
  const bottlenecks = withEfficiency.filter(
    (arm) => arm.timeInvestmentHours > 20 && arm.strategicValue < 6
  );

  // Calculate capacity usage
  const capacityUsed = (totalHours / FOUNDER_CAPACITY) * 100;
  const isOverCapacity = capacityUsed > 100;

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Resource Allocation</h3>

      {/* Capacity Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Founder Capacity Usage</span>
          <span
            className={`text-sm font-medium ${
              isOverCapacity ? "text-red-400" : capacityUsed > 80 ? "text-yellow-400" : "text-green-400"
            }`}
          >
            {totalHours}h / {FOUNDER_CAPACITY}h ({capacityUsed.toFixed(0)}%)
          </span>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isOverCapacity
                ? "bg-red-600"
                : capacityUsed > 80
                ? "bg-yellow-600"
                : "bg-green-600"
            }`}
            style={{ width: `${Math.min(capacityUsed, 100)}%` }}
          />
          {isOverCapacity && (
            <div
              className="h-full bg-red-500/50 -mt-3 animate-pulse"
              style={{ width: `${Math.min(capacityUsed - 100, 50)}%`, marginLeft: "100%" }}
            />
          )}
        </div>
        {isOverCapacity && (
          <p className="text-xs text-red-400 mt-1">Over capacity by {totalHours - FOUNDER_CAPACITY}h</p>
        )}
      </div>

      {/* Heatmap Grid */}
      <div className="space-y-3 mb-6">
        {withEfficiency.map((arm) => {
          // Color based on efficiency
          const heatColor = getHeatColor(arm.efficiency);

          return (
            <div key={arm.id} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded ${heatColor}`}
                    title={`Efficiency: ${arm.efficiency.toFixed(2)} value/hour`}
                  />
                  <span className="text-sm text-gray-300">{arm.name}</span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      arm.status === "active"
                        ? "bg-green-600/20 text-green-400"
                        : arm.status === "paused"
                        ? "bg-yellow-600/20 text-yellow-400"
                        : "bg-blue-600/20 text-blue-400"
                    }`}
                  >
                    {arm.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-500">
                    {arm.timeInvestmentHours}h ({arm.percentage.toFixed(0)}%)
                  </span>
                  <span className="text-gray-400">Value: {arm.strategicValue}/10</span>
                </div>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${heatColor} rounded-full transition-all`}
                  style={{ width: `${arm.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottlenecks Warning */}
      {bottlenecks.length > 0 && (
        <div className="p-4 bg-red-900/20 border border-red-800/50 rounded-lg">
          <h4 className="text-sm font-medium text-red-400 mb-2">Potential Inefficiencies</h4>
          <ul className="space-y-1">
            {bottlenecks.map((arm) => (
              <li key={arm.id} className="text-sm text-gray-300">
                <span className="text-red-400">{arm.name}</span>: {arm.timeInvestmentHours}h/month but
                only {arm.strategicValue}/10 strategic value
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 mb-2">Efficiency (Strategic Value per Hour)</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-600" />
            <span className="text-xs text-gray-400">Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-yellow-600" />
            <span className="text-xs text-gray-400">Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-600" />
            <span className="text-xs text-gray-400">High</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getHeatColor(efficiency: number): string {
  if (efficiency < 0.1) return "bg-red-600";
  if (efficiency < 0.2) return "bg-orange-600";
  if (efficiency < 0.3) return "bg-yellow-600";
  if (efficiency < 0.5) return "bg-lime-600";
  return "bg-green-600";
}
