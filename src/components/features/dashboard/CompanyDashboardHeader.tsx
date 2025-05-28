import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, FileUp, RefreshCw, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCompanyStats } from '@/hooks/useCompanyStats';

interface CompanyDashboardHeaderProps {
  companyId: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const CompanyDashboardHeader: React.FC<CompanyDashboardHeaderProps> = ({
  companyId,
  onRefresh,
  isRefreshing = false,
}) => {
  const navigate = useNavigate();
  const { stats } = useCompanyStats(companyId);

  const handleCreateCollaborator = () => {
    navigate(`/collaborators/create?companyId=${companyId}`);
  };

  const handleCreateDimona = () => {
    navigate(`/dimonas/create?companyId=${companyId}`);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-blue-700 flex items-center gap-2">
          <Building2 className="h-8 w-8" />
          {stats.companyName || 'Dashboard Entreprise'}
        </h1>
        <p className="text-slate-500 mt-1">
          Gestion de vos collaborateurs et déclarations Dimona
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        {/* Refresh button */}
        {onRefresh && (
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="text-blue-600 border-blue-200 hover:bg-blue-50 shadow-sm"
          >
            <RefreshCw 
              className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} 
            />
            Actualiser
          </Button>
        )}
        
        {/* Create Collaborator button */}
        <Button
          variant="outline"
          onClick={handleCreateCollaborator}
          className="text-blue-600 border-blue-200 hover:bg-blue-50 shadow-sm"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Nouveau Collaborateur
        </Button>
        
        {/* Create Dimona button */}
        <Button
          onClick={handleCreateDimona}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          <FileUp className="h-4 w-4 mr-2" />
          Nouvelle Dimona
        </Button>
      </div>
    </div>
  );
};
