"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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
    <Card>
      <CardHeader>
        <CardTitle>Market Size</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* TAM/SAM/SOM Visual - Single hue circles */}
        <div className="relative">
          <div className="relative h-48 flex items-center justify-center">
            <div className="absolute w-48 h-48 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
              {/* SAM - Middle circle */}
              <div
                className="absolute rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center"
                style={{
                  width: `${Math.max(samPercent * 2, 40)}%`,
                  height: `${Math.max(samPercent * 2, 40)}%`
                }}
              >
                {/* SOM - Inner circle */}
                <div
                  className="absolute rounded-full bg-primary/40 border-2 border-primary"
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
            opacity="opacity-30"
            percent={100}
          />
          <MetricRow
            label="SAM"
            description="Serviceable Addressable Market"
            value={sam}
            opacity="opacity-50"
            percent={samPercent}
          />
          <MetricRow
            label="SOM"
            description="Serviceable Obtainable Market"
            value={som}
            opacity="opacity-100"
            percent={somPercent}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function MetricRow({
  label,
  description,
  value,
  opacity,
  percent,
}: {
  label: string;
  description: string;
  value: number;
  opacity: string;
  percent: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 bg-primary ${opacity} rounded-full`} />
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs text-muted-foreground">{description}</span>
        </div>
        <span className="text-sm font-bold">{formatMoney(value)}</span>
      </div>
      <div className="ml-5">
        <Progress value={percent} className="h-2" />
      </div>
    </div>
  );
}
