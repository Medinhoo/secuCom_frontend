import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import { useDimonasInProgress } from '@/hooks/useDimonasInProgress';
import { useDimonasToConfirm } from '@/hooks/useDimonasToConfirm';
import { collaboratorService } from '@/services/api/collaboratorService';
import { ROUTES } from '@/config/routes.config';
import { 
  FileText, 
  Clock,
  Eye} from 'lucide-react';
import { DimonaDto, DimonaStatus } from '@/types/DimonaTypes';
import { useNavigate } from 'react-router-dom';

interface CompanyDimonasSectionProps {
  companyId: string;
}

export const CompanyDimonasSection: React.FC<CompanyDimonasSectionProps> = ({ companyId }) => {
  const navigate = useNavigate();
  
  // Use hooks for dimonas
  const { dimonas: dimonasToConfirm, isLoading: loadingToConfirm } = useDimonasToConfirm();
  const { dimonas: dimonasInProgress, isLoading: loadingInProgress } = useDimonasInProgress();

  // Filter dimonas for this company
  const companyDimonasToConfirm = dimonasToConfirm.filter(dimona => dimona.companyId === companyId);
  const companyDimonasInProgress = dimonasInProgress.filter(dimona => dimona.companyId === companyId);

  const getStatusColor = (status: DimonaStatus) => {
    switch (status) {
      case DimonaStatus.TO_CONFIRM:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
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

  const getStatusLabel = (status: DimonaStatus) => {
    switch (status) {
      case DimonaStatus.TO_CONFIRM:
        return 'À confirmer';
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'IN':
        return 'Entrée';
      case 'OUT':
        return 'Sortie';
      case 'UPDATE':
        return 'Modification';
      default:
        return type;
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleViewDimona = (dimonaId: string) => {
    navigate(ROUTES.DIMONA_DETAILS(dimonaId));
  };

  const DimonaItem: React.FC<{ dimona: DimonaDto }> = ({ dimona }) => {
    const [collaboratorName, setCollaboratorName] = useState<string>('Chargement...');

    useEffect(() => {
      const fetchCollaboratorName = async () => {
        try {
          const collaborator = await collaboratorService.getCollaboratorById(dimona.collaboratorId);
          setCollaboratorName(`${collaborator.firstName} ${collaborator.lastName}`);
        } catch (error) {
          setCollaboratorName('Nom non disponible');
        }
      };

      fetchCollaboratorName();
    }, [dimona.collaboratorId]);

    return (
      <div className="flex items-center justify-between p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={getStatusColor(dimona.status)}>
            {getStatusLabel(dimona.status)}
          </Badge>
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            {getTypeLabel(dimona.type)}
          </Badge>
        </div>
        
        <div className="flex-1 mx-4">
          <div className="text-sm font-medium text-gray-900">{collaboratorName}</div>
          <div className="text-xs text-gray-500">{formatDate(dimona.entryDate || dimona.exitDate)}</div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewDimona(dimona.id)}
          className="h-8 w-8 p-0"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <Card className="border border-slate-200 shadow-sm bg-blue-50 flex flex-col h-full">
      <CardHeader className="pb-3 flex-shrink-0 border-b-0">
        <CardTitle className="text-lg font-bold text-blue-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Dimonas
          </div>
          <Badge className="bg-blue-200 text-blue-800">
            {companyDimonasToConfirm.length + companyDimonasInProgress.length} total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-blue-50 flex-1 overflow-hidden">
        <div className="space-y-4 h-full overflow-y-auto">
          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 bg-yellow-50 rounded border border-yellow-200">
              <div className="text-sm font-bold text-yellow-700">{companyDimonasToConfirm.length}</div>
              <div className="text-xs text-yellow-600">À confirmer</div>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded border border-purple-200">
              <div className="text-sm font-bold text-purple-700">{companyDimonasInProgress.length}</div>
              <div className="text-xs text-purple-600">En cours</div>
            </div>
          </div>

          {/* Dimonas à confirmer */}
          {companyDimonasToConfirm.length > 0 && (
            <div>
              <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                À confirmer ({companyDimonasToConfirm.length})
              </h4>
              <div className="space-y-2">
                {loadingToConfirm ? (
                  <div className="flex items-center justify-center h-16">
                    <LoadingSpinner />
                  </div>
                ) : (
                  companyDimonasToConfirm.slice(0, 3).map((dimona) => (
                    <DimonaItem key={dimona.id} dimona={dimona} />
                  ))
                )}
                {companyDimonasToConfirm.length > 3 && (
                  <div className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/dimonas?companyId=${companyId}&status=TO_CONFIRM`)}
                      className="text-xs text-blue-600 hover:bg-blue-100"
                    >
                      +{companyDimonasToConfirm.length - 3} autres
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dimonas en cours */}
          {companyDimonasInProgress.length > 0 && (
            <div>
              <h4 className="font-semibold text-purple-700 mb-2 flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                En cours ({companyDimonasInProgress.length})
              </h4>
              <div className="space-y-2">
                {loadingInProgress ? (
                  <div className="flex items-center justify-center h-16">
                    <LoadingSpinner />
                  </div>
                ) : (
                  companyDimonasInProgress.slice(0, 3).map((dimona) => (
                    <DimonaItem key={dimona.id} dimona={dimona} />
                  ))
                )}
                {companyDimonasInProgress.length > 3 && (
                  <div className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/dimonas?companyId=${companyId}&status=IN_PROGRESS`)}
                      className="text-xs text-purple-600 hover:bg-purple-100"
                    >
                      +{companyDimonasInProgress.length - 3} autres
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty state */}
          {companyDimonasToConfirm.length === 0 && companyDimonasInProgress.length === 0 && !loadingToConfirm && !loadingInProgress && (
            <div className="text-center text-blue-600 py-8">
              <FileText className="h-12 w-12 mx-auto mb-3 text-blue-300" />
              <p className="text-sm mb-1">Aucune dimona en attente</p>
              <p className="text-xs text-blue-500">Toutes vos dimonas sont à jour !</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
