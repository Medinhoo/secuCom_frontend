// src/utils/dimonaUtils.ts
import { Badge } from "@/components/ui/badge";
import { Check, AlertCircle, Calendar } from "lucide-react";
import { DimonaStatus, DimonaType } from "@/data/mockData";

// Status badge renderer
export const getStatusBadge = (status: DimonaStatus) => {
  switch (status) {
    case DimonaStatus.ACCEPTED:
      return (
        <Badge
          variant="default"
          className="bg-green-100 text-green-800 hover:bg-green-100"
        >
          <Check className="mr-1 h-3 w-3" /> Acceptée
        </Badge>
      );
    case DimonaStatus.REJECTED:
      return (
        <Badge variant="destructive">
          <AlertCircle className="mr-1 h-3 w-3" /> Rejetée
        </Badge>
      );
    case DimonaStatus.PENDING:
      return (
        <Badge
          variant="outline"
          className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
        >
          <Calendar className="mr-1 h-3 w-3" /> En attente
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};

// Type badge renderer
export const getTypeBadge = (type: DimonaType) => {
  switch (type) {
    case DimonaType.IN:
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-800 hover:bg-blue-100"
        >
          Entrée
        </Badge>
      );
    case DimonaType.OUT:
      return (
        <Badge
          variant="outline"
          className="bg-gray-100 text-gray-800 hover:bg-gray-100"
        >
          Sortie
        </Badge>
      );
    case DimonaType.UPDATE:
      return (
        <Badge
          variant="outline"
          className="bg-purple-100 text-purple-800 hover:bg-purple-100"
        >
          Modification
        </Badge>
      );
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
};
