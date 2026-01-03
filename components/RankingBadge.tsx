import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface RankingBadgeProps {
  confidence?: number;
  outcome?: 'success' | 'failure' | 'pending';
}

export default function RankingBadge({ confidence, outcome }: RankingBadgeProps) {
  if (outcome === 'success') {
    return (
      <Badge variant="secondary" className="gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        Success
      </Badge>
    );
  }

  if (outcome === 'failure') {
    return (
      <Badge variant="secondary" className="gap-1.5">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        Failed
      </Badge>
    );
  }

  if (confidence === undefined) {
    return (
      <Badge variant="secondary" className="gap-1.5">
        <span className="w-2 h-2 rounded-full bg-muted-foreground" />
        Pending
      </Badge>
    );
  }

  if (confidence >= 70) {
    return (
      <Badge variant="secondary" className="gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        Do It ({confidence}%)
      </Badge>
    );
  }

  if (confidence >= 40) {
    return (
      <Badge variant="secondary" className="gap-1.5">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        Maybe ({confidence}%)
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="gap-1.5">
      <span className="w-2 h-2 rounded-full bg-red-500" />
      Don't ({confidence}%)
    </Badge>
  );
}
