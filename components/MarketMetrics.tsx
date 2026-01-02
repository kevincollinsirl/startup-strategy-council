"use client";

interface MarketMetricsProps {
  tam: number;
  sam: number;
  som: number;
}

function formatMoney(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  } else if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  } else if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value}`;
}

export default function MarketMetrics({ tam, sam, som }: MarketMetricsProps) {
  const samPercent = tam > 0 ? (sam / tam) * 100 : 0;
  const somPercent = tam > 0 ? (som / tam) * 100 : 0;

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-white mb-6">Market Size</h2>

      {/* TAM/SAM/SOM Visual */}
      <div className="relative mb-8">
        {/* TAM - Outer circle */}
        <div className="relative h-48 flex items-center justify-center">
          <div className="absolute w-48 h-48 rounded-full bg-blue-900/30 border-2 border-blue-600 flex items-center justify-center">
            {/* SAM - Middle circle */}
            <div
              className="absolute rounded-full bg-purple-900/40 border-2 border-purple-600 flex items-center justify-center"
              style={{
                width: `${Math.max(samPercent * 2, 40)}%`,
                height: `${Math.max(samPercent * 2, 40)}%`
              }}
            >
              {/* SOM - Inner circle */}
              <div
                className="absolute rounded-full bg-green-600/50 border-2 border-green-500"
                style={{
                  width: `${Math.max(somPercent * 10, 20)}%`,
                  height: `${Math.max(somPercent * 10, 20)}%`,
                  minWidth: '24px',
                  minHeight: '24px'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-4">
        <MetricRow
          label="TAM"
          description="Total Addressable Market"
          value={tam}
          color="bg-blue-600"
          percent={100}
        />
        <MetricRow
          label="SAM"
          description="Serviceable Addressable Market"
          value={sam}
          color="bg-purple-600"
          percent={samPercent}
        />
        <MetricRow
          label="SOM"
          description="Serviceable Obtainable Market"
          value={som}
          color="bg-green-600"
          percent={somPercent}
        />
      </div>
    </div>
  );
}

function MetricRow({
  label,
  description,
  value,
  color,
  percent,
}: {
  label: string;
  description: string;
  value: number;
  color: string;
  percent: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 ${color} rounded-full`} />
          <span className="text-sm font-medium text-white">{label}</span>
          <span className="text-xs text-gray-500">{description}</span>
        </div>
        <span className="text-sm font-bold text-white">{formatMoney(value)}</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden ml-5">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
