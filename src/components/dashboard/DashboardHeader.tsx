import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, FileUp, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';

interface DashboardHeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onRefresh,
  isRefreshing = false,
}) => {
  const navigate = useNavigate();

  const handleCreateCollaborator = () => {
    navigate(ROUTES.COLLABORATOR_CREATE);
  };

  const handleCreateDimona = () => {
    navigate(ROUTES.CREATE_DIMONA);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-blue-700">
          Dashboard Secrétariat
        </h1>
        <p className="text-slate-500 mt-1">
          Gestion centralisée de ce qui vous intéresse le plus
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
