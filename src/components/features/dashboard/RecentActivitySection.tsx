import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGlobalStats } from '@/hooks/useGlobalStats';
import { useDimonasInProgress } from '@/hooks/useDimonasInProgress';
import { useDimonasToSend } from '@/hooks/useDimonasToSend';
import { useNotifications } from '@/hooks/useNotifications';
import { 
  Clock, 
  FileText, 
  Users, 
  Building2,
  TrendingUp,
  AlertCircle,
  Bell
} from 'lucide-react';
import { DimonaDto, DimonaStatus, DimonaType } from '@/types/DimonaTypes';

export const RecentActivitySection: React.FC = () => {
  const { stats, isLoading: statsLoading } = useGlobalStats();
  const { dimonas: inProgressDimonas, isLoading: inProgressLoading } = useDimonasInProgress();
  const { dimonas: toSendDimonas, isLoading: toSendLoading } = useDimonasToSend();
  const { notifications, isLoading: notificationsLoading } = useNotifications({ mode: 'dashboard' });

  const isLoading = statsLoading || inProgressLoading || toSendLoading || notificationsLoading;


  // Combine and sort recent dimonas by entry date
  const allRecentDimonas = [...(inProgressDimonas || []), ...(toSendDimonas || [])]
    .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())
    .slice(0, 8); // Show only the 8 most recent

  const getStatusColor = (status: DimonaStatus) => {
    switch (status) {
      case DimonaStatus.TO_SEND:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case DimonaStatus.IN_PROGRESS:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case DimonaStatus.REJECTED:
        return 'bg-red-100 text-red-800 border-red-200';
      case DimonaStatus.ACCEPTED:
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: DimonaType) => {
    switch (type) {
      case DimonaType.IN:
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case DimonaType.OUT:
        return <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />;
      case DimonaType.UPDATE:
        return <FileText className="h-3 w-3 text-blue-600" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const getTypeLabel = (type: DimonaType) => {
    switch (type) {
      case DimonaType.IN:
        return 'Entrée';
      case DimonaType.OUT:
        return 'Sortie';
      case DimonaType.UPDATE:
        return 'Modification';
      default:
        return type;
    }
  };

  const getStatusLabel = (status: DimonaStatus) => {
    switch (status) {
      case DimonaStatus.TO_SEND:
        return 'À envoyer';
      case DimonaStatus.IN_PROGRESS:
        return 'En cours';
      case DimonaStatus.REJECTED:
        return 'Rejetée';
      case DimonaStatus.ACCEPTED:
        return 'Acceptée';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Il y a moins d\'1h';
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) {
        return 'Hier';
      } else if (diffInDays < 7) {
        return `Il y a ${diffInDays} jours`;
      } else {
        return date.toLocaleDateString('fr-FR', { 
          day: 'numeric', 
          month: 'short' 
        });
      }
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <Clock className="h-5 w-5" />
          Activité récente
        </CardTitle>
      </CardHeader>
      <CardContent>

        {/* Recent activity - Combined dimonas and notifications */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
            {/* Recent notifications */}
            {notifications && notifications.slice(0, 3).map((notification) => (
              <div key={`notif-${notification.id}`} className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Bell className="h-3 w-3 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-blue-900 truncate">
                      Notification
                    </div>
                    <div className="text-xs text-blue-600 truncate">
                      {notification.message}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {!notification.read && (
                    <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                      Nouveau
                    </Badge>
                  )}
                  <span className="text-xs text-blue-400">
                    {formatDate(notification.createdAt)}
                  </span>
                </div>
              </div>
            ))}

            {/* Recent dimonas */}
            {allRecentDimonas.slice(0, 4).map((dimona) => (
              <div key={`dimona-${dimona.id}`} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {getTypeIcon(dimona.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {getTypeLabel(dimona.type)}
                      </span>
                      {dimona.errorMessage && (
                        <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      Réf: {dimona.onssReference}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <Badge variant="outline" className={`text-xs ${getStatusColor(dimona.status)}`}>
                    {getStatusLabel(dimona.status)}
                  </Badge>
                  <span className="text-xs text-gray-400">
                    {formatDate(dimona.entryDate)}
                  </span>
                </div>
              </div>
            ))}

            {(!notifications || notifications.length === 0) && allRecentDimonas.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <Clock className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune activité récente</p>
              </div>
            )}
        </div>

      </CardContent>
    </Card>
  );
};
