import React from 'react';

import { useCompanyStats } from '@/hooks/useCompanyStats';
import { useAuth } from '@/context/AuthContext';
import { CompanyCollaboratorsSection, CompanyDashboardHeader, CompanyDimonasSection, CompanyRecentActivitySection, CompanyStatsSection } from '@/components/features/dashboard';

const CompanyDashboard: React.FC = () => {
  const { user } = useAuth();
  const companyId = user?.companyId;
  
  if (!companyId) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h1>
          <p className="text-gray-600">ID d'entreprise manquant dans le profil utilisateur</p>
        </div>
      </div>
    );
  }

  const { refetch: refetchStats } = useCompanyStats(companyId);

  const handleRefresh = () => {
    refetchStats();
    // Force refresh of other components by triggering a re-render
    window.location.reload();
  };

  return (
    <div className="h-screen overflow-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
        {/* Header with actions */}
        <CompanyDashboardHeader 
          companyId={companyId}
          onRefresh={handleRefresh}
        />

        {/* Main content grid - Compact layout */}
        <div className="space-y-4 h-[calc(100vh-140px)]">
          {/* Top row - Company stats spanning full width */}
          <div className="h-auto">
            <CompanyStatsSection companyId={companyId} />
          </div>

          {/* Bottom rows - 3 columns layout for company dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-90">
            {/* Left column - Company Dimonas */}
            <div className="flex flex-col">
              <CompanyDimonasSection companyId={companyId} />
            </div>

            {/* Middle column - Company Collaborators */}
            <div className="flex flex-col">
              <CompanyCollaboratorsSection companyId={companyId} />
            </div>

            {/* Right column - Recent Activity */}
            <div className="flex flex-col">
              <CompanyRecentActivitySection companyId={companyId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
