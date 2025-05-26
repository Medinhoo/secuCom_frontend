// src/utils/dimonaUtils.ts
import { Badge } from "@/components/ui/badge";
import { Check, AlertCircle, Clock, Send, FileCheck } from "lucide-react";
import { DimonaStatus, DimonaType } from "@/types/DimonaTypes";

// Status badge renderer with updated colors according to specifications
export const getStatusBadge = (status: DimonaStatus) => {
  switch (status) {
    case DimonaStatus.TO_CONFIRM:
      return (
        <Badge
          variant="outline"
          className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
          style={{ backgroundColor: '#FFF4E6', color: '#FF9500', borderColor: '#FFD1A6' }}
        >
          <FileCheck className="mr-1 h-3 w-3" /> À confirmer
        </Badge>
      );
    case DimonaStatus.TO_SEND:
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
          style={{ backgroundColor: '#F0F8FF', color: '#007AFF', borderColor: '#B3D9FF' }}
        >
          <Send className="mr-1 h-3 w-3" /> À envoyer
        </Badge>
      );
    case DimonaStatus.IN_PROGRESS:
      return (
        <Badge
          variant="outline"
          className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
          style={{ backgroundColor: '#F5F3FF', color: '#5856D6', borderColor: '#C4B5FD' }}
        >
          <Clock className="mr-1 h-3 w-3" /> En cours
        </Badge>
      );
    case DimonaStatus.REJECTED:
      return (
        <Badge
          variant="destructive"
          className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
          style={{ backgroundColor: '#FEF2F2', color: '#FF3B30', borderColor: '#FECACA' }}
        >
          <AlertCircle className="mr-1 h-3 w-3" /> Rejetée
        </Badge>
      );
    case DimonaStatus.ACCEPTED:
      return (
        <Badge
          variant="default"
          className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
          style={{ backgroundColor: '#F0FDF4', color: '#34C759', borderColor: '#BBF7D0' }}
        >
          <Check className="mr-1 h-3 w-3" /> Acceptée
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
