import { Clock, User, FileText, CheckCircle, XCircle, AlertCircle, Send, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/layout/LoadingSpinner";
import { DimonaStatus } from "@/types/DimonaTypes";
import { getStatusBadge } from "@/utils/dimonaUtils";
import { useStatusHistory } from "@/hooks/useStatusHistory";

interface StatusHistoryProps {
  dimonaId: string;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case DimonaStatus.TO_CONFIRM:
      return <Eye className="h-4 w-4" />;
    case DimonaStatus.TO_SEND:
      return <Send className="h-4 w-4" />;
    case DimonaStatus.IN_PROGRESS:
      return <Clock className="h-4 w-4" />;
    case DimonaStatus.ACCEPTED:
      return <CheckCircle className="h-4 w-4" />;
    case DimonaStatus.REJECTED:
      return <XCircle className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case DimonaStatus.TO_CONFIRM:
      return "bg-orange-50 text-orange-700 border-orange-200";
    case DimonaStatus.TO_SEND:
      return "bg-blue-50 text-blue-700 border-blue-200";
    case DimonaStatus.IN_PROGRESS:
      return "bg-purple-50 text-purple-700 border-purple-200";
    case DimonaStatus.ACCEPTED:
      return "bg-green-50 text-green-700 border-green-200";
    case DimonaStatus.REJECTED:
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case DimonaStatus.TO_CONFIRM:
      return "En attente de confirmation";
    case DimonaStatus.TO_SEND:
      return "Prête à être envoyée";
    case DimonaStatus.IN_PROGRESS:
      return "En cours de traitement";
    case DimonaStatus.ACCEPTED:
      return "Acceptée par l'ONSS";
    case DimonaStatus.REJECTED:
      return "Rejetée par l'ONSS";
    default:
      return status;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString("fr-BE"),
    time: date.toLocaleTimeString("fr-BE", { 
      hour: "2-digit", 
      minute: "2-digit" 
    })
  };
};

export function StatusHistory({ dimonaId }: StatusHistoryProps) {
  const { history, loading, count } = useStatusHistory(dimonaId);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Historique des statuts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Historique des statuts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            Aucun historique de statut disponible
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Historique des statuts
          <Badge variant="secondary" className="ml-auto">
            {history.length} changement{history.length > 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          <div className="space-y-6">
            {history.map((entry, index) => {
              const { date, time } = formatDate(entry.changedAt);
              const isLatest = index === 0;
              
              return (
                <div key={entry.id} className="relative flex items-start gap-4">
                  {/* Timeline dot */}
                  <div className={`
                    relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2
                    ${getStatusColor(entry.newStatus)}
                    ${isLatest ? 'ring-2 ring-blue-200 ring-offset-2' : ''}
                  `}>
                    {getStatusIcon(entry.newStatus)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusBadge(entry.newStatus as any)}
                            {isLatest && (
                              <Badge variant="outline" className="text-xs">
                                Actuel
                              </Badge>
                            )}
                          </div>
                          
                          {entry.changeReason && (
                            <div className="flex items-start gap-2 mb-3">
                              <FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-gray-600 italic">
                                "{entry.changeReason}"
                              </p>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{entry.changedByUserName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{date} à {time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {entry.previousStatus && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>Changement de</span>
                            {getStatusBadge(entry.previousStatus as any)}
                            <span>vers</span>
                            {getStatusBadge(entry.newStatus as any)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
