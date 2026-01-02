"use client";

import { BusinessArm } from "@/lib/types";

interface BusinessArmCardProps {
  arm: BusinessArm;
  onEdit?: (arm: BusinessArm) => void;
}

export default function BusinessArmCard({ arm, onEdit }: BusinessArmCardProps) {
  const profit = arm.monthlyRevenue - arm.monthlyCosts;
  const profitColor = profit > 0 ? "text-green-400" : profit < 0 ? "text-red-400" : "text-gray-400";

  const statusColors = {
    active: "bg-green-600",
    paused: "bg-yellow-600",
    planned: "bg-blue-600",
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{arm.name}</h3>
          <p className="text-sm text-gray-400 mt-1">{arm.description}</p>
        </div>
        <span className={`px-2 py-1 ${statusColors[arm.status]} rounded text-xs font-medium capitalize`}>
          {arm.status}
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500">Revenue</p>
          <p className="text-lg font-medium text-green-400">
            €{arm.monthlyRevenue.toLocaleString()}/mo
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Costs</p>
          <p className="text-lg font-medium text-red-400">
            €{arm.monthlyCosts.toLocaleString()}/mo
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Net Profit</p>
          <p className={`text-lg font-medium ${profitColor}`}>
            €{profit.toLocaleString()}/mo
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Time Investment</p>
          <p className="text-lg font-medium">{arm.timeInvestmentHours}h/mo</p>
        </div>
      </div>

      {/* Strategic Value Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-gray-500">Strategic Value</p>
          <p className="text-xs font-medium">{arm.strategicValue}/10</p>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all"
            style={{ width: `${arm.strategicValue * 10}%` }}
          />
        </div>
      </div>

      {/* Dependencies */}
      {arm.dependencies.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Dependencies</p>
          <div className="flex flex-wrap gap-1">
            {arm.dependencies.map((dep, i) => (
              <span key={i} className="px-2 py-1 bg-gray-800 rounded text-xs">
                {dep.replace("arm-", "")}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Edit Button */}
      {onEdit && (
        <button
          onClick={() => onEdit(arm)}
          className="mt-4 w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
        >
          Edit
        </button>
      )}
    </div>
  );
}
