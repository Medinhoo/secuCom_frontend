import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import { useGlobalStats } from '@/hooks/useGlobalStats';
import { useDimonasInProgress } from '@/hooks/useDimonasInProgress';
import { useDimonasToSend } from '@/hooks/useDimonasToSend';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  FileText, 
  Users, 
  Building2,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Zap
} from 'lucide-react';
import { DimonaDto, DimonaStatus } from '@/types/DimonaTypes';

export const AlertsAndActionsSection: React.FC = () => {
  const navigate = useNavigate();
  const { stats, isLoading: statsLoading } = useGlobalStats();
  const { dimonas: inProgressDimonas, isLoading: inProgressLoading } = useDimonasInProgress();
  const { dimonas: toSendDimonas, isLoading: toSendLoading } = useDimonasToSend();

  const isLoading = statsLoading || inProgressLoading || toSendLoading;

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-32">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  // Get dimonas with errors
  const dimonasWithErrors = [
    ...(inProgressDimonas || []),
    ...(toSendDimonas || [])
  ].filter(dimona => dimona.errorMessage);

  // Get rejected dimonas that need attention
  const rejectedDimonas = [
    ...(inProgressDimonas || []),
    ...(toSendDimonas || [])
  ].filter(dimona => dimona.status === DimonaStatus.REJECTED);

  // Calculate priority alerts
  const alerts = [
    {
      id: 'errors',
      title: 'Dimonas avec erreurs',
      count: dimonasWithErrors.length,
      severity: 'high' as const,
      icon: <XCircle className="h-4 w-4" />,
      color: 'red',
      action: () => navigate('/dimona'),
    },
    {
      id: 'rejected',
      title: 'Dimonas rejetées',
      count: rejectedDimonas.length,
      severity: 'medium' as const,
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'orange',
      action: () => navigate('/dimona'),
    },
    {
      id: 'unread',
      title: 'Notifications non lues',
      count: stats.unreadNotifications,
      severity: 'low' as const,
      icon: <Clock className="h-4 w-4" />,
      color: 'blue',
      action: () => navigate('/notifications'),
    },
  ].filter(alert => alert.count > 0);

  const quickActions = [
    {
      id: 'new-collaborator',
      title: 'Nouveau Collaborateur',
      description: 'Ajouter un collaborateur',
      icon: <Users className="h-4 w-4" />,
      color: 'blue',
      action: () => navigate('/collaborator/create'),
    },
    {
      id: 'new-dimona',
      title: 'Nouvelle Dimona',
      description: 'Créer une déclaration',
      icon: <FileText className="h-4 w-4" />,
      color: 'green',
      action: () => navigate('/dimona/create'),
    },
    {
      id: 'companies',
      title: 'Entreprises',
      description: 'Gérer les entreprises',
      icon: <Building2 className="h-4 w-4" />,
      color: 'purple',
      action: () => navigate('/company'),
    },
    {
      id: 'all-dimonas',
      title: 'Toutes les Dimonas',
      description: 'Voir toutes les déclarations',
      icon: <FileText className="h-4 w-4" />,
      color: 'gray',
      action: () => navigate('/dimona'),
    },
  ];

  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActionColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200';
      case 'green':
        return 'text-green-600 bg-green-50 hover:bg-green-100 border-green-200';
      case 'purple':
        return 'text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-200';
      case 'gray':
        return 'text-gray-600 bg-gray-50 hover:bg-gray-100 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 hover:bg-gray-100 border-gray-200';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <Zap className="h-5 w-5" />
          Alertes & Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alertes prioritaires
            </h4>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={alert.action}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1 rounded ${getSeverityColor(alert.severity)}`}>
                      {alert.icon}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {alert.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        Cliquez pour voir les détails
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                      {alert.count}
                    </Badge>
                    <ExternalLink className="h-3 w-3 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Alerts Message */}
        {alerts.length === 0 && (
          <div className="text-center py-4">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm text-green-600 font-medium">Aucune alerte</p>
            <p className="text-xs text-gray-500">Tout semble en ordre !</p>
          </div>
        )}

        {/* Quick Actions Section */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Actions rapides
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className={`justify-start h-auto p-3 ${getActionColor(action.color)}`}
                onClick={action.action}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="flex-shrink-0">
                    {action.icon}
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium text-sm">
                      {action.title}
                    </div>
                    <div className="text-xs opacity-75">
                      {action.description}
                    </div>
                  </div>
                  <ExternalLink className="h-3 w-3 opacity-50 flex-shrink-0" />
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="font-semibold text-gray-700 mb-3 text-sm">Résumé</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-blue-50 rounded border border-blue-200">
              <div className="text-sm font-bold text-blue-700">{stats.totalDimonas}</div>
              <div className="text-xs text-blue-600">Total dimonas</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded border border-green-200">
              <div className="text-sm font-bold text-green-700">{stats.totalCollaborators}</div>
              <div className="text-xs text-green-600">Collaborateurs</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
