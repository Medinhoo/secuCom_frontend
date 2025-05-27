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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      {/* Dimonas à envoyer / en attente */}
      <Card className="flex flex-col h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Clock className="h-5 w-5" />
            <span>Dimonas à confirmer par l'entreprise ({companyDimonasToConfirm.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
          {loadingToConfirm ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : companyDimonasToConfirm.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Aucune dimona à confirmer</p>
            </div>
          ) : (
            companyDimonasToConfirm.slice(0, 5).map((dimona) => (
              <DimonaItem key={dimona.id} dimona={dimona} />
            ))
          )}
          
          {companyDimonasToConfirm.length > 5 && (
            <div className="text-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/dimonas?companyId=${companyId}&status=TO_CONFIRM`)}
              >
                Voir toutes ({companyDimonasToConfirm.length})
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dimonas en cours */}
      <Card className="flex flex-col h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <Clock className="h-5 w-5" />
            En cours de traitement ({companyDimonasInProgress.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
          {loadingInProgress ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : companyDimonasInProgress.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Aucune dimona en cours</p>
            </div>
          ) : (
            companyDimonasInProgress.slice(0, 5).map((dimona) => (
              <DimonaItem key={dimona.id} dimona={dimona} />
            ))
          )}
          
          {companyDimonasInProgress.length > 5 && (
            <div className="text-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/dimonas?companyId=${companyId}&status=IN_PROGRESS`)}
              >
                Voir toutes ({companyDimonasInProgress.length})
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
