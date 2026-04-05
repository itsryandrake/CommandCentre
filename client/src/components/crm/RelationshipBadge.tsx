import { differenceInDays, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface RelationshipBadgeProps {
  lastSeen: string;
  cadence: number;
}

export function RelationshipBadge({ lastSeen, cadence }: RelationshipBadgeProps) {
  const daysSince = differenceInDays(new Date(), parseISO(lastSeen));
  const isOverdue = daysSince > cadence;
  const isAtRisk = daysSince > cadence * 1.5;

  if (isAtRisk) {
    return (
      <Badge variant="destructive" className="gap-1.5">
        <span className="size-1.5 rounded-full bg-red-200 animate-pulse" />
        At Risk
      </Badge>
    );
  }

  if (isOverdue) {
    return (
      <Badge className="gap-1.5 bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">
        <span className="size-1.5 rounded-full bg-orange-500" />
        Due
      </Badge>
    );
  }

  return (
    <Badge className="gap-1.5 bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
      <span className="size-1.5 rounded-full bg-green-500" />
      Healthy
    </Badge>
  );
}
