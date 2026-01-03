import Link from "next/link";
import { getDecisions, getContext, getArms, getMarketData } from "@/lib/storage";
import ResourceHeatmap from "@/components/ResourceHeatmap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  Target,
  DollarSign,
  Building2,
  Plus,
  Settings,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Users,
  Flame,
  Goal,
} from "lucide-react";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {context.companyName || "Your Company"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Decisions"
          value={decisions.length}
          icon={ClipboardList}
        />
        <StatCard
          label="Avg Confidence"
          value={`${avgConfidence}%`}
          icon={Target}
        />
        <StatCard
          label="Net Profit"
          value={`€${netProfit.toLocaleString()}`}
          icon={DollarSign}
          trend={netProfit > 0 ? "up" : netProfit < 0 ? "down" : undefined}
        />
        <StatCard
          label="Active Arms"
          value={`${activeArms}/${arms.length}`}
          icon={Building2}
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/decisions/new">
            <Plus className="mr-2 h-4 w-4" />
            New Decision
          </Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/context">
            <Settings className="mr-2 h-4 w-4" />
            Update Context
          </Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/arms">
            <Building2 className="mr-2 h-4 w-4" />
            Manage Arms
          </Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/market">
            <Target className="mr-2 h-4 w-4" />
            Market Intel
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Decisions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Decisions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentDecisions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No decisions yet</p>
                <Button variant="link" asChild>
                  <Link href="/decisions/new">
                    Create your first decision
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentDecisions.map((decision) => (
                  <Link
                    key={decision.id}
                    href={`/decisions/${decision.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                  >
                    <div>
                      <h3 className="font-medium">{decision.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(decision.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {decision.evaluation ? (
                      <ConfidenceBadge confidence={decision.evaluation.confidence} />
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Business Arms Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Business Arms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-xl font-bold">
                  €{totalRevenue.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Costs</p>
                <p className="text-xl font-bold">
                  €{totalCosts.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {arms.slice(0, 4).map((arm) => {
                const profit = arm.monthlyRevenue - arm.monthlyCosts;
                const statusDot = arm.status === "active" ? "bg-emerald-500" : arm.status === "paused" ? "bg-amber-500" : "bg-muted-foreground";
                return (
                  <div
                    key={arm.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${statusDot}`} />
                      <span>{arm.name}</span>
                    </div>
                    <span className="text-muted-foreground">
                      €{profit.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
            <Button variant="link" className="w-full mt-4" asChild>
              <Link href="/arms">
                View all arms
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Resource Allocation */}
      <ResourceHeatmap arms={arms} />

      {/* Market Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Market Overview</CardTitle>
          <Button variant="link" size="sm" asChild>
            <Link href="/market">
              View details
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">TAM</p>
              <p className="text-lg font-medium">${(marketData.tam / 1_000_000_000).toFixed(1)}B</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">SAM</p>
              <p className="text-lg font-medium">${(marketData.sam / 1_000_000_000).toFixed(1)}B</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">SOM</p>
              <p className="text-lg font-medium">${(marketData.som / 1_000_000).toFixed(1)}M</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Competitors ({marketData.competitors.length})</p>
            <div className="flex flex-wrap gap-2">
              {marketData.competitors.slice(0, 5).map((comp) => {
                const threatDot = comp.threat === "high" ? "bg-red-500" : comp.threat === "medium" ? "bg-amber-500" : "bg-emerald-500";
                return (
                  <Badge key={comp.id} variant="secondary" className="gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${threatDot}`} />
                    {comp.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Context Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Company Context</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <DollarSign className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="font-medium">€{context.monthlyRevenue?.toLocaleString() || 0}/mo</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <Flame className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Burn</p>
                <p className="font-medium">€{context.monthlyBurn?.toLocaleString() || 0}/mo</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <Users className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Team</p>
                <p className="font-medium">{context.teamSize || 0} people</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <Goal className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Goal</p>
                <p className="font-medium capitalize">{context.strategicGoal || 'Not set'}</p>
              </div>
            </div>
          </div>
          {context.activeProjects && context.activeProjects.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Active Projects</p>
              <div className="flex flex-wrap gap-2">
                {context.activeProjects.map((project, i) => (
                  <Badge key={i} variant="secondary">
                    {project}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: "up" | "down";
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold">
              {value}
            </p>
            <div className="flex items-center gap-1">
              <p className="text-sm text-muted-foreground">{label}</p>
              {trend && (
                <span className={`w-2 h-2 rounded-full ${trend === "up" ? "bg-emerald-500" : "bg-red-500"}`} />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const dot = confidence >= 70 ? "bg-emerald-500" : confidence >= 40 ? "bg-amber-500" : "bg-red-500";

  return (
    <Badge variant="secondary" className="gap-1.5">
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      {confidence}%
    </Badge>
  );
}
