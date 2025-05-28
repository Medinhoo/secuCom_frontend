import React from 'react';
import { DashboardHeader } from '@/components/features/dashboard/DashboardHeader';
import { GlobalStatsSection } from '@/components/features/dashboard/GlobalStatsSection';
import { RecentActivitySection } from '@/components/features/dashboard/RecentActivitySection';
import { DimonasToSendSection } from '@/components/features/dashboard/DimonasToSendSection';
import { DimonasInProgressSection } from '@/components/features/dashboard/DimonasInProgressSection';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useGlobalStats } from '@/hooks/useGlobalStats';

const SecretariatAdminDashboard: React.FC = () => {
  const { refetch: refetchStats } = useDashboardStats();
  const { refetch: refetchGlobalStats } = useGlobalStats();

  const handleRefresh = () => {
    refetchStats();
    refetchGlobalStats();
  };

  return (
    <div className="h-screen overflow-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
        {/* Header with actions */}
        <DashboardHeader 
          onRefresh={handleRefresh}
        />

        {/* Main content grid - Compact layout */}
        <div className="space-y-4 h-[calc(100vh-140px)]">
          {/* Top row - Global stats spanning full width */}
          <div className="h-auto">
            <GlobalStatsSection />
          </div>

          {/* Bottom rows - 3 columns layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-90">
            {/* Left column - Recent Activity */}
            <div className="flex flex-col">
              <RecentActivitySection />
            </div>

            {/* Middle column - Dimonas IN_PROGRESS */}
            <div className="flex flex-col">
              <DimonasInProgressSection />
            </div>

            {/* Right column - Dimonas TO_SEND */}
            <div className="flex flex-col">
              <DimonasToSendSection />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecretariatAdminDashboard;
