import Link from "next/link";
import { Decision } from "@/lib/types";
import RankingBadge from "./RankingBadge";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Calendar, ListChecks } from "lucide-react";

interface DecisionCardProps {
  decision: Decision;
}

export default function DecisionCard({ decision }: DecisionCardProps) {
  const recommendedOption = decision.evaluation
    ? decision.options.find((o) => o.id === decision.evaluation?.recommendedOptionId)
    : null;

  return (
    <Link href={`/decisions/${decision.id}`}>
      <Card className="hover:bg-accent transition-colors">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-medium mb-1">
                {decision.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {decision.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(decision.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <ListChecks className="h-3 w-3" />
                  {decision.options.length} options
                </span>
                {recommendedOption && (
                  <span className="text-primary flex items-center gap-1">
                    <ChevronRight className="h-3 w-3" />
                    {recommendedOption.name}
                  </span>
                )}
              </div>
            </div>
            <RankingBadge
              confidence={decision.evaluation?.confidence}
              outcome={decision.outcome}
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
