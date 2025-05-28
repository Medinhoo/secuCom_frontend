import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { useStatusHistoryCount } from "@/hooks/useStatusHistory";

interface StatusHistoryBadgeProps {
  dimonaId: string;
  className?: string;
}

export function StatusHistoryBadge({ dimonaId, className }: StatusHistoryBadgeProps) {
  const { count, loading } = useStatusHistoryCount(dimonaId);

  if (loading) {
    return (
      <Badge variant="outline" className={className}>
        <Clock className="h-3 w-3 mr-1" />
        ...
      </Badge>
    );
  }

  if (count === 0) {
    return null;
  }

  return (
    <Badge variant="secondary" className={className}>
      <Clock className="h-3 w-3 mr-1" />
      {count} changement{count > 1 ? 's' : ''}
    </Badge>
  );
}
