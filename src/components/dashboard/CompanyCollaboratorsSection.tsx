import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import { 
  Users, 
  Plus,
  Eye,
  UserPlus,
  Calendar,
  Briefcase
} from 'lucide-react';
import { Collaborator, CollaboratorType } from '@/types/CollaboratorTypes';
import { useNavigate } from 'react-router-dom';
import { collaboratorService } from '@/services/api/collaboratorService';
import { useState, useEffect } from 'react';

interface CompanyCollaboratorsSectionProps {
  companyId: string;
}

export const CompanyCollaboratorsSection: React.FC<CompanyCollaboratorsSectionProps> = ({ companyId }) => {
  const navigate = useNavigate();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollaborators = async () => {
      try {
        setIsLoading(true);
        const data = await collaboratorService.getCollaboratorsByCompany(companyId);
        setCollaborators(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des collaborateurs');
      } finally {
        setIsLoading(false);
      }
    };

    if (companyId) {
      fetchCollaborators();
    }
  }, [companyId]);

  const getTypeColor = (type?: CollaboratorType) => {
    switch (type) {
      case CollaboratorType.EMPLOYEE:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case CollaboratorType.WORKER:
        return 'bg-green-100 text-green-800 border-green-200';
      case CollaboratorType.FREELANCE:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case CollaboratorType.INTERN:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case CollaboratorType.STUDENT:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type?: CollaboratorType) => {
    switch (type) {
      case CollaboratorType.EMPLOYEE:
        return 'Employé';
      case CollaboratorType.WORKER:
        return 'Ouvrier';
      case CollaboratorType.FREELANCE:
        return 'Freelance';
      case CollaboratorType.INTERN:
        return 'Stagiaire';
      case CollaboratorType.STUDENT:
        return 'Étudiant';
      default:
        return 'Non défini';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleViewCollaborator = (collaboratorId: string) => {
    navigate(`/collaborators/${collaboratorId}`);
  };

  const handleCreateCollaborator = () => {
    navigate(`/collaborators/create?companyId=${companyId}`);
  };

  const handleViewAllCollaborators = () => {
    navigate(`/collaborators?companyId=${companyId}`);
  };

  // Get recent collaborators (last 30 days)
  const recentCollaborators = collaborators.filter(collaborator => {
    const entryDate = new Date(collaborator.serviceEntryDate);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return entryDate >= thirtyDaysAgo;
  });

  const CollaboratorItem: React.FC<{ collaborator: Collaborator }> = ({ collaborator }) => (
    <div className="p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-900">
            {collaborator.firstName} {collaborator.lastName}
          </h4>
          {collaborator.type && (
            <Badge variant="outline" className={getTypeColor(collaborator.type)}>
              {getTypeLabel(collaborator.type)}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewCollaborator(collaborator.id)}
          className="h-8 w-8 p-0"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="text-sm text-gray-600 space-y-1">
        {collaborator.jobFunction && (
          <div className="flex items-center gap-1">
            <Briefcase className="h-3 w-3" />
            <span>{collaborator.jobFunction}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>Entrée: {formatDate(collaborator.serviceEntryDate)}</span>
        </div>
        {collaborator.nationalNumber && (
          <div className="text-xs text-gray-500">
            N° National: {collaborator.nationalNumber}
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card className="flex flex-col h-full">
        <CardContent className="flex items-center justify-center h-32">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 flex flex-col h-full">
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-red-600 text-center">
            <p>Erreur: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-700">
          <Users className="h-5 w-5" />
          <span>Collaborateurs ({collaborators.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 bg-blue-50 rounded border border-blue-200">
            <div className="text-lg font-bold text-blue-700">{collaborators.length}</div>
            <div className="text-xs text-blue-600">Total</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded border border-green-200">
            <div className="text-lg font-bold text-green-700">{recentCollaborators.length}</div>
            <div className="text-xs text-green-600">Nouveaux (30j)</div>
          </div>
        </div>

        {/* Liste des collaborateurs récents */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2 text-sm">
            <UserPlus className="h-4 w-4" />
            Collaborateurs récents
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentCollaborators.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Aucun nouveau collaborateur</p>
              </div>
            ) : (
              recentCollaborators.slice(0, 3).map((collaborator) => (
                <CollaboratorItem key={collaborator.id} collaborator={collaborator} />
              ))
            )}
          </div>
        </div>

        {/* Répartition par type */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2 text-sm">
            <Briefcase className="h-4 w-4" />
            Répartition par type
          </h4>
          <div className="space-y-1">
            {Object.values(CollaboratorType).map(type => {
              const count = collaborators.filter(c => c.type === type).length;
              if (count === 0) return null;
              
              return (
                <div key={type} className="flex items-center justify-between text-sm">
                  <Badge variant="outline" className={`${getTypeColor(type)} text-xs`}>
                    {getTypeLabel(type)}
                  </Badge>
                  <span className="font-semibold">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
