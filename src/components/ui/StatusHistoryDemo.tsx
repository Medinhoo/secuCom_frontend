import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusHistory } from "@/components/ui/StatusHistory";
import { StatusHistoryBadge } from "@/components/ui/StatusHistoryBadge";
import { StatusDropdownWithModal } from "@/components/ui/StatusDropdownWithModal";
import { DimonaStatus } from "@/types/DimonaTypes";
import { getStatusBadge } from "@/utils/dimonaUtils";

interface StatusHistoryDemoProps {
  dimonaId: string;
  currentStatus: DimonaStatus;
}

export function StatusHistoryDemo({ dimonaId, currentStatus }: StatusHistoryDemoProps) {
  const [status, setStatus] = useState(currentStatus);
  const [showHistory, setShowHistory] = useState(false);

  const handleStatusChanged = (newStatus: DimonaStatus) => {
    setStatus(newStatus);
  };

  return (
    <div className="space-y-6">
      {/* Demo Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Démonstration du système d'historique de statuts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Statut actuel:</p>
              {getStatusBadge(status)}
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Historique:</p>
              <StatusHistoryBadge dimonaId={dimonaId} />
            </div>
            
            <div className="flex-1" />
            
            <StatusDropdownWithModal
              dimonaId={dimonaId}
              currentStatus={status}
              onStatusChanged={handleStatusChanged}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? 'Masquer' : 'Afficher'} l'historique
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status History */}
      {showHistory && (
        <StatusHistory dimonaId={dimonaId} />
      )}
    </div>
  );
}
