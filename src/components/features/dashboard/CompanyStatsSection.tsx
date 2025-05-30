import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCompanyStats } from '@/hooks/useCompanyStats';
import { 
  FileText, 
  Building2, 
  Users, 
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Timer
} from 'lucide-react';

interface CompanyStatsSectionProps {
  companyId: string;
}

export const CompanyStatsSection: React.FC<CompanyStatsSectionProps> = ({ companyId }) => {
  const { stats } = useCompanyStats(companyId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TO_CONFIRM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'TO_SEND':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'TO_CONFIRM':
        return <Clock className="h-4 w-4" />;
      case 'TO_SEND':
        return <TrendingUp className="h-4 w-4" />;
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
      case 'ACCEPTED':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'TO_CONFIRM':
        return 'À confirmer';
      case 'TO_SEND':
        return 'À envoyer';
      case 'IN_PROGRESS':
        return 'En cours';
      case 'REJECTED':
        return 'Rejetées';
      case 'ACCEPTED':
        return 'Acceptées';
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'IN':
        return 'Entrées';
      case 'OUT':
        return 'Sorties';
      case 'UPDATE':
        return 'Modifications';
      default:
        return type;
    }
  };

  const getCollaboratorTypeLabel = (type: string) => {
    switch (type) {
      case 'EMPLOYEE':
        return 'Employés';
      case 'WORKER':
        return 'Ouvriers';
      case 'FREELANCE':
        return 'Freelances';
      case 'INTERN':
        return 'Stagiaires';
      case 'STUDENT':
        return 'Étudiants';
      default:
        return type;
    }
  };

  return (
    <Card className="col-span-full border border-slate-200 shadow-sm bg-slate-50">
      <CardHeader className="border-b-0">
        <CardTitle className="flex items-center gap-2 text-blue-700 text-lg font-bold">
          <Building2 className="h-5 w-5" />
          {stats.companyName} - Vue d'ensemble
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-slate-50">
        {/* Statistiques principales */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-xl font-bold text-blue-700">{stats.totalDimonas}</div>
            <div className="text-sm text-blue-600">Dimonas totales</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-xl font-bold text-green-700">{stats.totalCollaborators}</div>
            <div className="text-sm text-green-600">Collaborateurs</div>
          </div>
          
             {/* Métriques de performance */}
             <div className="text-center p-3 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex items-center justify-center gap-2 text-indigo-700 mb-1">
              <Timer className="h-4 w-4" />
              <span className="text-lg font-bold">{stats.averageProcessingTime} j</span>
            </div>
            <div className="text-sm text-indigo-600">Temps moyen de traitement</div>
        </div>

     

          {stats.dimonasWithErrors > 0 && (
            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center justify-center gap-2 text-red-700 mb-1">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-lg font-bold">{stats.dimonasWithErrors}</span>
              </div>
              <div className="text-sm text-red-600">Dimonas avec erreurs</div>
            </div>
          )}
        </div>

        {/* Détails par statut et type - Version compacte */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Dimonas par statut */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              Par statut
            </h4>
            <div className="space-y-1">
              {Object.entries(stats.dimonasByStatus)
                .filter(([_, count]) => count > 0)
                .map(([status, count]) => (
                <div key={status} className="flex items-center justify-between text-sm">
                  <Badge variant="outline" className={`${getStatusColor(status)} text-xs`}>
                    {getStatusIcon(status)}
                    <span className="ml-1">{getStatusLabel(status)}</span>
                  </Badge>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dimonas par type */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4" />
              Par type
            </h4>
            <div className="space-y-1">
              {Object.entries(stats.dimonasByType)
                .filter(([_, count]) => count > 0)
                .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between text-sm">
                  <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200 text-xs">
                    {getTypeLabel(type)}
                  </Badge>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Collaborateurs par type */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              Collaborateurs
            </h4>
            <div className="space-y-1">
              {Object.entries(stats.collaboratorsByType)
                .filter(([_, count]) => count > 0)
                .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between text-sm">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                    {getCollaboratorTypeLabel(type)}
                  </Badge>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
              {stats.newCollaboratorsThisMonth > 0 && (
                <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                  <div className="text-center">
                    <div className="text-sm font-bold text-green-700">{stats.newCollaboratorsThisMonth}</div>
                    <div className="text-xs text-green-600">Nouveaux ce mois</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
