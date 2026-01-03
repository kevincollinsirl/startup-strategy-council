import Link from "next/link";
import { getDecisions } from "@/lib/storage";
import DecisionCard from "@/components/DecisionCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DecisionsPage() {
  const decisions = await getDecisions();
  const sortedDecisions = [...decisions].reverse(); // Most recent first

  const pendingCount = decisions.filter((d) => !d.evaluation).length;
  const evaluatedCount = decisions.filter((d) => d.evaluation).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Decision History</h1>
          <p className="text-muted-foreground">
            {decisions.length} total decisions · {evaluatedCount} evaluated · {pendingCount} pending
          </p>
        </div>
        <Button asChild>
          <Link href="/decisions/new">
            <Plus className="mr-2 h-4 w-4" />
            New Decision
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({decisions.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="evaluated">Evaluated ({evaluatedCount})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Decision List */}
      {sortedDecisions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No decisions yet</p>
            <Button variant="link" asChild>
              <Link href="/decisions/new">
                Create your first decision
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
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
